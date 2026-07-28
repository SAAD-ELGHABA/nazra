import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  ImagePlus,
  Languages,
  LoaderCircle,
  Package,
  Palette,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DASHBOARDPRODUCTS } from "../constant/routerConstants";
import { createAdminProduct, getAdminProduct, updateAdminProduct } from "../api/api";
import { uploadImageToCloudinary } from "../utils/cloudinary";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import AdminLoadingState from "@/components/admin/feedback/AdminLoadingState";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import AdminForbiddenState from "@/components/admin/feedback/AdminForbiddenState";
import AdminNotFoundState from "@/components/admin/feedback/AdminNotFoundState";
import {
  FormActions,
  FormErrorSummary,
  FormGrid,
  FormSection,
  FormSectionHeader,
} from "@/components/admin/forms/AdminFormLayout";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_DESCRIPTION = { en: "", fr: "", ar: "" };
const MAX_COLOR_VARIANTS = 50;
const MAX_IMAGES_PER_VARIANT = 20;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

const PRODUCT_TYPES = [
  "Aviator",
  "Wayfarer",
  "Round",
  "Cat-Eye",
  "Sport",
  "Oversized",
  "Shield",
  "Square",
  "Rectangle",
  "Butterfly",
  "Clubmaster",
  "Retro",
  "Gradient",
  "Mirrored",
  "Polarized",
];

const PRODUCT_CATEGORIES = ["Men", "Women", "Mix", "Optical"];
const PRODUCT_GENDERS = ["Men", "Women", "Mix"];

const createEmptyProductData = () => ({
  name: "",
  original_price: "",
  sale_price: "",
  type: "",
  category: "",
  gender: "",
  collection: "",
  frameShape: "",
  compareAtPrice: "",
  uv400: false,
  polarized: false,
  badges: "",
  stockStatus: "in_stock",
  inStock: true,
  sortPriority: "0",
  references: "",
  description: { ...EMPTY_DESCRIPTION },
  colors: [],
});

const createEmptyColor = () => ({
  name: "",
  value: "#111111",
  sku: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  active: true,
  images: [],
});

const isFileImage = (image) => typeof File !== "undefined" && image instanceof File;

const nullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
};

const formatOptionalNumber = (value) => value ?? "";

const hasRequiredValue = (value) => String(value ?? "").trim() !== "";

const normalizeColorForForm = (color) => ({
  ...(color._id ? { _id: color._id } : {}),
  name: color.name || "",
  value: color.value || "#111111",
  sku: formatOptionalNumber(color.sku),
  price: formatOptionalNumber(color.price),
  compareAtPrice: formatOptionalNumber(color.compareAtPrice),
  stock: formatOptionalNumber(color.stock),
  active: color.active !== false,
  images:
    color.images?.map((img) => ({
      ...(img._id ? { _id: img._id } : {}),
      url: img.url,
      public_id: img.public_id,
    })) || [],
  lensOptions:
    color.lensOptions?.map((lens) => ({
      ...(lens._id ? { _id: lens._id } : {}),
      name: lens.name,
      type: lens.type,
      category: lens.category ?? null,
      sku: lens.sku ?? null,
      price: lens.price ?? null,
      compareAtPrice: lens.compareAtPrice ?? null,
      stock: lens.stock ?? null,
      active: lens.active !== false,
      images:
        lens.images?.map((img) => ({
          ...(img._id ? { _id: img._id } : {}),
          url: img.url,
          public_id: img.public_id,
        })) || [],
    })) || [],
});

