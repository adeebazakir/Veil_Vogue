import dotenv from 'dotenv';

// CRITICAL: Load environment variables FIRST before any other imports
// This ensures Cloudinary and other services can access their config
dotenv.config();

import express from 'express';
import mongoose from'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js'; // Import user routes
import productRoutes from './routes/productRoutes.js'; // Import product routes
import cartRoutes from './routes/cartRoutes.js'; // Import cart routes
import orderRoutes from './routes/orderRoutes.js'; // Import order routes
import uploadRoutes from './routes/uploadRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js'; // Import review routes


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Upload routes MUST come before express.json() to handle multipart/form-data
app.use('/api/upload', uploadRoutes);

app.use(express.json());

const connectDB = async() => {
 try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.')
 }
 catch(error)
 {
    console.error(`Error: ${error.message}`);
    process.exit(1);
 }
 };

 connectDB();

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Root route
app.get('/', (req, res) => {
    res.send("Veil & Vogue API is running...");
});

// Error Handling Middleware (for handling errors thrown by express-async-handler)
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

app.use(errorHandler);

 app.listen(PORT,() => console.log (`Server running on ${PORT}`));