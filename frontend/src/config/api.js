export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Image configuration
export const IMAGE_CONFIG = {
    UPLOAD_ENDPOINT: `${API_BASE_URL}/api/upload`,
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    PLACEHOLDERS: {
        PRIMARY: '/images/product-placeholder.png',
        FALLBACK: 'https://placehold.co/300x300?text=Product',
        ERROR: '/images/upload-error.png'
    }
};

export const PLACEHOLDER_IMAGE = IMAGE_CONFIG.PLACEHOLDERS.PRIMARY;

// API endpoints
export const API_ENDPOINTS = {
    UPLOAD_IMAGE: `${API_BASE_URL}/api/products/upload`,
    CREATE_PRODUCT: `${API_BASE_URL}/api/products`,
    UPDATE_PRODUCT: (id) => `${API_BASE_URL}/api/products/${id}`,
    DELETE_PRODUCT: (id) => `${API_BASE_URL}/api/products/${id}`,
    GET_PRODUCTS: `${API_BASE_URL}/api/products`,
    GET_PRODUCT: (id) => `${API_BASE_URL}/api/products/${id}`,
};