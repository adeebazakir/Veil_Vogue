import axios from 'axios';

// Base URL for product routes
const API_URL = 'http://localhost:5000/api/products/';

// Fetch all verified products
const getProducts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data; 
    }
    catch (error) {
        console.error('Error fetching products:',error.response.data.message);
        throw error.response.data.message;
    }
};

// Upload a product (seller) with image using FormData
const uploadProduct = async (productData, token, onUploadProgress) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
            onUploadProgress,
        };

        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('description', productData.description || '');
        formData.append('price', productData.price);
        formData.append('category', productData.category);
        formData.append('stock', productData.stock ?? 0);
        if (productData.imageFile) {
            formData.append('image', productData.imageFile);
        }

        const response = await axios.post(API_URL, formData, config);
        return response.data;
    } catch (error) {
        console.error('Error uploading product:', error.response?.data || error.message);
        throw error.response?.data || { message: error.message };
    }
};

const productService = {
    getProducts,
    uploadProduct,
};

export default productService;