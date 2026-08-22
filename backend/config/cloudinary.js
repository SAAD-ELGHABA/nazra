const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload single image to cloudinary
const uploadToCloudinary = async (file, folder = 'sunglasses-products') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Upload multiple images to cloudinary
const uploadMultipleToCloudinary = async (files, folder = 'sunglasses-products') => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

// Delete image from cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Delete multiple images from cloudinary
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteFromCloudinary(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple delete failed: ${error.message}`);
  }
};

// Read the authoritative metadata Cloudinary holds for an asset. Used by the
// media library, where the browser uploads directly and the server never sees
// the bytes, so every dimension the client reports would otherwise be a claim.
const getCloudinaryResource = async (publicId) => cloudinary.api.resource(publicId, {
  resource_type: 'image'
});

// deleteFromCloudinary only throws on transport errors: destroying a missing
// asset returns 200 with { result: 'not found' }, so a bare try/catch around it
// reports success for outcomes that are not one. This inspects the result.
const destroyCloudinaryImage = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true
  });
  return result?.result === 'ok' || result?.result === 'not found';
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getCloudinaryResource,
  destroyCloudinaryImage
};