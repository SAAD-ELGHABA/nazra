const Product = require('../models/Product');
const { 
  uploadMultipleToCloudinary, 
  deleteMultipleFromCloudinary 
} = require('../config/cloudinary');

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      original_price, 
      sale_price, 
      type, 
      category, 
      references, 
      description, // now expected as an object { en, fr, ar }
      colors 
    } = req.body;

    // Validate required fields
    if (!name || !original_price || !sale_price || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate description object
    let parsedDescription;
    if (typeof description === "string") {
      try {
        parsedDescription = JSON.parse(description); // if sent as JSON string
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Description must be a valid JSON object'
        });
      }
    } else if (typeof description === "object" && description !== null) {
      parsedDescription = description;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Make sure all languages exist
    parsedDescription.en = parsedDescription.en || "";
    parsedDescription.fr = parsedDescription.fr || "";
    parsedDescription.ar = parsedDescription.ar || "";

    // Parse colors if it's a string
    let parsedColors;
    try {
      parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid colors format'
      });
    }

    if (!parsedColors || !Array.isArray(parsedColors) || parsedColors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one color variant is required'
      });
    }

    const colorsWithImages = [];
    
    for (let i = 0; i < parsedColors.length; i++) {
      const color = parsedColors[i];
      const colorImages = [];
      const imageField = `color_${i}_images`;

      if (req.files && req.files[imageField]) {
        const files = Array.isArray(req.files[imageField]) 
          ? req.files[imageField] 
          : [req.files[imageField]];

        for (const file of files) {
          const uploadResult = await uploadToCloudinary(
            file.tempFilePath || file.data,
            `sunglasses-products/${name.replace(/\s+/g, '-').toLowerCase()}`
          );
          colorImages.push({
            url: uploadResult.url,
            public_id: uploadResult.public_id
          });
        }
      }

      colorsWithImages.push({
        name: color.name,
        value: color.value,
        images: colorImages
      });
    }

    // Create product
    const product = new Product({
      name,
      original_price: parseFloat(original_price),
      sale_price: parseFloat(sale_price),
      type,
      category,
      references,
      description: parsedDescription, // save multi-language object
      colors: colorsWithImages,
      createdBy: req.user.id
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};


// Get all products
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const products = await Product.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
      const product = await Product.findOne({
        _id: req.params.id,
        isActive: true
      }).populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      original_price, 
      sale_price, 
      type, 
      category, 
      references, 
      description, 
      colors 
    } = req.body;

    // Find the product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (existingProduct.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Parse colors if provided
    let parsedColors;
    if (colors) {
      try {
        parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid colors format'
        });
      }
    }

    // Update basic fields
    const updateData = {};
    if (name) updateData.name = name;
    if (original_price) updateData.original_price = parseFloat(original_price);
    if (sale_price) updateData.sale_price = parseFloat(sale_price);
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (references !== undefined) updateData.references = references;
    if (description !== undefined) updateData.description = description;

    // Handle color updates if provided
    if (parsedColors) {
      const colorsWithImages = [];
      
      for (let i = 0; i < parsedColors.length; i++) {
        const color = parsedColors[i];
        
        // Start with existing images for this color (if any)
        let colorImages = color.images || [];
        
        // Check for new images for this color
        const imageField = `color_${i}_images`;
        if (req.files && req.files[imageField]) {
          const files = Array.isArray(req.files[imageField]) 
            ? req.files[imageField] 
            : [req.files[imageField]];
          
          // Upload new images to Cloudinary
          try {
            for (const file of files) {
              const uploadResult = await uploadToCloudinary(
                file.tempFilePath || file.data,
                `sunglasses-products/${(name || existingProduct.name).replace(/\s+/g, '-').toLowerCase()}`
              );
              colorImages.push({
                url: uploadResult.url,
                public_id: uploadResult.public_id
              });
            }
          } catch (uploadError) {
            return res.status(500).json({
              success: false,
              message: `Failed to upload images for color ${color.name}: ${uploadError.message}`
            });
          }
        }

        colorsWithImages.push({
          name: color.name,
          value: color.value,
          images: colorImages
        });
      }
      
      updateData.colors = colorsWithImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Collect all image public_ids for deletion
    const publicIds = [];
    product.colors.forEach(color => {
      color.images.forEach(image => {
        if (image.public_id) {
          publicIds.push(image.public_id);
        }
      });
    });

    // Delete images from Cloudinary
    if (publicIds.length > 0) {
      try {
        await deleteMultipleFromCloudinary(publicIds);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with product deletion even if Cloudinary deletion fails
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};