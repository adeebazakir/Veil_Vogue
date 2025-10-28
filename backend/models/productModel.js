import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    // 'Seller_id' links the product back to the User who created it
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Reference to User model
    },
    name:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
        default: 0,
    },
    description:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,     
    },
    stock:{
        type: Number,
        required: true,
        default: 0,
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }],
    isVerified:{
        type: Boolean,
        required: true,
        default: false,
    },rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },

},{
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
export default Product;