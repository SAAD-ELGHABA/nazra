const { randomBytes } = require("node:crypto");
const { cloudinary } = require("../config/cloudinary");

const UPLOAD_PURPOSES = Object.freeze({
  product: Object.freeze({
    folder: "sunglasses-products",
    permission: "products.manage"
  }),
  blog: Object.freeze({
    folder: "blog-images",
    permission: "blog.manage"
  }),
  library: Object.freeze({
    folder: "media-library",
    permission: "media.manage"
  })
});

class MediaUploadValidationError extends Error {}
class MediaUploadConfigurationError extends Error {}

const isPlainObject = (value) => (
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
);

const parseUploadPurpose = (body) => {
  if (!isPlainObject(body)) {
    throw new MediaUploadValidationError("Request body must be an object.");
  }

  const fields = Object.keys(body);
  if (fields.length !== 1 || fields[0] !== "purpose") {
    throw new MediaUploadValidationError("Request body must contain only the purpose field.");
  }

  if (typeof body.purpose !== "string" || !UPLOAD_PURPOSES[body.purpose]) {
    throw new MediaUploadValidationError(
      `purpose must be one of: ${Object.keys(UPLOAD_PURPOSES).join(", ")}.`
    );
  }

  return body.purpose;
};

const getPurposeConfiguration = (purpose) => {
  const configuration = UPLOAD_PURPOSES[purpose];
  if (!configuration) {
    throw new MediaUploadValidationError("Unsupported upload purpose.");
  }
  return configuration;
};

const readCloudinaryConfiguration = (environment = process.env) => {
  const cloudName = environment.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = environment.CLOUDINARY_API_KEY?.trim();
  const apiSecret = environment.CLOUDINARY_API_SECRET?.trim();
  const uploadPreset = environment.CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    throw new MediaUploadConfigurationError("Cloudinary configuration is incomplete.");
  }

  return { cloudName, apiKey, apiSecret, uploadPreset };
};

const generateUploadPublicId = () => randomBytes(18).toString("base64url");

const createSignedUploadParameters = (
  purpose,
  {
    environment = process.env,
    now = Date.now,
    generatePublicId = generateUploadPublicId,
    signRequest = cloudinary.utils.api_sign_request
  } = {}
) => {
  const { folder } = getPurposeConfiguration(purpose);
  const {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset
  } = readCloudinaryConfiguration(environment);
  const timestamp = Math.floor(now() / 1000);
  const publicId = generatePublicId();
  const parametersToSign = {
    folder,
    public_id: publicId,
    overwrite: false,
    timestamp,
    upload_preset: uploadPreset
  };
  const signature = signRequest(parametersToSign, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    overwrite: false,
    uploadPreset
  };
};

module.exports = {
  createSignedUploadParameters,
  getPurposeConfiguration,
  parseUploadPurpose,
  MediaUploadConfigurationError,
  MediaUploadValidationError,
  _test: {
    UPLOAD_PURPOSES,
    generateUploadPublicId,
    isPlainObject,
    readCloudinaryConfiguration
  }
};
