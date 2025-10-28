// backend/models/orderModel.js

import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    customization_details: { type: String, default: "" },
    customization_cost: { type: Number, default: 0 },
});

const orderSchema = mongoose.Schema({
    // Links the order to the customer
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [orderItemSchema],
    
    // Shipping Details (FR-6 requirement)
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    
    // Payment Method (FR-6 requirement)
    paymentMethod: {
        type: String,
        required: true,
    },
    
    // Total amounts
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // Status fields
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;