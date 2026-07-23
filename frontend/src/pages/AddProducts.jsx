import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DASHBOARDPRODUCTS } from "../constant/routerConstants";
import { createAdminProduct, getAdminProduct, updateAdminProduct } from "../api/api";

const EMPTY_DESCRIPTION = { en: "", fr: "", ar: "" };
const MAX_COLOR_VARIANTS = 50;
const MAX_IMAGES_PER_VARIANT = 20;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

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

const inputClassName =
  "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border";


const AddProducts = () => {
  const parset = "nazra-preset";
  const cloud_name = "dpzzuubck";
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
  const errorSummaryRef = useRef(null);
  const [productData, setProductData] = useState(createEmptyProductData);

  const [newColor, setNewColor] = useState({
    name: "",
    value: "#000000",
    images: [],
  });

  useEffect(() => {
    let active = true;
    if (!productId) return;

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
  }, [productId]);

  // Prefill form if editing
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
        colors:
          product.colors?.map((c) => ({
            ...(c._id ? { _id: c._id } : {}),
            name: c.name,
            value: c.value,
            sku: c.sku ?? null,
            price: c.price ?? null,
            compareAtPrice: c.compareAtPrice ?? null,
            stock: c.stock ?? null,
            active: c.active !== false,
            images:
              c.images?.map((img) => ({
                ...(img._id ? { _id: img._id } : {}),
                url: img.url,
                public_id: img.public_id,
              })) || [],
            lensOptions:
              c.lensOptions?.map((lens) => ({
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
          })) || [],
      });
    } else if (!productId) {
      setProductData(createEmptyProductData());
    }
  }, [product, productId]);

  const handleInputChange = (e) => {
    const { checked, name, type, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "stockStatus" ? { inStock: value !== "out_of_stock" } : {}),
      ...(name === "inStock"
        ? {
            stockStatus: checked
              ? prev.stockStatus === "out_of_stock"
                ? "in_stock"
                : prev.stockStatus
              : "out_of_stock",
          }
        : {}),
    }));
    if (formError) setFormError("");
  };

  const showFormError = (message) => {
    setFormError(message);
    window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
  };

  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor((prev) => ({ ...prev, [name]: value }));
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
    setNewColor({ name: "", value: "#000000", images: [] });
    if (formError) setFormError("");
  };

  const removeColorVariant = (index) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (colorIndex, files) => {
    const newImages = Array.from(files);
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
          : color
      ),
    }));
    if (formError) setFormError("");
  };

  const removeImage = (colorIndex, imageIndex) => {
    const updatedColors = [...productData.colors];
    updatedColors[colorIndex].images = updatedColors[colorIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setProductData((prev) => ({ ...prev, colors: updatedColors }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (
      !productData.name ||
      !productData.original_price ||
      !productData.sale_price ||
      !productData.type ||
      !productData.category
    ) {
      showFormError("Please fill in all required fields.");
      return;
    }

    const originalPrice = Number(productData.original_price);
    const salePrice = Number(productData.sale_price);
    const compareAtPrice =
      productData.compareAtPrice === ""
        ? null
        : Number(productData.compareAtPrice);
    const sortPriority = Number(productData.sortPriority);

    if (!Number.isFinite(originalPrice) || !Number.isFinite(salePrice) || originalPrice < 0 || salePrice < 0) {
      showFormError("Prices must be valid positive numbers or zero.");
      return;
    }

    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)
    ) {
      showFormError("Compare-at price must be a positive number or zero.");
      return;
    }

    if (
      !Number.isSafeInteger(sortPriority) ||
      sortPriority < -100000 ||
      sortPriority > 100000
    ) {
      showFormError(
        "Sort priority must be a whole number between -100000 and 100000."
      );
      return;
    }

    const badges = productData.badges
      .split(",")
      .map((badge) => badge.trim())
      .filter(Boolean);

    if (badges.length > 20 || badges.some((badge) => badge.length > 50)) {
      showFormError(
        "Use no more than 20 badges, with a maximum of 50 characters each."
      );
      return;
    }

    if (productData.colors.length === 0) {
      showFormError("Please add at least one color variant.");
      return;
    }

    if (productData.colors.length > MAX_COLOR_VARIANTS) {
      showFormError(`A product can have at most ${MAX_COLOR_VARIANTS} color variants.`);
      return;
    }

    const invalidVariant = productData.colors.find(
      (color) => !color.name?.trim() || !color.value?.trim() || color.name.trim().length > 100 || color.value.trim().length > 100
    );
    if (invalidVariant) {
      showFormError("Every color variant needs a name and value of at most 100 characters.");
      return;
    }

    const colorsWithoutImages = productData.colors.filter((color) => color.images.length === 0);
    if (colorsWithoutImages.length > 0) {
      showFormError("Please add at least one image for each color variant.");
      return;
    }

    if (productData.colors.some((color) => color.images.length > MAX_IMAGES_PER_VARIANT)) {
      showFormError(`Each color variant can contain at most ${MAX_IMAGES_PER_VARIANT} images.`);
      return;
    }

    const pendingImages = productData.colors.flatMap((color) =>
      color.images.filter((image) => typeof File !== "undefined" && image instanceof File)
    );
    const invalidStoredImage = productData.colors
      .flatMap((color) => color.images)
      .find((image) =>
        !(typeof File !== "undefined" && image instanceof File) &&
        (!image?.url || !image?.public_id)
      );
    const invalidPendingType = pendingImages.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    const invalidPendingSize = pendingImages.find((file) => file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES);
    if (invalidStoredImage || invalidPendingType || invalidPendingSize) {
      showFormError("One or more images are invalid. Use a supported image format up to 10 MB.");
      return;
    }

    setIsUploading(true);

    try {
      // Upload new images to Cloudinary if they are File objects
      const updatedColors = await Promise.all(
        productData.colors.map(async (color) => {
          const uploadedImages = await Promise.all(
            color.images.map(async (img) => {
              // Skip already uploaded images
              if (img.url) return img;

              const formData = new FormData();
              formData.append("file", img);
              formData.append("upload_preset", parset);

              const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
              );

              return {
                url: response.data.secure_url,
                public_id: response.data.public_id,
              };
            })
          );

          return {
            ...(color._id ? { _id: color._id } : {}),
            name: color.name.trim(),
            value: color.value.trim(),
            sku: color.sku ?? null,
            price: color.price ?? null,
            compareAtPrice: color.compareAtPrice ?? null,
            stock: color.stock ?? null,
            active: color.active !== false,
            images: uploadedImages,
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
          };
        })
      );

      const productDataToSend = {
        ...productData,
        original_price: originalPrice,
        sale_price: salePrice,
        compareAtPrice,
        sortPriority,
        badges,
        colors: updatedColors,
      };

      let response;
      if (product?._id) {
        // Update existing product
        response = await updateAdminProduct(product._id, productDataToSend);
      } else {
        // Create new product
        response = await createAdminProduct(productDataToSend);
      }

      if (response.data.success) {
        toast.success(
           product?._id
            ? "Product updated successfully!"
            : "Product added successfully!"
        )
        
        // Reset form only if adding new product
        if (!isEditing) {
          setProductData(createEmptyProductData());
        }
      } else {
        toast.error("Error while saving product");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Error submitting product";
      showFormError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-gray-500">
        Loading product...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-2 text-sm text-gray-500">This product may have been removed or archived.</p>
          <button
            type="button"
            onClick={() => navigate(DASHBOARDPRODUCTS)}
            className="mt-4 rounded-md bg-black px-4 py-2 text-white"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Unable to load product</h1>
          <p className="mt-2 text-sm text-gray-500">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-black px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden relative">
          {isUploading && (
            <div
              className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <div className="loader border-4 border-blue-400 border-dashed w-12 h-12 rounded-full animate-spin"></div>
              <span className="ml-4 text-blue-600 font-medium">
                Uploading...
              </span>
            </div>
          )}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? "Update Product" : "Add New Sunglass Product"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? "Edit product information."
                : "Add a new product to your inventory. Each color variant can have its own images."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-4 py-5 sm:p-6"
            aria-busy={isUploading}
          >
            {formError && (
              <div
                ref={errorSummaryRef}
                id="product-form-error"
                role="alert"
                tabIndex={-1}
                className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {formError}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="original-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Original Price (DH) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="original-price"
                    type="number"
                    name="original_price"
                    value={productData.original_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label
                    htmlFor="sale-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sale Price (DH) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="sale-price"
                    type="number"
                    name="sale_price"
                    value={productData.sale_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type <span aria-hidden="true">*</span>
                </label>
                <select
                  id="product-type"
                  name="type"
                  value={productData.type}
                  onChange={handleInputChange}
                  required
                  className={inputClassName}
                >
                  <option value="">Select a type</option>
                  <option value="Aviator">Aviator</option>
                  <option value="Wayfarer">Wayfarer</option>
                  <option value="Round">Round</option>
                  <option value="Cat-Eye">Cat-Eye</option>
                  <option value="Sport">Sport</option>
                  <option value="Oversized">Oversized</option>
                  <option value="Shield">Shield</option>
                  <option value="Square">Square</option>
                  <option value="Rectangle">Rectangle</option>
                  <option value="Butterfly">Butterfly</option>
                  <option value="Clubmaster">Clubmaster</option>
                  <option value="Retro">Retro</option>
                  <option value="Gradient">Gradient</option>
                  <option value="Mirrored">Mirrored</option>
                  <option value="Polarized">Polarized</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category <span aria-hidden="true">*</span>
                </label>
                <select
                  id="product-category"
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  required
                  className={inputClassName}
                >
                  <option value="">Select a category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Mix">Mix</option>
                  <option value="Optical">Optical</option>
                </select>
              </div>

              <fieldset className="rounded-lg border border-gray-200 p-4">
                <legend className="px-1 text-sm font-semibold text-gray-900">
                  Store information
                </legend>
                <p className="mb-4 text-sm text-gray-500">
                  These attributes power Store filters, merchandising, and
                  availability.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="product-gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Gender
                    </label>
                    <select
                      id="product-gender"
                      name="gender"
                      value={productData.gender}
                      onChange={handleInputChange}
                      className={inputClassName}
                    >
                      <option value="">Use category fallback</option>
                      {productData.gender &&
                        !["Men", "Women", "Mix"].includes(productData.gender) && (
                          <option value={productData.gender}>
                            {productData.gender}
                          </option>
                        )}
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Mix">Mix</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="product-collection"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Collection
                    </label>
                    <input
                      id="product-collection"
                      type="text"
                      name="collection"
                      value={productData.collection}
                      onChange={handleInputChange}
                      maxLength={100}
                      placeholder="e.g. Atlas"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="frame-shape"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Frame shape
                    </label>
                    <input
                      id="frame-shape"
                      type="text"
                      name="frameShape"
                      value={productData.frameShape}
                      onChange={handleInputChange}
                      maxLength={100}
                      placeholder="e.g. Round"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="compare-at-price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Compare-at price (DH)
                    </label>
                    <input
                      id="compare-at-price"
                      type="number"
                      name="compareAtPrice"
                      value={productData.compareAtPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="stock-status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Stock status
                    </label>
                    <select
                      id="stock-status"
                      name="stockStatus"
                      value={productData.stockStatus}
                      onChange={handleInputChange}
                      className={inputClassName}
                    >
                      <option value="in_stock">In stock</option>
                      <option value="low_stock">Low stock</option>
                      <option value="out_of_stock">Out of stock</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="sort-priority"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sort priority
                    </label>
                    <input
                      id="sort-priority"
                      type="number"
                      name="sortPriority"
                      value={productData.sortPriority}
                      onChange={handleInputChange}
                      min="-100000"
                      max="100000"
                      step="1"
                      aria-describedby="sort-priority-help"
                      className={inputClassName}
                    />
                    <p id="sort-priority-help" className="mt-1 text-xs text-gray-500">
                      Higher values are promoted first when the Store uses priority.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="product-badges"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Badges
                    </label>
                    <input
                      id="product-badges"
                      type="text"
                      name="badges"
                      value={productData.badges}
                      onChange={handleInputChange}
                      aria-describedby="product-badges-help"
                      placeholder="New, Best Seller"
                      className={inputClassName}
                    />
                    <p id="product-badges-help" className="mt-1 text-xs text-gray-500">
                      Separate up to 20 badges with commas; each badge may contain
                      up to 50 characters.
                    </p>
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="uv400"
                        checked={productData.uv400}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-blue-500"
                      />
                      UV400 protection
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="polarized"
                        checked={productData.polarized}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-blue-500"
                      />
                      Polarized lenses
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={productData.inStock}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-blue-500"
                      />
                      Available for purchase
                    </label>
                  </div>
                </div>
              </fieldset>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  References
                </label>
                <input
                  type="text"
                  name="references"
                  value={productData.references}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="space-y-4">
                <h2 className="font-semibold">Description:</h2>

                {["en", "fr", "ar"].map((lang) => (
                  <div key={lang} className="flex flex-col">
                    <label className="mb-1 text-sm">
                      {lang === "en"
                        ? "English"
                        : lang === "fr"
                        ? "French"
                        : "Arabic"}
                    </label>
                    <textarea
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      value={productData.description[lang]}
                      onChange={(e) =>
                        setProductData((prev) => ({
                          ...prev,
                          description: {
                            ...prev.description,
                            [lang]: e.target.value,
                          },
                        }))
                      }
                      rows={4}
                      placeholder={`Enter description in ${lang.toUpperCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Color Variants */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Color Variants
              </h4>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newColor.name}
                      onChange={handleColorInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Value
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="value"
                        value={newColor.value}
                        onChange={handleColorInputChange}
                        className="block h-10 w-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border mr-2"
                      />
                      <input
                        type="text"
                        name="value"
                        value={newColor.value}
                        onChange={handleColorInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addColorVariant}
                      className="w-full bg-black hover:bg-transparent text-white hover:text-black font-normal py-2 px-4 rounded-md"
                    >
                      Add Color Variant
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Variants List */}
              {productData.colors.length > 0 && (
                <div className="space-y-4">
                  {productData.colors.map((color, colorIndex) => (
                    <div
                      key={color._id || `${color.name}-${colorIndex}`}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <div
                            className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                            style={{ backgroundColor: color.value }}
                          ></div>
                          <span className="font-medium">{color.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColorVariant(colorIndex)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                        multiple
                        onChange={(e) =>
                          handleImageUpload(colorIndex, e.target.files)
                        }
                        className="mb-3"
                      />

                      <div className="flex flex-wrap gap-2">
                        {color.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative w-20 h-20 border rounded-md overflow-hidden"
                          >
                            <img
                              src={img.url ? img.url : URL.createObjectURL(img)}
                              alt="Color"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(colorIndex, imgIndex)}
                              className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => navigate(DASHBOARDPRODUCTS)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-normal text-gray-700 hover:bg-gray-50"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent hover:border-black shadow-sm text-sm font-normal rounded-md text-white hover:text-black bg-black hover:bg-transparent"
                disabled={isUploading}
              >
                {isEditing ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loader styles */}
      <style>
        {`
          .loader {
            border-top-color: transparent;
            border-right-color: transparent;
          }
        `}
      </style>
    </div>
  );
};

export default AddProducts;
