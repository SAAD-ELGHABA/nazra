import axios from 'axios';
import React, { useState } from 'react'

const AddProducts = () => {

  // const parset =  import.meta.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  // const cloud_name =  import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME
  const parset = 'nazra-preset'
  const cloud_name = 'dpzzuubck'
  const token = localStorage.getItem('User_Data_token');
  console.log('Token from storage:', token);

  const [isUploading, setIsUploading] = useState(false)
  const [productData, setProductData] = useState({
    name: '',
    original_price: '',
    sale_price: '',
    type: '',
    category: '',
    references: '',
    description: 'hello from descriptions field',
    colors: []
  });

  // New color state
  const [newColor, setNewColor] = useState({
    name: '',
    value: '#000000',
    images: []
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle color input changes
  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    setNewColor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new color variant
  const addColorVariant = () => {
    if (newColor.name.trim() === '') return;

    setProductData(prev => ({
      ...prev,
      colors: [...prev.colors, { ...newColor }]
    }));

    // Reset new color form
    setNewColor({
      name: '',
      value: '#000000',
      images: []
    });
  };

  // Remove a color variant
  const removeColorVariant = (index) => {
    setProductData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Handle image upload for a specific color
  const handleImageUpload = (colorIndex, files) => {
    const updatedColors = [...productData.colors];
    // Convert FileList to array and add to images
    const newImages = Array.from(files);
    updatedColors[colorIndex].images = [...updatedColors[colorIndex].images, ...newImages];

    setProductData(prev => ({
      ...prev,
      colors: updatedColors
    }));
  };

  // Remove an image from a color variant
  const removeImage = (colorIndex, imageIndex) => {
    const updatedColors = [...productData.colors];
    updatedColors[colorIndex].images = updatedColors[colorIndex].images.filter((_, i) => i !== imageIndex);

    setProductData(prev => ({
      ...prev,
      colors: updatedColors
    }));
  };
  // const uploadToCloudinary = async (file) => {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('upload_preset', import.meta.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET); 

  //     try {
  //       const response = await axios.post(
  //         `https://api.cloudinary://${import.meta.env.REACT_APP_CLOUDINARY_API_KEY}:${REACT_APP_CLOUDINARY_API_SECRET}@${REACT_APP_CLOUDINARY_CLOUD_NAME}`,
  //         formData,
  //         {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         }
  //       );
  //       return {
  //         url: response.data.secure_url,
  //         public_id: response.data.public_id
  //       };
  //     } catch (error) {
  //       console.error('Error uploading image to Cloudinary:', error);
  //       throw error;
  //     }
  //   };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (same as before)
    if (!productData.name || !productData.original_price || !productData.sale_price ||
      !productData.type || !productData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (productData.colors.length === 0) {
      alert('Please add at least one color variant');
      return;
    }

    const colorsWithoutImages = productData.colors.filter(color => color.images.length === 0);
    if (colorsWithoutImages.length > 0) {
      alert('Please add at least one image for each color variant');
      return;
    }

    setIsUploading(true);

    try {
      // First upload all images to Cloudinary
      const updatedColors = await Promise.all(
        productData.colors.map(async (color) => {
          const uploadedImages = await Promise.all(
            color.images.map(async (imageFile) => {
              const formData = new FormData();
              formData.append('file', imageFile);
              formData.append('upload_preset', parset); // Replace with your preset

              const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, // Replace with your cloud name
                formData
              );

              return {
                url: response.data.secure_url,
                public_id: response.data.public_id
              };
            })
          );

          return {
            name: color.name,
            value: color.value,
            images: uploadedImages
          };
        })
      );

      // Prepare the final product data with Cloudinary URLs
      const productDataToSend = {
        ...productData,
        colors: updatedColors
      };

      // Send to backend
      const response = await axios.post(
        "http://localhost:5000/api/products/create",
        productDataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Product added successfully!");
        // Reset form
        setProductData({
          name: '',
          original_price: '',
          sale_price: '',
          type: '',
          category: '',
          references: '',
          description: '',
          colors: []
        });
      } else {
        alert("Error while adding this product");
      }
    } catch (err) {
      console.error("Error submitting product:", err);
      alert(err.response?.data?.message || "Error submitting product");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Add New Sunglass Product</h3>
            <p className="mt-1 text-sm text-gray-500">Add a new product to your inventory. Each color variant can have its own images.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6" >
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <h4 className="text-md font-medium text-gray-900">Basic Information</h4>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={productData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. Aviator Classic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price ($)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    id="original_price"
                    value={productData.original_price}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    id="sale_price"
                    value={productData.sale_price}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  id="type"
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
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="">Select a category</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Optical">Optical</option>
                </select>
              </div>

              <div>
                <label htmlFor="references" className="block text-sm font-medium text-gray-700 mb-1">
                  References
                </label>
                <input
                  type="text"
                  name="references"
                  id="references"
                  value={productData.references}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. REF-12345, REF-67890"
                />
              </div>
            </div>

            {/* Color Variants */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Color Variants</h4>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <label htmlFor="color_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Color Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="color_name"
                      value={newColor.name}
                      onChange={handleColorInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="e.g. Black, Tortoise"
                    />
                  </div>

                  <div>
                    <label htmlFor="color_value" className="block text-sm font-medium text-gray-700 mb-1">
                      Color Value
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="value"
                        id="color_value"
                        value={newColor.value}
                        onChange={handleColorInputChange}
                        className="block h-10 w-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border mr-2"
                      />
                      <input
                        type="text"
                        value={newColor.value}
                        onChange={handleColorInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="#000000"
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
                    <div key={colorIndex} className="border rounded-lg p-4 bg-white">
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
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Image Upload for this color */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Images for {color.name}
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor={`color-${colorIndex}-images`}
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                              >
                                <span>Upload images</span>
                                <input
                                  id={`color-${colorIndex}-images`}
                                  name={`color-${colorIndex}-images`}
                                  type="file"
                                  multiple
                                  className="sr-only"
                                  onChange={(e) => handleImageUpload(colorIndex, e.target.files)}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Preview uploaded images for this color */}
                      {color.images.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h5>
                          <div className="grid grid-cols-3 gap-2">
                            {color.images.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Preview ${imageIndex + 1}`}
                                  className="h-20 w-full object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(colorIndex, imageIndex)}
                                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ transform: 'translate(30%, -30%)' }}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-normal text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent hover:border-black shadow-sm text-sm font-normal rounded-md text-white hover:text-black bg-black hover:bg-transparent  "
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  )
}

export default AddProducts