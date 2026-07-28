import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Archive,
  Boxes,
  Edit,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

const normalizeStatus = (product) =>
  product?.stockStatus || (product?.inStock === false ? "out_of_stock" : "in_stock");

const countProductImages = (product) =>
  (product?.colors || []).reduce(
    (total, color) =>
      total +
      (color?.images?.length || 0) +
      (color?.lensOptions || []).reduce(
        (lensTotal, lens) => lensTotal + (lens?.images?.length || 0),
        0,
      ),
    0,
  );

const getVariantCount = (product) =>
  (product?.colors || []).reduce(
    (total, color) => total + 1 + (color?.lensOptions?.length || 0),
    0,
  );

const getPrimaryImage = (product) =>
  product?.colors?.find((color) => color?.images?.[0]?.url)?.images?.[0]?.url ||
  product?.colors
    ?.flatMap((color) => color?.lensOptions || [])
    ?.find((lens) => lens?.images?.[0]?.url)?.images?.[0]?.url ||
  "";

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
    category,
    stock,
    setQuery,
    clearFilters,
  } = useAdminListQuery({
    defaults: { page: 1, limit: 25, search: "", status: "all", category: "all", stock: "all" },
    allowedFilters: ["status", "category", "stock"],
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
      const matchesCategory =
        category === "all" || String(product?.category || "").toLowerCase() === category;
      const matchesStock = stock === "all" || normalizeStatus(product) === stock;
      return matchesSearch && matchesStatus && matchesCategory && matchesStock;
    });
  }, [category, products, search, status, stock]);

  const pagination = paginateAdminItems(filteredProducts, page, limit);

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product?.category).filter(Boolean)),
      ).sort((a, b) => String(a).localeCompare(String(b))),
    [products],
  );

  const catalogStats = useMemo(() => {
    const active = products.filter((product) => product?.isActive !== false).length;
    const inactive = products.length - active;
    const variants = products.reduce((total, product) => total + getVariantCount(product), 0);
    const images = products.reduce((total, product) => total + countProductImages(product), 0);
    const lowStock = products.filter((product) => normalizeStatus(product) === "low_stock").length;
    const outOfStock = products.filter((product) => normalizeStatus(product) === "out_of_stock").length;

    return { active, inactive, variants, images, lowStock, outOfStock };
  }, [products]);

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
    product?.slug
      ? {
          key: "view",
          label: "View storefront",
          icon: Eye,
          onClick: () => window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer"),
        }
      : null,
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
        showClear={Boolean(search || status !== "all" || category !== "all" || stock !== "all")}
        onClear={clearFilters}
        className="border-border/80 bg-card/95 shadow-sm"
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
        <Select value={category} onValueChange={(value) => setQuery({ category: value })}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter products by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={String(option).toLowerCase()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={(value) => setQuery({ stock: value })}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter products by stock status">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </AdminFilterBar>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CatalogMetric
          icon={ShieldCheck}
          label="Active products"
          value={catalogStats.active}
          detail={`${catalogStats.inactive} inactive`}
        />
        <CatalogMetric
          icon={Boxes}
          label="Variants"
          value={catalogStats.variants}
          detail="Color and lens options"
        />
        <CatalogMetric
          icon={ImageIcon}
          label="Images"
          value={catalogStats.images}
          detail="Catalog media assets"
        />
        <CatalogMetric
          icon={SlidersHorizontal}
          label="Stock watch"
          value={catalogStats.lowStock + catalogStats.outOfStock}
          detail={`${catalogStats.lowStock} low, ${catalogStats.outOfStock} out`}
        />
      </section>

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
                <TableHead className="text-right">Pricing</TableHead>
                <TableHead className="hidden xl:table-cell">Catalog</TableHead>
                <TableHead className="hidden lg:table-cell">Inventory</TableHead>
                <TableHead className="hidden md:table-cell">Signals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-14">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </AdminTableHeader>
            <TableBody>
              {pagination.items.map((product) => {
                const image = getPrimaryImage(product);
                const variants = getVariantCount(product);
                const images = countProductImages(product);
                return (
                  <TableRow key={product._id} className="align-middle">
                    <TableCell>
                      <div className="flex min-w-[240px] items-center gap-3">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 shrink-0 rounded-lg border object-cover"
                          />
                        ) : (
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate text-sm font-medium">{product.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {product.category && <Badge variant="secondary">{product.category}</Badge>}
                            {product.type && <Badge variant="outline">{product.type}</Badge>}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground xl:hidden">
                            {product.references || "No reference"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{formatMAD(product.sale_price, { compact: true })}</p>
                      <p className="text-xs text-muted-foreground">
                        Base {formatMAD(product.original_price, { compact: true })}
                      </p>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="space-y-1">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {product.references || "No reference"}
                        </code>
                        <p className="text-xs text-muted-foreground">{product.collection || "No collection"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <StatusBadge status={normalizeStatus(product)} />
                        <p className="text-xs text-muted-foreground">
                          {variants} variants · {images} images
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        {product.views || 0}
                      </div>
                    </TableCell>
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

function CatalogMetric({ icon: Icon, label, value, detail }) {
  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border bg-muted/50 text-muted-foreground">
          {React.createElement(Icon, { className: "h-5 w-5", "aria-hidden": true })}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-normal">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
