import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, Plus, Trash, Package, Search, Filter } from "lucide-react";
import { deleteProduct, getProductsAsAdmin } from "../api/api";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DASHBOARDPRODUCTSNEW } from "../constant/routerConstants";
import { formatMAD } from "../utils/adminFormatting";

const DashboardProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);
  const navigate = useNavigate();

  const getAllProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getProductsAsAdmin();
      setProducts(res?.data?.products || []);
      setFilteredProducts(res?.data?.products || []);
    } catch (error) {
      setError(error?.response?.data?.message || "Products could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.references?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product =>
        statusFilter === "active" ? product?.isActive : !product?.isActive
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, statusFilter, products]);

  const handleDelete = async (product) => {
    setDeleteDialog({ open: true, product });
  };

  const confirmDelete = async () => {
    try {
      setArchiving(true);
      await deleteProduct(deleteDialog.product?._id);
      await getAllProducts();
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      setError(error?.response?.data?.message || error.message || "Failed to archive product");
      setDeleteDialog({ open: false, product: null });
    } finally {
      setArchiving(false);
    }
  };

  const getProductImage = (product) => {
    return product?.colors?.[0]?.images?.[0]?.url || "/api/placeholder/40/40";
  };

  // Function to truncate product name
  const truncateName = (name, maxLength = 30) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-500" />
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link to={DASHBOARDPRODUCTSNEW}>
            <Plus className="h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Unable to load products</p>
          <p className="mt-1">{error}</p>
          <button type="button" onClick={getAllProducts} className="mt-3 rounded bg-red-700 px-3 py-2 text-white">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products by name, reference, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Inactive"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  Active Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  Inactive Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                {filteredProducts.length} of {products.length} products
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="text-right">Prices</TableHead>
                    <TableHead>Colors</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product?._id} className="group">
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden border">
                          <img
                            src={getProductImage(product)}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span 
                            className="font-medium text-sm truncate max-w-[180px]"
                            title={product?.name} // Show full name on hover
                          >
                            {truncateName(product?.name, 25)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            SKU: {product?.references}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium">
                            {formatMAD(product?.sale_price)}
                          </span>
                          {product?.original_price > product?.sale_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatMAD(product?.original_price)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product?.colors?.slice(0, 2).map((color) => (
                            <div
                              key={color._id}
                              className="flex items-center gap-1"
                              title={color.name}
                            >
                              <div
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: color.value }}
                              />
                            </div>
                          ))}
                          {product?.colors?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.colors.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {product?.references}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {product?.type || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product?.isActive ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {product?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <Link to={`/product/${product?.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {product?.canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                navigate(`/admins/dashboard/products/${product?._id}/edit`)
                              }
                              aria-label={`Edit ${product?.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {product?.canArchive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(product)}
                              aria-label={`Archive ${product?.name}`}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">No products found</p>
              <p className="text-xs text-center mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first product"}
              </p>
              <Button asChild>
                <Link to={DASHBOARDPRODUCTSNEW}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Product
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate "{deleteDialog.product?.name}" and remove it from the storefront.
              Historical orders will keep their saved product snapshots and totals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={archiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiving ? "Archiving..." : "Archive Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardProducts;
