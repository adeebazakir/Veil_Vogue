import express from 'express';
const router = express.Router();
import { 
    authUser, 
    registerUser, 
    getAdminStats, 
    getAllSellers, 
    getAllCustomers, 
    deleteUser,
    updateUserProfile,
    changePassword
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';


// The registerUser function handles account creation (FR-1)
router.post('/register', registerUser); 
// The authUser function handles secure login (FR-1)
router.post('/login', authUser);

// User profile routes
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, changePassword);

// Get admin statistics
router.get('/admin/stats', protect, isAdmin, getAdminStats);
// Get all sellers
router.get('/admin/sellers', protect, isAdmin, getAllSellers);
// Get all customers
router.get('/admin/customers', protect, isAdmin, getAllCustomers);
// Delete user
router.delete('/admin/:id', protect, isAdmin, deleteUser);

export default router;