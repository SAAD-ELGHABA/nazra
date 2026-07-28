import { requestCloudinaryUploadSignature } from "../api/api";

const MAX_CONCURRENT_UPLOADS = 4;
const SUPPORTED_UPLOAD_PURPOSES = new Set(["product", "blog"]);
let activeUploads = 0;
const pendingUploads = [];

const acquireUploadSlot = () =>
  new Promise((resolve) => {
    if (activeUploads < MAX_CONCURRENT_UPLOADS) {
      activeUploads += 1;
      resolve();
      return;
    }

    pendingUploads.push(resolve);
  });

const releaseUploadSlot = () => {
  const nextUpload = pendingUploads.shift();
  if (nextUpload) {
    nextUpload();
    return;
  }

  activeUploads -= 1;
};

const withUploadSlot = async (upload) => {
  await acquireUploadSlot();
  try {
    return await upload();
  } finally {
    releaseUploadSlot();
  }
};

const getSignedUploadFields = async (purpose) => {
  if (!SUPPORTED_UPLOAD_PURPOSES.has(purpose)) {
    throw new Error("A valid upload purpose is required.");
  }

  const response = await requestCloudinaryUploadSignature(purpose);
  const fields = response?.data?.data;

  if (
    !fields?.cloudName ||
    !fields?.apiKey ||
    !fields?.timestamp ||
    !fields?.signature ||
    !fields?.folder ||
    !fields?.publicId ||
    !fields?.uploadPreset ||
    fields?.overwrite !== false
  ) {
    throw new Error("The upload service returned an incomplete signature.");
  }

  return fields;
};

// Upload single image to Cloudinary
export const uploadImageToCloudinary = async (file, purpose) =>
  withUploadSlot(async () => {
    try {
      const {
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
        publicId,
        uploadPreset,
      } = await getSignedUploadFields(purpose);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("public_id", publicId);
      formData.append("overwrite", "false");
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message || "Cloudinary upload failed.");
      }

      if (!data?.secure_url || !data?.public_id) {
        throw new Error("Cloudinary returned an incomplete upload response.");
      }

      return {
        url: data.secure_url,
        public_id: data.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  });

// Upload multiple images to Cloudinary
export const uploadMultipleImagesToCloudinary = async (
  files,
  purpose,
  { onUploaded } = {},
) => {
  const results = await Promise.allSettled(
    Array.from(files).map(async (file, index) => {
      const uploadedImage = await uploadImageToCloudinary(file, purpose);
      onUploaded?.(uploadedImage, index);
      return uploadedImage;
    }),
  );

  const failedUpload = results.find((result) => result.status === "rejected");
  if (failedUpload) {
    console.error("Multiple upload error:", failedUpload.reason);
    throw failedUpload.reason;
  }

  return results.map((result) => result.value);
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
