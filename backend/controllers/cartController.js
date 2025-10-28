import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

// Helper function to calculate cart total (includes customization cost)
const calculateCartTotal = (cart) => {
    return cart.cartItems.reduce((acc, item) => {
        const itemTotal = item.price * item.quantity;
        const customizationTotal = (item.customization_cost || 0) * item.quantity;
        return acc + itemTotal + customizationTotal;
    }, 0);
};

// @desc    Get customer's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ customer: req.user._id }).populate('cartItems.product', 'name price image');

    if (cart) {
        res.json(cart);
    }
    else{
        res.json({ customer: req.user._id, cartItems: [], totalAmount: 0 });
    }
});

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private/Customer
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity, customization_details } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.isVerified) {
        res.status(404);
        throw new Error('Product not found or not verified')
    }
    if(product.stock < quantity){
        res.status(400);
        throw new Error('Insufficient stock for the requested product');
    }

    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
        // Create a new cart if none exists
        cart = new Cart({
            customer: req.user._id,
            cartItems: [],
        });
    }

    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // If product exists in cart, update quantity and customization details
        cart.cartItems[itemIndex].quantity += quantity;
    }
    else{
        // Check if customization was provided
        // Parse JSON to check if there's actual data
        let hasCustomization = false;
        if (customization_details && customization_details.trim() !== '') {
            try {
                const parsed = JSON.parse(customization_details);
                // Check if any measurement field has a value
                hasCustomization = Object.values(parsed).some(val => val && val.trim() !== '');
            } catch (e) {
                // If not JSON, just check if string is not empty
                hasCustomization = true;
            }
        }
        const customizationCost = hasCustomization ? 150 : 0;
        
        console.log('Adding to cart - Customization Details:', customization_details);
        console.log('Has Customization:', hasCustomization);
        console.log('Customization Cost:', customizationCost);
        
        // If product does not exist in cart, add new item
        const newItem = {
            product: productId,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || '',
            quantity: quantity,
            customization_details: customization_details || '',
            customization_cost: customizationCost,
        };
        cart.cartItems.push(newItem);
    }

    // Recalculate total amount
    cart.totalAmount = calculateCartTotal(cart);

    await cart.save();
    res.status(201).json(cart);

});

// @desc    Remove product from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private/Customer

const removeFromCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    // Filter out the item to be removed
    const initialLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter
    (
        item => item._id.toString() !== req.params.productId
    ); 

    if (cart.cartItems.length === initialLength) {
        res.status(404);
        throw new Error('Product not found in cart');
    }

    // Recalculate total amount
    cart.totalAmount = calculateCartTotal(cart);
    await cart.save();

    res.json({ message: 'Product removed from cart', cart});

});

// @desc    Update product quantity in cart
// @route   PUT /api/cart/update/:productId
// @access  Private/Customer
const updateCartQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Product not found in cart');
    }

    // Check if product has enough stock
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Insufficient stock for the requested quantity');
    }

    // Update the quantity
    cart.cartItems[itemIndex].quantity = quantity;

    // Recalculate total amount
    cart.totalAmount = calculateCartTotal(cart);

    await cart.save();
    res.json(cart);
});

export { getCart, addToCart, removeFromCart, updateCartQuantity };

