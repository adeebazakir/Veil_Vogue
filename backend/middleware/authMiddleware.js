import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Middleware to protect routes and ensure the user is authenticated
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if(
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } 
        catch(error){
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if(!token){
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

//Middleware to ensure user has the 'seller' role
const isSeller = (req, res, next) => {
    if (req.user && req.user.role === 'seller'){
        next();
    }
    else{
        res.status(401);
        throw new Error('Not authorized as a seller');
    }
};

//Middleware to ensure user has the 'admin' role
const isAdmin = (req, res, next) => {
    // Admin is a key user class with advanced functionalities
    if (req.user && req.user.role === 'admin'){
        next();
    }
    else{
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

export { protect, isSeller, isAdmin };