// backend/models/reviewModel.js

import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    // The user who wrote the review
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // The product being reviewed
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    // The star rating (1 to 5)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    // The textual comment
    comment: {
        type: String,
        required: true,
    },
    // Adding optional fields for usability
    title: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Enforce that one customer can only review a specific product once
reviewSchema.index({ customer: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;