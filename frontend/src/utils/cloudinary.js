// Frontend utility for uploading images to Cloudinary
// This is for your React frontend

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`;
const UPLOAD_PRESET = import.meta.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Upload single image to Cloudinary
export const uploadImageToCloudinary = async (file, folder = 'sunglasses-products') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      public_id: data.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImagesToCloudinary = async (files, folder = 'sunglasses-products') => {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadImageToCloudinary(file, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary (you'll need to implement this on your backend)
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    // This should be a call to your backend endpoint that handles Cloudinary deletion
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('User_Data_token')}`
      },
      body: JSON.stringify({ public_id: publicId })
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};