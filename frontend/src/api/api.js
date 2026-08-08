import axios from "axios";
import { LOGIN } from "../constant/routerConstants";
import {
  AUTH_TOKEN_STORAGE_KEY,
  clearAuthStorage,
} from "../utils/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim();

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is required.");
}

if (import.meta.env.DEV) {
  const developmentApiUrl = new URL(API_BASE_URL);
  const isLocalDevelopmentApi =
    ["localhost", "127.0.0.1"].includes(developmentApiUrl.hostname) &&
    developmentApiUrl.port === "5000";

  if (!isLocalDevelopmentApi) {
    throw new Error(
      "Development API requests must use http://localhost:5000/api.",
    );
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // Without this a hung backend leaves every loading skeleton spinning
  // forever and the error states never render. 20s is generous enough for a
  // serverless cold start plus a MongoDB connection.
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthorizationHeader = (headers) => {
  if (!headers) return "";
  if (typeof headers.get === "function") {
    return headers.get("Authorization") || "";
  }
  return headers.Authorization || headers.authorization || "";
};

const getBearerConfig = () => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authorization = getAuthorizationHeader(error?.config?.headers);
    const isAuthenticatedRequest =
      typeof authorization === "string" && authorization.startsWith("Bearer ");

    if (error?.response?.status === 401 && isAuthenticatedRequest) {
      clearAuthStorage();
      if (window.location.pathname !== LOGIN) {
        window.location.replace(LOGIN);
      }
    }

    return Promise.reject(error);
  }
);

export const loginAdmin = async (payload) => {
  return api.post("/auth/login", payload, { withCredentials: true });
};

