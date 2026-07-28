const {
  createSignedUploadParameters,
  MediaUploadConfigurationError
} = require("../services/mediaUploadService");

const createUploadSignature = (req, res) => {
  try {
    const upload = createSignedUploadParameters(req.mediaUploadPurpose);
    return res.status(200).json({
      success: true,
      data: upload
    });
  } catch (error) {
    if (error instanceof MediaUploadConfigurationError) {
      return res.status(503).json({
        success: false,
        message: "Media upload service is temporarily unavailable."
      });
    }

    console.error("Media upload signature generation failed");
    return res.status(500).json({
      success: false,
      message: "Unable to prepare media upload."
    });
  }
};

module.exports = { createUploadSignature };
