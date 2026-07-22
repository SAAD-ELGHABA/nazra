import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


//admins
export const getAdmins = async() => {
  const response = await api.get('/auth/users')
  return response;
}

export const createAdmin = async(payload) => {
  const response = await api.post('/auth/register', payload)
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

export const getProductReviews = async (slug, params = {}, signal) => {
  const response = await api.get(`/products/${slug}/reviews`, { params, signal });
  return response;
};

export const deleteProduct = async (id)=>{
  const token = localStorage.getItem('User_Data_token')
    const response = await api.delete(`/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
}

export const getProductsAsAdmin = async ()=>{
    const token = localStorage.getItem('User_Data_token')
    const response = await api.get('/products/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response;
}


export const createMyOrder = async (formData, idempotencyKey)=>{
  const response = await api.post(`/orders/create/`, formData, {
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  })
  return response;
}


export const getOrders = async()=>{
   const token = localStorage.getItem('User_Data_token')
    const response = await api.get('/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response;
}


export const updateOrderStatus = async (orderId,status)=>{
     const token = localStorage.getItem('User_Data_token')
    const response = await api.post(`/orders/update-order-status/${orderId}`,{status}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response;
}

export const getVisitors = async ()=>{
     const token = localStorage.getItem('User_Data_token')
    const response = await api.get(`/visitors/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
  const response = await api.get(`/emails/get-emails`,{
    headers:{
      Authorization:`Bearer ${localStorage.getItem('User_Data_token')}`
    }
  })
  return response;
}

export const createBlogArticle = async (formData)=>{
  const response = await api.post("/blog/create",formData,{
    headers:{
      Authorization:`Bearer ${localStorage.getItem("User_Data_token")}`
    }
  })
  return response;
}

export const deleteBlog = async (id)=>{
  const response = await api.post(`/blog/delete/${id}`,{},{
    headers:{
      Authorization:`Bearer ${localStorage.getItem("User_Data_token")}`
    }
  })
  return response;
}

export const updateBlogArticle = async (id,formData)=>{
  const response = await api.post(`/blog/update/${id}`,formData,{
    headers:{
      Authorization:`Bearer ${localStorage.getItem("User_Data_token")}`
    }
  })
  return response;
}

export const getBlogs = async (pageNumber)=>{
  const response = await api.get(`/blog?page=${pageNumber}`);
  return response;
}

