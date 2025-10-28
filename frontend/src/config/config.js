// frontend/src/config/config.js

export const API_BASE_URL = 'http://localhost:5000'; // Backend server URL

export const ENDPOINTS = {
    UPLOAD: `${API_BASE_URL}/api/upload`,
    PRODUCTS: `${API_BASE_URL}/api/products`,
};

export const PLACEHOLDER_IMAGE = '/images/placeholder-product.png'; // Local placeholder in public folder