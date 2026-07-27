import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Archive, Edit, Eye, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, getProductsAsAdmin } from "@/api/api";
import {
  DASHBOARDHOME,
  DASHBOARDPRODUCTS,
  DASHBOARDPRODUCTSNEW,
} from "@/constant/routerConstants";
import { formatMAD } from "@/utils/adminFormatting";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { paginateAdminItems, useAdminListQuery } from "@/hooks/useAdminListQuery";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import AdminFilterBar, {
  AdminSearchInput,
} from "@/components/admin/filters/AdminFilterBar";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import AdminEmptyState from "@/components/admin/feedback/AdminEmptyState";
import StatusBadge from "@/components/admin/status/StatusBadge";
import AdminConfirmDialog from "@/components/admin/forms/AdminConfirmDialog";
import AdminRowActions from "@/components/admin/table/AdminRowActions";
import AdminTable, {
  AdminTableHeader,
  AdminTableSkeleton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/admin/table/AdminTable";
import AdminTablePagination from "@/components/admin/table/AdminTablePagination";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function DashboardProducts() {
  const navigate = useNavigate();
  const requestId = useRef(0);
  const { hasCapability } = useAdminAuth();
  const canManageProducts = hasCapability("products.manage");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [archiveDialog, setArchiveDialog] = useState({ open: false, product: null });
  const [archiving, setArchiving] = useState(false);
  const {
    page,
    limit,
    search,
    status,
    setQuery,
    clearFilters,
  } = useAdminListQuery({
    defaults: { page: 1, limit: 25, search: "", status: "all" },
    allowedFilters: ["status"],
  });

  useAdminPageMeta({
    title: "Products",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Products", href: DASHBOARDPRODUCTS },
    ],
  });

  const loadProducts = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await getProductsAsAdmin();
      if (currentRequest === requestId.current) {
        setProducts(response?.data?.products ?? []);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(loadError?.response?.data?.message || "Products could not be loaded.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    return () => {
      requestId.current += 1;
    };
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product?.name, product?.references, product?.type].some((value) =>
          String(value ?? "").toLowerCase().includes(normalizedSearch),
        );
      const matchesStatus =
        status === "all" ||
        (status === "active" ? product?.isActive !== false : product?.isActive === false);
      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const pagination = paginateAdminItems(filteredProducts, page, limit);

  useEffect(() => {
    if (page !== pagination.page) setQuery({ page: pagination.page }, { replace: true });
  }, [page, pagination.page, setQuery]);

  const confirmArchive = async () => {
    if (!archiveDialog.product?._id) return;
    setArchiving(true);
    try {
      await deleteProduct(archiveDialog.product._id);
      toast.success("Product archived");
      setArchiveDialog({ open: false, product: null });
      await loadProducts();
    } catch (archiveError) {
      setError(archiveError?.response?.data?.message || "Product could not be archived.");
    } finally {
      setArchiving(false);
    }
  };

  const productActions = (product) => [
    {
      key: "view",
      label: "View storefront",
      icon: Eye,
      onClick: () => window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer"),
    },
    canManageProducts && product?.canEdit !== false
      ? {
          key: "edit",
          label: "Edit",
          icon: Edit,
          onClick: () => navigate(`${DASHBOARDPRODUCTS}/${product._id}/edit`),
        }
      : null,
    canManageProducts && product?.canArchive !== false
      ? { type: "separator" }
      : null,
    canManageProducts && product?.canArchive !== false
      ? {
          key: "archive",
          label: "Archive",
          icon: Archive,
          destructive: true,
          onClick: () => setArchiveDialog({ open: true, product }),
        }
      : null,
  ];

  const primaryAction = canManageProducts ? (
    <Button asChild>
      <Link to={DASHBOARDPRODUCTSNEW}>
        <Plus aria-hidden="true" />
        Add Product
      </Link>
    </Button>
  ) : null;

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog, pricing and availability."
        primaryAction={primaryAction}
      />

      {error && products.length > 0 && (
        <AdminErrorState
          title="The latest products could not be loaded"
          description={error}
          onRetry={loadProducts}
        />
      )}

      <AdminFilterBar
        showClear={Boolean(search || status !== "all")}
        onClear={clearFilters}
      >
        <AdminSearchInput
          id="product-search"
          value={search}
          onChange={(event) => setQuery({ search: event.target.value }, { replace: true })}
          label="Search products"
          placeholder="Search name, reference, or type..."
          className="max-w-xl"
        />
        <Select value={status} onValueChange={(value) => setQuery({ status: value })}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter products by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilterBar>

      {loading && products.length === 0 ? (
        <AdminTableSkeleton rows={6} columns={7} />
      ) : error && products.length === 0 ? (
        <AdminErrorState
          title="We couldn't load products"
          description={error}
          onRetry={loadProducts}
        />
      ) : filteredProducts.length === 0 ? (
        <AdminEmptyState
          icon={Package}
          title={products.length ? "No products match your filters" : "No products found"}
          description={
            products.length
              ? "Adjust or clear the current filters."
              : "Create your first product to start building the catalog."
          }
          action={
            products.length ? (
              <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
            ) : primaryAction
          }
        />
      ) : (
        <>
          <AdminTable ariaLabel="Product catalog">
            <AdminTableHeader sticky>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="hidden lg:table-cell">Reference</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-14">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </AdminTableHeader>
            <TableBody>
              {pagination.items.map((product) => {
                const image = product?.colors?.[0]?.images?.[0]?.url;
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex min-w-[190px] items-center gap-3">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-md border object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {product.references || "No reference"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMAD(product.sale_price, { compact: true })}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {product.references || "—"}
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{product.type || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.isActive === false ? "inactive" : "active"} />
                    </TableCell>
                    <TableCell>
                      <AdminRowActions
                        label={`Open actions for ${product.name}`}
                        items={productActions(product)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </AdminTable>
          <AdminTablePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.limit}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(nextPage) => setQuery({ page: nextPage })}
            onPageSizeChange={(nextLimit) => setQuery({ limit: nextLimit, page: 1 })}
          />
        </>
      )}

      <AdminConfirmDialog
        open={archiveDialog.open}
        onOpenChange={(open) =>
          setArchiveDialog((previous) => ({ open, product: open ? previous.product : null }))
        }
        title="Archive product?"
        description={`This will remove “${archiveDialog.product?.name ?? "this product"}” from the storefront. Historical orders keep their saved product details.`}
        confirmLabel="Archive product"
        onConfirm={confirmArchive}
        loading={archiving}
        destructive
      />
    </AdminPageContainer>
  );
}
