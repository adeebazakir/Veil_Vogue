// backend/controllers/reviewController.js

import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';

// @desc    Create a new review
// @route   POST /api/products/:productId/reviews
// @access  Private/Customer
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment, title } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (product) {
        // 1. Check if the user has already reviewed this product
        const alreadyReviewed = await Review.findOne({
            product: productId,
            customer: req.user._id,
        });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed by this user');
        }

        // 2. Create the review
        const review = new Review({
            product: productId,
            customer: req.user._id,
            rating: Number(rating),
            comment,
            title,
        });

        await review.save();

        // 3. Update Product's Average Rating and Count
        const reviews = await Review.find({ product: productId });
        
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        // Note: You should add 'rating' and 'numReviews' fields to the Product Model 
        // to properly store this data. (I'll add this update in the next step's Product Model update).

        res.status(201).json({ message: 'Review added successfully' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId }).populate('customer', 'name');
    res.json(reviews);
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/all
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('customer', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch reviews');
    }
});

export { createProductReview, getProductReviews, getAllReviews };