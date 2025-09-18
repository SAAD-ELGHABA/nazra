import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
const AddProducts = () => {
  const parset = "nazra-preset";
  const cloud_name = "dpzzuubck";
  const token = localStorage.getItem("User_Data_token");
  const location = useLocation();
  const product = location.state?.product;

  const [isUploading, setIsUploading] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    original_price: "",
    sale_price: "",
    type: "",
    category: "",
    references: "",
    description: {
      en: "",
      fr: "",
      ar: "",
    },
    colors: [],
  });

  const [newColor, setNewColor] = useState({
    name: "",
    value: "#000000",
    images: [],
  });

  // Prefill form if editing
  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name || "",
        original_price: product.original_price || "",
        sale_price: product.sale_price || "",
        type: product.type || "",
        category: product.category || "",
        references: product.references || "",
        description: product.description || "",
        colors:
          product.colors?.map((c) => ({
            name: c.name,
            value: c.value,
            images:
              c.images?.map((img) => ({
                url: img.url,
                public_id: img.public_id,
              })) || [],
          })) || [],
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor((prev) => ({ ...prev, [name]: value }));
  };

  const addColorVariant = () => {
    if (newColor.name.trim() === "") return;
    setProductData((prev) => ({
      ...prev,
      colors: [...prev.colors, { ...newColor }],
    }));
    setNewColor({ name: "", value: "#000000", images: [] });
  };

  const removeColorVariant = (index) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (colorIndex, files) => {
    const updatedColors = [...productData.colors];
    const newImages = Array.from(files);
    updatedColors[colorIndex].images = [
      ...updatedColors[colorIndex].images,
      ...newImages,
    ];
    setProductData((prev) => ({ ...prev, colors: updatedColors }));
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

    // Basic validation
    if (
      !productData.name ||
      !productData.original_price ||
      !productData.sale_price ||
      !productData.type ||
      !productData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (productData.colors.length === 0) {
      alert("Please add at least one color variant");
      return;
    }

    const colorsWithoutImages = productData.colors.filter(
      (color) => color.images.length === 0
    );
    if (colorsWithoutImages.length > 0) {
      alert("Please add at least one image for each color variant");
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
            name: color.name,
            value: color.value,
            images: uploadedImages,
          };
        })
      );

      const productDataToSend = { ...productData, colors: updatedColors };

      let response;
      if (product?._id) {
        // Update existing product
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/products/${product._id}`,
          productDataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new product
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/products/create`,
          productDataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response.data.success) {
        alert(
          product?._id
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        // Reset form only if adding new product
        if (!product) {
          setProductData({
            name: "",
            original_price: "",
            sale_price: "",
            type: "",
            category: "",
            references: "",
            description: "",
            colors: [],
          });
        }
      } else {
        alert("Error while saving product");
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      alert(err.response?.data?.message || "Error submitting product");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden relative">
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
              <div className="loader border-4 border-blue-400 border-dashed w-12 h-12 rounded-full animate-spin"></div>
              <span className="ml-4 text-blue-600 font-medium">
                Uploading...
              </span>
            </div>
          )}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {product ? "Update Product" : "Add New Sunglass Product"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {product
                ? "Edit product information."
                : "Add a new product to your inventory. Each color variant can have its own images."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={productData.original_price}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={productData.sale_price}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={productData.type}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="">Select a category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Women">Mix</option>
                  <option value="Optical">Optical</option>
                </select>
              </div>

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
                      key={colorIndex}
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
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-normal text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent hover:border-black shadow-sm text-sm font-normal rounded-md text-white hover:text-black bg-black hover:bg-transparent"
                disabled={isUploading}
              >
                {product ? "Update Product" : "Save Product"}
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