export const requestPasswordResetCode = async (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const resetPasswordWithCode = async (payload) => {
  return api.post("/auth/reset-password", payload);
};

export const getCurrentAdmin = async () => {
  return api.get("/auth/me", getBearerConfig());
};

export const requestCloudinaryUploadSignature = async (purpose) => {
  return api.post(
    "/media/upload-signature",
    { purpose },
    getBearerConfig(),
  );
};

export const getAdminDashboardSummary = async (params = {}, signal) => {
  return api.get("/admin/dashboard/summary", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const getAdminActionCenter = async (signal) => {
  return api.get("/admin/action-center", {
    ...getBearerConfig(),
    signal,
  });
};

export const getAdminInventory = async (params = {}, signal) => {
  return api.get("/admin/inventory", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const getAdminCustomers = async (params = {}, signal) => {
  return api.get("/admin/customers", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const getAdminContacts = async (params = {}, signal) => {
  return api.get("/admin/contacts", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const updateAdminContactStatus = async (id, status) => {
  return api.patch(`/admin/contacts/${id}/status`, { status }, getBearerConfig());
};

export const getAdminReviews = async (params = {}, signal) => {
  return api.get("/admin/reviews", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const updateAdminReviewModeration = async (id, payload) => {
  return api.patch(`/admin/reviews/${id}/moderation`, payload, getBearerConfig());
};

export const getAdminActivityLogs = async (params = {}, signal) => {
  return api.get("/admin/activity-logs", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const getAdminSettings = async (signal) => {
  return api.get("/admin/settings", {
    ...getBearerConfig(),
    signal,
  });
};

export const updateAdminSettings = async (payload) => {
  return api.patch("/admin/settings", payload, getBearerConfig());
};

export const getAdminExports = async (params = {}, signal) => {
  return api.get("/admin/exports", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const createAdminExport = async (payload) => {
  return api.post("/admin/exports", payload, getBearerConfig());
};

export const downloadAdminExport = async (id) => {
  return api.get(`/admin/exports/${id}/download`, {
    ...getBearerConfig(),
    responseType: "blob",
  });
};

export const getAdminNotifications = async (params = {}, signal) => {
  return api.get("/admin/notifications", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const markAdminNotificationRead = async (id) => {
  return api.patch(`/admin/notifications/${id}/read`, {}, getBearerConfig());
};

export const getAdminSavedViews = async (params = {}, signal) => {
  return api.get("/admin/saved-views", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

export const createAdminSavedView = async (payload) => {
  return api.post("/admin/saved-views", payload, getBearerConfig());
};

export const searchAdminRecords = async (params = {}, signal) => {
  return api.get("/admin/search", {
    ...getBearerConfig(),
    params,
    signal,
  });
};

//admins
export const getAdmins = async() => {
  const response = await api.get('/auth/users', getBearerConfig())
  return response;
}

export const createAdmin = async(payload) => {
  const response = await api.post('/auth/register', payload, getBearerConfig())
  return response;
}


export const getProducts = async(params = {})=>{
    const response = await api.get('/products', { params })
    return response;
}

const toStoreApiParams = (params = {}) => {
  const apiParams = { ...params };
  const { colors, min, max } = apiParams;

  delete apiParams.colors;
  delete apiParams.min;
  delete apiParams.max;
  delete apiParams.view;

  if (colors) apiParams.color = colors;
  if (min !== undefined && min !== "") apiParams.minPrice = min;
  if (max !== undefined && max !== "") apiParams.maxPrice = max;
  return apiParams;
};

export const getStoreProducts = async (params = {}, signal) => {
  return api.get('/products', {
    params: { ...toStoreApiParams(params), include: 'filters' },
    signal,
  });
};

export const getProductsShortCut = async()=>{
    const response = await api.get('/products/products-shortcut')
    return response;
}

export const getHomepageProducts = async (limit = 4) => {
  try {
    return await api.get('/products/homepage-selection', { params: { limit } });
  } catch (homepageError) {
    try {
      const response = await getProductsShortCut();
      return {
        ...response,
        data: { ...response.data, meta: { source: "recent" } },
      };
    } catch {
      try {
        const response = await api.get('/products', { params: { limit } });
        return {
          ...response,
          data: { ...response.data, meta: { source: "recent" } },
        };
      } catch {
        throw homepageError;
      }
    }
  }
}

export const getSingleProduct = async (slug, signal)=>{
    const response = await api.get(`/products/${slug}`, { signal })
    return response;
}

/** Loads the products a review invitation covers. Public, token-authorised. */
export const getReviewInvitation = async (token, signal) => {
  return api.get("/reviews/invitation", { params: { token }, signal });
};

/** Submits one review. Lands as pending until an admin approves it. */
export const submitProductReview = async (payload) => {
  return api.post("/reviews", payload);
};

export const getProductReviews = async (slug, params = {}, signal) => {
  const response = await api.get(`/products/${slug}/reviews`, { params, signal });
  return response;
};

export const deleteProduct = async (id)=>{
    const response = await api.delete(`/products/${id}`, getBearerConfig());
    return response;
}

export const getProductsAsAdmin = async (signal)=>{
    const response = await api.get('/products/admin/all', {
      ...getBearerConfig(),
      signal,
    })
    return response;
}

export const getAdminProduct = async (id) => {
  const response = await api.get(`/products/admin/${id}`, getBearerConfig());
  return response;
};

export const createAdminProduct = async (payload) => {
  return api.post('/products/create', payload, getBearerConfig());
};

export const updateAdminProduct = async (id, payload) => {
  return api.put(`/products/${id}`, payload, getBearerConfig());
};

export const createMyOrder = async (formData, idempotencyKey)=>{
  const response = await api.post(`/orders/create/`, formData, {
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  })
  return response;
}


// The endpoint is paginated (`response.data.pagination`). Callers that
// aggregate over the result should move to /admin/dashboard/summary, which
// computes its metrics server-side over every order.
export const getOrders = async (params = {}) => {
    const response = await api.get('/orders', { ...getBearerConfig(), params })
    return response;
}


export const updateOrderStatus = async (orderId,status)=>{
    const response = await api.post(`/orders/update-order-status/${orderId}`,{status}, getBearerConfig())
    return response;
}

export const getVisitors = async ()=>{
    const response = await api.get(`/visitors/`, getBearerConfig())
    return response;
}

export const trackVisit = async (visitorId)=>{
    const referrer = document.referrer || "direct";
    const userAgent = navigator.userAgent;
    const response = await api.post(`/visitors/track-visit/${visitorId}`, {
      referrer,
      userAgent,
    });
  return response;
}

export const trackVisitPerProduct = async (idProduct)=>{
  const response = await api.post(`/visitors/view-product`,{productId:idProduct})
  return response;
}
export const storeEmail = async (email)=>{
  const response = await api.post(`/emails/create`,{email})
  return response;
}

export const submitContactMessage = async (payload) => {
  return api.post('/contact', payload);
};

export const getSubEmails = async ()=>{
  const response = await api.get(`/emails/get-emails`, getBearerConfig())
  return response;
}

export const createBlogArticle = async (formData)=>{
  const response = await api.post("/blog/create", formData, getBearerConfig())
  return response;
}

export const deleteBlog = async (id)=>{
  const response = await api.delete(`/blog/delete/${id}`, getBearerConfig())
  return response;
}

export const updateBlogArticle = async (id,formData)=>{
  const response = await api.post(`/blog/update/${id}`, formData, getBearerConfig())
  return response;
}

export const getBlogs = async (pageNumber)=>{
  const response = await api.get(`/blog?page=${pageNumber}`);
  return response;
}

