export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LIMITS: [10, 20, 50, 100],
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PRODUCTS: '/products',
  PRODUCT_CREATE: '/products/new',
  PRODUCT_EDIT: '/products/:id/edit',
  PRODUCT_DETAIL: '/products/:id',
  CATEGORIES: '/categories',
  CAROUSELS: '/carousels',
  CAROUSEL_EDIT: '/carousels/:id',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  STOREFRONT: '/storefront',
  FAQ: '/content/faq',
  TERMS: '/content/terms',
  CONTACT: '/content/contact',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const CAROUSEL_TYPE = {
  MANUAL: 'manual',
  CATEGORY: 'category',
} as const;
