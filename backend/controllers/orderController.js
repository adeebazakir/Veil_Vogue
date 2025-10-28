// backend/controllers/orderController.js

import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer (FR-6)
const addOrderItems = asyncHandler(async (req, res) => {
    const { 
        shippingAddress, 
        paymentMethod, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice 
    } = req.body;

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart || cart.cartItems.length === 0) {
        res.status(400);
        throw new Error('No items in cart');
    }

    const orderItems = cart.cartItems.map(item => ({
        name: item.name,
        qty: item.quantity,
        image: item.image,
        price: item.price,
        product: item.product,
        customization_details: item.customization_details,
        customization_cost: item.customization_cost || 0
    }));

    const order = new Order({
        customer: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    // 1. Save the Order
    const createdOrder = await order.save();
    
    // 2. STOCK MANAGEMENT: Update product stock (FR-6 Requirement)
    for (const item of cart.cartItems) {
        const product = await Product.findById(item.product);
        if (product) {
            // Decrement stock by the quantity ordered
            product.stock -= item.quantity; 
            await product.save();
        }
    }

    // 3. Clear the Customer's Cart
    await Cart.findOneAndDelete({ customer: req.user._id });

    res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id });
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('customer', 'name email');

    if (order && order.customer._id.toString() === req.user._id.toString()) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found or access denied');
    }
});


// @desc    Update order to paid (Mock payment gateway success)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        // Assuming payment details (e.g., transaction ID) are in req.body
        // order.paymentResult = { id: req.body.id, ... }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get orders containing seller's products
// @route   GET /api/orders/seller/myorders
// @access  Private/Seller
const getSellerOrders = asyncHandler(async (req, res) => {
    // First, get all products by this seller
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id');
    const productIds = sellerProducts.map(p => p._id);
    
    // Find all orders that contain at least one of the seller's products
    const orders = await Order.find({
        'orderItems.product': { $in: productIds }
    })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 });
    
    // Filter order items to only show seller's products
    const filteredOrders = orders.map(order => {
        const sellerOrderItems = order.orderItems.filter(item => 
            productIds.some(id => id.toString() === item.product.toString())
        );
        
        return {
            _id: order._id,
            customer: order.customer,
            orderItems: sellerOrderItems,
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            isPaid: order.isPaid,
            paidAt: order.paidAt,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt,
            createdAt: order.createdAt,
        };
    });
    
    res.json(filteredOrders);
});

export { addOrderItems, getMyOrders, getOrderById, updateOrderToPaid, getSellerOrders };