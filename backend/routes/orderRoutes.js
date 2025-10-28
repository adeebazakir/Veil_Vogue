// backend/routes/orderRoutes.js

import express from 'express';
const router = express.Router();
import { 
    addOrderItems, 
    getMyOrders, 
    getOrderById,
    updateOrderToPaid,
    getSellerOrders
} from '../controllers/orderController.js';

import { protect, isSeller } from '../middleware/authMiddleware.js';

// POST /api/orders: Create new order (FR-6)
router.post('/', protect, addOrderItems); 
// GET /api/orders/myorders: View customer's order history (FR-6)
router.get('/myorders', protect, getMyOrders);
// GET /api/orders/seller/myorders: View seller's orders (products they sold)
router.get('/seller/myorders', protect, isSeller, getSellerOrders);
// GET /api/orders/:id: View single order details
router.get('/:id', protect, getOrderById);
// PUT /api/orders/:id/pay: Update payment status
router.put('/:id/pay', protect, updateOrderToPaid);

export default router;