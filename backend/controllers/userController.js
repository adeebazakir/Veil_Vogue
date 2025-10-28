// backend/controllers/userController.js

import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler'; // Simple express middleware for handling exceptions inside async express routes
import jwt from 'jsonwebtoken';

// Helper function to generate JWT
const generateToken = (id) => {
    // JWT is used for secure user authentication 
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, address, contact } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password, // Password is automatically hashed by the pre-save hook in the model
        role: role || 'customer', // Default role is 'customer'
        address,
        contact
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            contact: user.contact,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // matchPassword method uses bcrypt.compare() to check the password
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            contact: user.contact,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get admin statistics (total users by role)
// @route   GET /api/users/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    try {
        // Count users by role
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalSellers = await User.countDocuments({ role: 'seller' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalUsers = await User.countDocuments({});

        res.json({
            success: true,
            stats: {
                totalCustomers,
                totalSellers,
                totalAdmins,
                totalUsers
            }
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch statistics');
    }
});

// @desc    Get all sellers
// @route   GET /api/users/admin/sellers
// @access  Private/Admin
const getAllSellers = asyncHandler(async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }).select('-password');
        res.json({
            success: true,
            sellers
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch sellers');
    }
});

// @desc    Get all customers
// @route   GET /api/users/admin/customers
// @access  Private/Admin
const getAllCustomers = asyncHandler(async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('-password');
        res.json({
            success: true,
            customers
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch customers');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin users');
        }

        await User.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete user');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        // Update address and contact (allow empty string to clear fields)
        if (req.body.address !== undefined) {
            user.address = req.body.address;
        }
        if (req.body.contact !== undefined) {
            user.contact = req.body.contact;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            address: updatedUser.address,
            contact: updatedUser.contact,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide both current and new password');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters long');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if current password is correct
    const isPasswordMatch = await user.matchPassword(currentPassword);
    
    if (!isPasswordMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ 
        success: true,
        message: 'Password updated successfully' 
    });
});

export { 
    registerUser, 
    authUser, 
    getAdminStats, 
    getAllSellers, 
    getAllCustomers, 
    deleteUser,
    updateUserProfile,
    changePassword
};