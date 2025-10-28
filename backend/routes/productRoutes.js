import express from 'express';
import { createProductReview, getProductReviews } from '../controllers/reviewController.js';
import { protect, isSeller, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

import {
    getProducts,
    getProductById,
    createProduct,
    verifyProduct,
    getAllProductsForAdmin,
    updateProduct,
    deleteProduct,
    getProductStats,
    getSellerVerifiedProducts,
    getSellerAllProducts,
} from '../controllers/productController.js';

const router = express.Router();

console.log('Product routes loaded successfully');

// POST /api/products/upload - Handle image upload via multer/cloudinary
// Uses `upload` middleware configured in config/cloudinary.js (single('image'))
router.post('/upload', protect, isSeller, (req, res) => {
    upload(req, res, function(err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading image',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image file',
            });
        }

        // Multer-storage-cloudinary attaches `path` and `filename` fields
        res.status(200).json({
            success: true,
            url: req.file.path,
            public_id: req.file.filename,
        });
    });
});

// Public product routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes
router.get('/admin/all-products', protect, isAdmin, getAllProductsForAdmin);
router.get('/admin/stats', protect, isAdmin, getProductStats);
router.put('/admin/verify/:id', protect, isAdmin, verifyProduct);

// Seller routes
// Create product: expects images array in request body (image(s) previously uploaded via /upload)
router.post('/', protect, isSeller, createProduct);
router.get('/seller/verified', protect, isSeller, getSellerVerifiedProducts);
router.get('/seller/all', protect, isSeller, getSellerAllProducts);

// Update product (optionally replace image using upload middleware)
router.put('/:id', protect, upload, updateProduct);
router.delete('/:id', protect, deleteProduct);

// Review routes (must be before param route if using :productId)
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, createProductReview);

console.log('All product routes registered');

export default router;