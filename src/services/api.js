/**
 * @file api.js
 * @description Axios instance and API service functions for orders and products.
 * @author Sharon Barrial
 * @date 2026-03-04
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ Error en la API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// products
export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// orders
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const updateOrder = async (id, orderData) => {
  const response = await api.put(`/orders/${id}`, orderData);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

export default api;