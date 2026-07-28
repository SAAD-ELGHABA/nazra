const test = require("node:test");
const assert = require("node:assert/strict");

const mediaController = require("../controllers/mediaController");
const mediaRoutes = require("../routes/mediaRoutes");
const {
  createSignedUploadParameters,
  getPurposeConfiguration,
  parseUploadPurpose,
  MediaUploadConfigurationError,
  MediaUploadValidationError,
  _test
} = require("../services/mediaUploadService");

const createResponse = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test("strictly validates upload purposes and maps them server-side", () => {
  assert.equal(parseUploadPurpose({ purpose: "product" }), "product");
  assert.equal(getPurposeConfiguration("product").folder, "sunglasses-products");
  assert.equal(getPurposeConfiguration("product").permission, "products.manage");
  assert.equal(getPurposeConfiguration("blog").folder, "blog-images");
  assert.equal(getPurposeConfiguration("blog").permission, "blog.manage");

  assert.throws(() => parseUploadPurpose({ purpose: "avatar" }), MediaUploadValidationError);
  assert.throws(
    () => parseUploadPurpose({ purpose: "product", folder: "user-controlled" }),
    MediaUploadValidationError
  );
  assert.throws(() => parseUploadPurpose(["product"]), MediaUploadValidationError);
});

test("creates deterministic signed parameters without exposing the API secret", () => {
  const calls = [];
  const result = createSignedUploadParameters("product", {
    environment: {
      CLOUDINARY_CLOUD_NAME: "nazra-cloud",
      CLOUDINARY_API_KEY: "123456",
      CLOUDINARY_API_SECRET: "server-only-secret",
      CLOUDINARY_UPLOAD_PRESET: "signed-upload-policy"
    },
    now: () => 1_750_000_000_999,
    generatePublicId: () => "fixed-public-id",
    signRequest: (parameters, secret) => {
      calls.push({ parameters, secret });
      return "signed-value";
    }
  });

  assert.deepEqual(calls, [{
    parameters: {
      folder: "sunglasses-products",
      public_id: "fixed-public-id",
      overwrite: false,
      timestamp: 1_750_000_000,
      upload_preset: "signed-upload-policy"
    },
    secret: "server-only-secret"
  }]);
  assert.deepEqual(result, {
    cloudName: "nazra-cloud",
    apiKey: "123456",
    timestamp: 1_750_000_000,
    signature: "signed-value",
    folder: "sunglasses-products",
    publicId: "fixed-public-id",
    overwrite: false,
    uploadPreset: "signed-upload-policy"
  });
  assert.equal("apiSecret" in result, false);
  assert.equal("public_id" in result, false);
});

test("generates a different URL-safe random public ID for each signature", () => {
  const first = _test.generateUploadPublicId();
  const second = _test.generateUploadPublicId();

  assert.match(first, /^[A-Za-z0-9_-]{24}$/);
  assert.match(second, /^[A-Za-z0-9_-]{24}$/);
  assert.notEqual(first, second);
});

test("the Cloudinary SDK signs public_id and overwrite parameters", () => {
  const result = createSignedUploadParameters("blog", {
    environment: {
      CLOUDINARY_CLOUD_NAME: "nazra-cloud",
      CLOUDINARY_API_KEY: "123456",
      CLOUDINARY_API_SECRET: "server-only-secret",
      CLOUDINARY_UPLOAD_PRESET: "signed-upload-policy"
    },
    now: () => 1_750_000_000_999,
    generatePublicId: () => "fixed-public-id"
  });

  assert.match(result.signature, /^[a-f0-9]{40}$/);
  assert.equal(result.publicId, "fixed-public-id");
  assert.equal(result.overwrite, false);
});

test("fails safely when the required backend upload preset is missing", () => {
  assert.throws(
    () => createSignedUploadParameters("blog", {
      environment: {
        CLOUDINARY_CLOUD_NAME: "nazra-cloud",
        CLOUDINARY_API_KEY: "123456",
        CLOUDINARY_API_SECRET: "server-only-secret"
      }
    }),
    MediaUploadConfigurationError
  );
});

test("requires the permission associated with the validated purpose", () => {
  const middleware = mediaRoutes._test.requirePurposePermission;

  const denied = createResponse();
  middleware(
    { mediaUploadPurpose: "product", user: { role: "viewer" } },
    denied,
    () => assert.fail("viewer must not receive a product upload signature")
  );
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.body.code, "FORBIDDEN");

  let allowed = false;
  middleware(
    { mediaUploadPurpose: "blog", user: { role: "admin" } },
    createResponse(),
    () => {
      allowed = true;
    }
  );
  assert.equal(allowed, true);
});

test("controller returns a generic service-unavailable response for missing config", () => {
  const previous = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
  };
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
  delete process.env.CLOUDINARY_UPLOAD_PRESET;

  try {
    const response = createResponse();
    mediaController.createUploadSignature({ mediaUploadPurpose: "product" }, response);
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, {
      success: false,
      message: "Media upload service is temporarily unavailable."
    });
  } finally {
    if (previous.cloudName === undefined) delete process.env.CLOUDINARY_CLOUD_NAME;
    else process.env.CLOUDINARY_CLOUD_NAME = previous.cloudName;
    if (previous.apiKey === undefined) delete process.env.CLOUDINARY_API_KEY;
    else process.env.CLOUDINARY_API_KEY = previous.apiKey;
    if (previous.apiSecret === undefined) delete process.env.CLOUDINARY_API_SECRET;
    else process.env.CLOUDINARY_API_SECRET = previous.apiSecret;
    if (previous.uploadPreset === undefined) delete process.env.CLOUDINARY_UPLOAD_PRESET;
    else process.env.CLOUDINARY_UPLOAD_PRESET = previous.uploadPreset;
  }
});
