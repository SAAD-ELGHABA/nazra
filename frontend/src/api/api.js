import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


export const getProducts = async()=>{
    const response = await api.get('/products')
    return response;
}

export const getSingleProduct = async (slug)=>{
    const response = await api.get(`/products/${slug}`)
    return response;
}

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


export const createMyOrder = async (formData)=>{
  const response = await api.post(`/orders/create/`,formData)
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

export const trackVisit = async ()=>{
  const response = await api.post(`/visitors/track-visit`)
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