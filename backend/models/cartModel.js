import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    customization_details: {
        type: String,
        default: '',
    },
    customization_cost: {
        type: Number,
        default: 0,
    }
});

const cartSchema = new mongoose.Schema({
    // Reference to the user who owns the cart
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true,    // A customer should only have one active cart
    },
    // The items in the cart
    cartItems: [cartItemSchema],

    // Total calculated amount based on items
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;