import express from 'express';
const router = express.Router();
import { getCart, addToCart, removeFromCart} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

//GET /api/cart: View the cart
router.get('/', protect, getCart);

//POST /api/cart/add: Add item to the cart
router.post('/add', protect, addToCart);

//DELETE /api/cart/remove/:producttId Remove item from the cart
router.delete('/remove/:productId', protect, removeFromCart);

export default router;