const AddProducts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const [product, setProduct] = useState(location.state?.product || null);
  const isEditing = Boolean(productId || product?._id);

  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(Boolean(productId));
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [formError, setFormError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const errorSummaryRef = useRef(null);
  const [productData, setProductData] = useState(createEmptyProductData);
  const [newColor, setNewColor] = useState(createEmptyColor);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    if (!productId) return undefined;

    const fetchProduct = async () => {
      try {
        setIsLoadingProduct(true);
        setLoadError("");
        setNotFound(false);
        const response = await getAdminProduct(productId);
        if (active) setProduct(response?.data?.product || null);
      } catch (error) {
        if (!active) return;
        if (error?.response?.status === 404) setNotFound(true);
        else setLoadError(error?.response?.data?.message || "Product could not be loaded.");
      } finally {
        if (active) setIsLoadingProduct(false);
      }
    };

    fetchProduct();
    return () => {
      active = false;
    };
  }, [productId, retryKey]);

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name || "",
        original_price: product.original_price ?? "",
        sale_price: product.sale_price ?? "",
        type: product.type || "",
        category: product.category || "",
        gender: product.gender || "",
        collection: product.collection || "",
        frameShape: product.frameShape || "",
        compareAtPrice: product.compareAtPrice ?? "",
        uv400: product.uv400 === true,
        polarized: product.polarized === true,
        badges: Array.isArray(product.badges) ? product.badges.join(", ") : "",
        stockStatus:
          product.stockStatus ||
          (product.inStock === false ? "out_of_stock" : "in_stock"),
        inStock:
          product.inStock === undefined
            ? product.stockStatus !== "out_of_stock"
            : product.inStock !== false,
        sortPriority: product.sortPriority ?? "0",
        references: product.references || "",
        description: {
          ...EMPTY_DESCRIPTION,
          ...(product.description && typeof product.description === "object"
            ? product.description
            : {}),
        },
        colors: product.colors?.map(normalizeColorForForm) || [],
      });
    } else if (!productId) {
      setProductData(createEmptyProductData());
    }
  }, [product, productId]);

  const pageTitle = isEditing
    ? `Edit ${product?.name || "product"}`
    : "Add Product";

  useAdminPageMeta({
    title: pageTitle,
    documentTitle: pageTitle,
    breadcrumbs: [
      { label: "Products", href: DASHBOARDPRODUCTS },
      { label: isEditing ? "Edit" : "New" },
      ...(isEditing && product?.name ? [{ label: product.name }] : []),
    ],
  });

  const readiness = useMemo(() => {
    const requiredFields = [
      productData.name,
      productData.original_price,
      productData.sale_price,
      productData.type,
      productData.category,
    ];
    const filledRequired = requiredFields.filter((value) => String(value ?? "").trim()).length;
    const hasVariants = productData.colors.length > 0;
    const hasImages = productData.colors.every(
      (color) =>
        color.images.length > 0 ||
        (color.lensOptions || []).some((lens) => (lens.images || []).length > 0),
    );
    const completed = filledRequired + (hasVariants ? 1 : 0) + (hasVariants && hasImages ? 1 : 0);

    return {
      score: Math.round((completed / 7) * 100),
      variants: productData.colors.reduce(
        (total, color) => total + 1 + (color.lensOptions || []).length,
        0,
      ),
      images: productData.colors.reduce(
        (total, color) =>
          total +
          color.images.length +
          (color.lensOptions || []).reduce(
            (lensTotal, lens) => lensTotal + (lens.images || []).length,
            0,
          ),
        0,
      ),
      activeVariants: productData.colors.reduce(
        (total, color) =>
          total +
          (color.active !== false ? 1 : 0) +
          (color.lensOptions || []).filter((lens) => lens.active !== false).length,
        0,
      ),
    };
  }, [productData]);

  const updateProductField = (name, value) => {
    setProductData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "stockStatus" ? { inStock: value !== "out_of_stock" } : {}),
      ...(name === "inStock"
        ? {
            stockStatus: value
              ? prev.stockStatus === "out_of_stock"
                ? "in_stock"
                : prev.stockStatus
              : "out_of_stock",
          }
        : {}),
    }));
    if (formError) setFormError("");
  };

  const handleInputChange = (event) => {
    const { checked, name, type, value } = event.target;
    updateProductField(name, type === "checkbox" ? checked : value);
  };

  const updateColorField = (colorIndex, name, value) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex ? { ...color, [name]: value } : color,
      ),
    }));
    if (formError) setFormError("");
  };

  const showFormError = (message) => {
    setFormError(message);
    window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  const addColorVariant = () => {
    const name = newColor.name.trim();
    const value = newColor.value.trim();
    if (!name) {
      showFormError("Please enter a color name.");
      return;
    }
    if (name.length > 100 || !value || value.length > 100) {
      showFormError("Color names and values must contain between 1 and 100 characters.");
      return;
    }
    if (productData.colors.length >= MAX_COLOR_VARIANTS) {
      showFormError(`A product can have at most ${MAX_COLOR_VARIANTS} color variants.`);
      return;
    }

    setProductData((prev) => ({
      ...prev,
      colors: [...prev.colors, { ...newColor, name, value }],
    }));
    setNewColor(createEmptyColor());
    if (formError) setFormError("");
  };

  const removeColorVariant = (index) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, colorIndex) => colorIndex !== index),
    }));
  };

  const handleImageUpload = (colorIndex, files) => {
    const newImages = Array.from(files || []);
    if (!newImages.length) return;

    const currentImages = productData.colors[colorIndex]?.images || [];
    if (currentImages.length + newImages.length > MAX_IMAGES_PER_VARIANT) {
      showFormError(`Each color variant can contain at most ${MAX_IMAGES_PER_VARIANT} images.`);
      return;
    }

    const invalidType = newImages.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      showFormError(`${invalidType.name} is not a supported image. Use JPEG, PNG, WebP, GIF, or AVIF.`);
      return;
    }

    const invalidSize = newImages.find((file) => file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES);
    if (invalidSize) {
      showFormError(`${invalidSize.name} must be larger than 0 bytes and no more than 10 MB.`);
      return;
    }

    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex
          ? { ...color, images: [...color.images, ...newImages] }
          : color,
      ),
    }));
    if (formError) setFormError("");
  };

  const removeImage = (colorIndex, imageIndex) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex
          ? {
              ...color,
              images: color.images.filter((_, currentImageIndex) => currentImageIndex !== imageIndex),
            }
          : color,
      ),
    }));
  };

  const validateVariantNumbers = () => {
    for (const color of productData.colors) {
      const price = nullableNumber(color.price);
      const compareAtPrice = nullableNumber(color.compareAtPrice);
      const stock = nullableNumber(color.stock);
      if (price !== null && (!Number.isFinite(price) || price < 0)) {
        return "Variant prices must be positive numbers or blank.";
      }
      if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
        return "Variant compare-at prices must be positive numbers or blank.";
      }
      if (stock !== null && (!Number.isSafeInteger(stock) || stock < 0)) {
        return "Variant stock must be a whole number or blank.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmittingRef.current || isUploading) return;
    setFormError("");

    if (
      [
        productData.name,
        productData.original_price,
        productData.sale_price,
        productData.type,
        productData.category,
      ].some((value) => !hasRequiredValue(value))
    ) {
      showFormError("Please fill in all required fields.");
      return;
    }

    const originalPrice = Number(productData.original_price);
    const salePrice = Number(productData.sale_price);
    const compareAtPrice = nullableNumber(productData.compareAtPrice);
    const sortPriority = Number(productData.sortPriority);

    if (!Number.isFinite(originalPrice) || !Number.isFinite(salePrice) || originalPrice < 0 || salePrice < 0) {
      showFormError("Prices must be valid positive numbers or zero.");
      return;
    }

    if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) {
      showFormError("Compare-at price must be a positive number or zero.");
      return;
    }

    if (!Number.isSafeInteger(sortPriority) || sortPriority < -100000 || sortPriority > 100000) {
      showFormError("Sort priority must be a whole number between -100000 and 100000.");
      return;
    }

    const badges = productData.badges
      .split(",")
      .map((badge) => badge.trim())
      .filter(Boolean);

    if (badges.length > 20 || badges.some((badge) => badge.length > 50)) {
      showFormError("Use no more than 20 badges, with a maximum of 50 characters each.");
      return;
    }

    if (productData.colors.length === 0) {
      showFormError("Please add at least one color variant.");
      return;
    }

    const invalidVariant = productData.colors.find(
      (color) =>
        !color.name?.trim() ||
        !color.value?.trim() ||
        color.name.trim().length > 100 ||
        color.value.trim().length > 100,
    );
    if (invalidVariant) {
      showFormError("Every color variant needs a name and value of at most 100 characters.");
      return;
    }

    const variantNumberError = validateVariantNumbers();
    if (variantNumberError) {
      showFormError(variantNumberError);
      return;
    }

    if (productData.colors.some((color) => color.images.length === 0)) {
      showFormError("Please add at least one image for each color variant.");
      return;
    }

    const pendingImageUploads = productData.colors.flatMap((color, colorIndex) =>
      color.images.flatMap((image, imageIndex) =>
        isFileImage(image) ? [{ colorIndex, imageIndex, file: image }] : [],
      ),
    );
    const pendingImages = pendingImageUploads.map(({ file }) => file);
    const invalidStoredImage = productData.colors
      .flatMap((color) => color.images)
      .find((image) => !isFileImage(image) && (!image?.url || !image?.public_id));
    const invalidPendingType = pendingImages.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    const invalidPendingSize = pendingImages.find((file) => file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES);
    if (invalidStoredImage || invalidPendingType || invalidPendingSize) {
      showFormError("One or more images are invalid. Use a supported image format up to 10 MB.");
      return;
    }

    isSubmittingRef.current = true;
    setIsUploading(true);

    try {
      const uploadResults = await Promise.allSettled(
        pendingImageUploads.map(async ({ colorIndex, imageIndex, file }) => {
          const uploadedImage = await uploadImageToCloudinary(file, "product");

          setProductData((previous) => {
            if (previous.colors[colorIndex]?.images[imageIndex] !== file) {
              return previous;
            }

            return {
              ...previous,
              colors: previous.colors.map((color, currentColorIndex) =>
                currentColorIndex === colorIndex
                  ? {
                      ...color,
                      images: color.images.map((image, currentImageIndex) =>
                        currentImageIndex === imageIndex ? uploadedImage : image,
                      ),
                    }
                  : color,
              ),
            };
          });

          return uploadedImage;
        }),
      );

      const fulfilledUploads = new Map();
      uploadResults.forEach((result, uploadIndex) => {
        if (result.status !== "fulfilled") return;
        const { colorIndex, imageIndex } = pendingImageUploads[uploadIndex];
        fulfilledUploads.set(`${colorIndex}:${imageIndex}`, result.value);
      });

      const reconciledColors = productData.colors.map((color, colorIndex) => ({
        ...color,
        images: color.images.map(
          (image, imageIndex) =>
            fulfilledUploads.get(`${colorIndex}:${imageIndex}`) || image,
        ),
      }));

      setProductData((previous) => ({
        ...previous,
        colors: reconciledColors,
      }));

      const failedUpload = uploadResults.find((result) => result.status === "rejected");
      if (failedUpload) throw failedUpload.reason;

      const updatedColors = reconciledColors.map((color) => ({
        ...(color._id ? { _id: color._id } : {}),
        name: color.name.trim(),
        value: color.value.trim(),
        sku: color.sku?.trim() || null,
        price: nullableNumber(color.price),
        compareAtPrice: nullableNumber(color.compareAtPrice),
        stock: nullableNumber(color.stock),
        active: color.active !== false,
        images: color.images,
        lensOptions: (color.lensOptions || []).map((lens) => ({
          ...(lens._id ? { _id: lens._id } : {}),
          name: lens.name,
          type: lens.type,
          category: lens.category ?? null,
          sku: lens.sku ?? null,
          price: lens.price ?? null,
          compareAtPrice: lens.compareAtPrice ?? null,
          stock: lens.stock ?? null,
          active: lens.active !== false,
          images: lens.images || [],
        })),
      }));

      const productDataToSend = {
        ...productData,
        original_price: originalPrice,
        sale_price: salePrice,
        compareAtPrice,
        sortPriority,
        badges,
        colors: updatedColors,
      };

      const response = product?._id
        ? await updateAdminProduct(product._id, productDataToSend)
        : await createAdminProduct(productDataToSend);

      if (response.data.success) {
        toast.success(product?._id ? "Product updated successfully." : "Product added successfully.");
        if (!isEditing) {
          setProductData(createEmptyProductData());
          setNewColor(createEmptyColor());
        }
      } else {
        toast.error("Error while saving product.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error submitting product";
      showFormError(message);
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
      setIsUploading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title={pageTitle} description="Preparing the product editor." />
        <AdminLoadingState title="Loading product" description="Preparing the product editor." />
      </AdminPageContainer>
    );
  }

  if (notFound) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title={pageTitle} description="Manage your product catalog." />
        <AdminNotFoundState
          title="Product not found"
          description="This product may have been removed or archived."
          backHref={DASHBOARDPRODUCTS}
          backLabel="Back to products"
        />
      </AdminPageContainer>
    );
  }

  if (loadError) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title={pageTitle} description="Manage your product catalog." />
        <AdminErrorState
          title="We couldn't load this product"
          description={loadError}
          onRetry={() => setRetryKey((value) => value + 1)}
        />
      </AdminPageContainer>
    );
  }

  if (isEditing && product?.canEdit === false) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title={pageTitle} description="Manage your product catalog." />
        <AdminForbiddenState
          title="You cannot edit this product"
          description="This product is outside your product management scope. A super administrator can update it if needed."
          actionHref={DASHBOARDPRODUCTS}
          actionLabel="Back to products"
        />
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer className="max-w-[1500px]">
      <AdminPageHeader
        title={pageTitle}
        description={
          isEditing
            ? "Update merchandising, pricing, variants and media with a clean audit-friendly editor."
            : "Create a polished catalog item with pricing, merchandising, variants and media."
        }
        primaryAction={
          <Button asChild variant="outline">
            <Link to={DASHBOARDPRODUCTS}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Products
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} aria-busy={isUploading} className="relative">
        {isUploading && (
          <div
            className="absolute inset-0 z-20 grid place-items-center rounded-xl bg-background/75 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-lg">
              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Uploading media and saving product...</span>
            </div>
          </div>
        )}

        <fieldset disabled={isUploading} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <FormErrorSummary ref={errorSummaryRef} id="product-form-error" className="mb-0">
              {formError}
            </FormErrorSummary>

            <FormSection>
              <FormSectionHeader
                title="Essential information"
                description="Name the product and place it in the storefront taxonomy."
              />
              <FormGrid>
                <TextField
                  id="product-name"
                  label="Product name"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                />
                <TextField
                  id="product-reference"
                  label="Reference"
                  name="references"
                  value={productData.references}
                  onChange={handleInputChange}
                  maxLength={500}
                  placeholder="Internal reference or SKU family"
                />
                <SelectField
                  id="product-type"
                  label="Type"
                  value={productData.type}
                  onValueChange={(value) => updateProductField("type", value)}
                  placeholder="Select a type"
                  options={PRODUCT_TYPES}
                  required
                />
                <SelectField
                  id="product-category"
                  label="Category"
                  value={productData.category}
                  onValueChange={(value) => updateProductField("category", value)}
                  placeholder="Select a category"
                  options={PRODUCT_CATEGORIES}
                  required
                />
                <SelectField
                  id="product-gender"
                  label="Gender"
                  value={productData.gender}
                  onValueChange={(value) => updateProductField("gender", value)}
                  placeholder="Use category fallback"
                  options={PRODUCT_GENDERS}
                  allowEmpty
                />
                <TextField
                  id="product-collection"
                  label="Collection"
                  name="collection"
                  value={productData.collection}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="e.g. Atlas"
                />
              </FormGrid>
            </FormSection>

            <FormSection>
              <FormSectionHeader
                title="Pricing and merchandising"
                description="Control price presentation, stock status, badges and storefront feature flags."
              />
              <FormGrid>
                <TextField
                  id="original-price"
                  label="Original price"
                  type="number"
                  name="original_price"
                  value={productData.original_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  suffix="DH"
                  required
                />
                <TextField
                  id="sale-price"
                  label="Sale price"
                  type="number"
                  name="sale_price"
                  value={productData.sale_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  suffix="DH"
                  required
                />
                <TextField
                  id="compare-at-price"
                  label="Compare-at price"
                  type="number"
                  name="compareAtPrice"
                  value={productData.compareAtPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  suffix="DH"
                  placeholder="Optional"
                />
                <TextField
                  id="sort-priority"
                  label="Sort priority"
                  type="number"
                  name="sortPriority"
                  value={productData.sortPriority}
                  onChange={handleInputChange}
                  min="-100000"
                  max="100000"
                  step="1"
                  description="Higher values are promoted first when the Store uses priority."
                />
                <SelectField
                  id="stock-status"
                  label="Stock status"
                  value={productData.stockStatus}
                  onValueChange={(value) => updateProductField("stockStatus", value)}
                  options={[
                    { label: "In stock", value: "in_stock" },
                    { label: "Low stock", value: "low_stock" },
                    { label: "Out of stock", value: "out_of_stock" },
                  ]}
                />
                <TextField
                  id="frame-shape"
                  label="Frame shape"
                  name="frameShape"
                  value={productData.frameShape}
                  onChange={handleInputChange}
                  maxLength={100}
                  placeholder="e.g. Round"
                />
                <div className="sm:col-span-2">
                  <TextField
                    id="product-badges"
                    label="Badges"
                    name="badges"
                    value={productData.badges}
                    onChange={handleInputChange}
                    placeholder="New, Best Seller"
                    description="Separate up to 20 badges with commas; each badge may contain up to 50 characters."
                  />
                </div>
                <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
                  <ToggleCard
                    label="Available for purchase"
                    checked={productData.inStock}
                    onChange={(checked) => updateProductField("inStock", checked)}
                  />
                  <ToggleCard
                    label="UV400 protection"
                    checked={productData.uv400}
                    onChange={(checked) => updateProductField("uv400", checked)}
                  />
                  <ToggleCard
                    label="Polarized lenses"
                    checked={productData.polarized}
                    onChange={(checked) => updateProductField("polarized", checked)}
                  />
                </div>
              </FormGrid>
            </FormSection>

            <FormSection>
              <FormSectionHeader
                title="Multilingual descriptions"
                description="Keep customer-facing product details ready for French, English and Arabic storefronts."
              />
              <div className="grid gap-4">
                <TextAreaField
                  id="description-fr"
                  label="French"
                  value={productData.description.fr}
                  onChange={(value) =>
                    updateProductField("description", {
                      ...productData.description,
                      fr: value,
                    })
                  }
                  dir="ltr"
                />
                <TextAreaField
                  id="description-en"
                  label="English"
                  value={productData.description.en}
                  onChange={(value) =>
                    updateProductField("description", {
                      ...productData.description,
                      en: value,
                    })
                  }
                  dir="ltr"
                />
                <TextAreaField
                  id="description-ar"
                  label="Arabic"
                  value={productData.description.ar}
                  onChange={(value) =>
                    updateProductField("description", {
                      ...productData.description,
                      ar: value,
                    })
                  }
                  dir="rtl"
                />
              </div>
            </FormSection>

            <FormSection>
              <FormSectionHeader
                title="Variants and media"
                description="Create color variants, attach product images, and keep optional variant pricing tidy."
              />

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
                  <FormGrid className="lg:grid-cols-3">
                    <TextField
                      id="new-color-name"
                      label="Color name"
                      value={newColor.name}
                      onChange={(event) =>
                        setNewColor((previous) => ({ ...previous, name: event.target.value }))
                      }
                      placeholder="Black"
                    />
                    <TextField
                      id="new-color-value"
                      label="Color value"
                      value={newColor.value}
                      onChange={(event) =>
                        setNewColor((previous) => ({ ...previous, value: event.target.value }))
                      }
                      placeholder="#111111"
                      prefix={
                        <input
                          type="color"
                          value={newColor.value}
                          onChange={(event) =>
                            setNewColor((previous) => ({ ...previous, value: event.target.value }))
                          }
                          aria-label="Choose color value"
                          className="h-6 w-7 shrink-0 rounded border bg-transparent"
                        />
                      }
                    />
                    <TextField
                      id="new-color-sku"
                      label="Variant SKU"
                      value={newColor.sku}
                      onChange={(event) =>
                        setNewColor((previous) => ({ ...previous, sku: event.target.value }))
                      }
                      placeholder="Optional"
                    />
                  </FormGrid>
                  <div className="flex items-end">
                    <Button type="button" className="w-full" onClick={addColorVariant}>
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Add variant
                    </Button>
                  </div>
                </div>
              </div>

              {productData.colors.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {productData.colors.map((color, colorIndex) => (
                    <VariantCard
                      key={color._id || `${color.name}-${colorIndex}`}
                      color={color}
                      colorIndex={colorIndex}
                      updateColorField={updateColorField}
                      removeColorVariant={removeColorVariant}
                      handleImageUpload={handleImageUpload}
                      removeImage={removeImage}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                  <Palette className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium">No variants yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add at least one color variant with product images before saving.
                  </p>
                </div>
              )}
            </FormSection>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden py-0">
              <CardHeader className="border-b px-5 py-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Product readiness
                </CardTitle>
                <CardDescription>Quick scan before publishing changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-5">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Completion</span>
                    <span className="text-muted-foreground">{readiness.score}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${readiness.score}%` }}
                    />
                  </div>
                </div>
                <SummaryItem icon={Boxes} label="Variants" value={readiness.variants} />
                <SummaryItem icon={ImagePlus} label="Images" value={readiness.images} />
                <SummaryItem icon={CheckCircle2} label="Active variants" value={readiness.activeVariants} />
                <SummaryItem icon={Languages} label="Languages" value="FR / EN / AR" />
              </CardContent>
            </Card>

            <Card className="py-0">
              <CardContent className="space-y-3 p-5">
                <FormActions className="border-0 pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(DASHBOARDPRODUCTS)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    {isEditing ? "Update product" : "Save product"}
                  </Button>
                </FormActions>
                <p className="text-xs text-muted-foreground">
                  New images upload first; successful uploads are kept in the form if the final save fails.
                </p>
              </CardContent>
            </Card>
          </aside>
        </fieldset>
      </form>
    </AdminPageContainer>
  );
};

function TextField({
  id,
  label,
  description,
  prefix,
  suffix,
  className,
  required = false,
  ...props
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </Label>
      <div className="mt-2 flex min-h-10 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-xs transition focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
        {prefix}
        <input
          id={id}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          required={required}
          {...props}
        />
        {suffix && <span className="text-xs font-medium text-muted-foreground">{suffix}</span>}
      </div>
      {description && <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder,
  required = false,
  allowEmpty = false,
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive" aria-hidden="true">*</span>}
      </Label>
      <Select value={value || "none"} onValueChange={(nextValue) => onValueChange(nextValue === "none" ? "" : nextValue)}>
        <SelectTrigger id={id} className="mt-2 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty && <SelectItem value="none">{placeholder || "None"}</SelectItem>}
          {!allowEmpty && !value && <SelectItem value="none">{placeholder || "Select"}</SelectItem>}
          {value &&
            !normalizedOptions.some((option) => option.value === value) && (
              <SelectItem value={value}>{value}</SelectItem>
            )}
          {normalizedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, dir = "ltr" }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        dir={dir}
        className="mt-2 min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        placeholder={`Enter ${label.toLowerCase()} description`}
      />
    </div>
  );
}

function ToggleCard({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-muted/25 px-3 py-3 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-input text-primary focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </label>
  );
}

function VariantCard({
  color,
  colorIndex,
  updateColorField,
  removeColorVariant,
  handleImageUpload,
  removeImage,
}) {
  const uploadId = `variant-images-${colorIndex}`;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-10 w-10 shrink-0 rounded-lg border"
            style={{ backgroundColor: color.value || "#111111" }}
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{color.name || `Variant ${colorIndex + 1}`}</p>
            <p className="text-xs text-muted-foreground">
              {color.images.length} images · {color.active === false ? "Inactive" : "Active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={color.active === false ? "secondary" : "default"}>
            {color.active === false ? "Inactive" : "Active"}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeColorVariant(colorIndex)}
            aria-label={`Remove ${color.name || "variant"}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <FormGrid>
          <TextField
            id={`variant-name-${colorIndex}`}
            label="Color name"
            value={color.name}
            onChange={(event) => updateColorField(colorIndex, "name", event.target.value)}
            required
          />
          <TextField
            id={`variant-value-${colorIndex}`}
            label="Color value"
            value={color.value}
            onChange={(event) => updateColorField(colorIndex, "value", event.target.value)}
            prefix={
              <input
                type="color"
                value={color.value || "#111111"}
                onChange={(event) => updateColorField(colorIndex, "value", event.target.value)}
                aria-label={`Choose value for ${color.name || "variant"}`}
                className="h-6 w-7 shrink-0 rounded border bg-transparent"
              />
            }
            required
          />
          <TextField
            id={`variant-sku-${colorIndex}`}
            label="SKU"
            value={color.sku || ""}
            onChange={(event) => updateColorField(colorIndex, "sku", event.target.value)}
            placeholder="Optional"
          />
          <TextField
            id={`variant-stock-${colorIndex}`}
            label="Stock"
            type="number"
            min="0"
            step="1"
            value={color.stock ?? ""}
            onChange={(event) => updateColorField(colorIndex, "stock", event.target.value)}
            placeholder="Untracked"
          />
          <TextField
            id={`variant-price-${colorIndex}`}
            label="Variant price"
            type="number"
            min="0"
            step="0.01"
            value={color.price ?? ""}
            onChange={(event) => updateColorField(colorIndex, "price", event.target.value)}
            suffix="DH"
            placeholder="Base"
          />
          <TextField
            id={`variant-compare-${colorIndex}`}
            label="Compare-at"
            type="number"
            min="0"
            step="0.01"
            value={color.compareAtPrice ?? ""}
            onChange={(event) => updateColorField(colorIndex, "compareAtPrice", event.target.value)}
            suffix="DH"
            placeholder="Optional"
          />
          <div className="sm:col-span-2">
            <ToggleCard
              label="Variant available"
              checked={color.active !== false}
              onChange={(checked) => updateColorField(colorIndex, "active", checked)}
            />
          </div>
        </FormGrid>

        <div>
          <Label htmlFor={uploadId}>Variant images</Label>
          <div className="mt-2 rounded-xl border border-dashed bg-muted/20 p-4">
            <label
              htmlFor={uploadId}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-background px-4 py-6 text-center transition hover:bg-muted/40"
            >
              <UploadCloud className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Choose polished product media</span>
              <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF or AVIF up to 10 MB</span>
            </label>
            <Input
              id={uploadId}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              onChange={(event) => {
                handleImageUpload(colorIndex, event.target.files);
                event.target.value = "";
              }}
              className="sr-only"
            />

            {color.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {color.images.map((image, imageIndex) => (
                    <div key={image.public_id || image.name || imageIndex} className="group relative overflow-hidden rounded-lg border bg-background">
                      <ProductImagePreview
                        image={image}
                        alt={`${color.name || "Variant"} preview ${imageIndex + 1}`}
                      />
                      {isFileImage(image) && (
                        <Badge className="absolute left-2 top-2 bg-background text-foreground hover:bg-background">
                          New
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-7 w-7 opacity-95"
                        onClick={() => removeImage(colorIndex, imageIndex)}
                        aria-label={`Remove image ${imageIndex + 1} from ${color.name || "variant"}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-background px-3 py-2 text-center text-sm text-muted-foreground">
                Add at least one image for this variant.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImagePreview({ image, alt }) {
  const previewUrl = useMemo(() => {
    if (!isFileImage(image)) return image?.url || "";
    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    if (!isFileImage(image) || !previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [image, previewUrl]);

  if (!previewUrl) {
    return (
      <span className="grid aspect-square w-full place-items-center bg-muted">
        <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={previewUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      className="aspect-square w-full object-cover"
    />
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/25 px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {React.createElement(Icon, { className: "h-4 w-4", "aria-hidden": true })}
        {label}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default AddProducts;
