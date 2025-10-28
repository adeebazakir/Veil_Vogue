// frontend/src/CartScreen.jsx (Refactored with Tailwind CSS)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import CustomizationDisplay from './components/CustomizationDisplay';
import './CartScreen.css';
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const CartScreen = () => {
    const [cart, setCart] = useState({ cartItems: [], totalAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const API_URL = 'http://localhost:5000/api/cart';

    const fetchCart = async () => {
        if (!userInfo) return navigate('/login');

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(API_URL, config);
            setCart(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch cart. Please log in.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const removeFromCartHandler = async (itemId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`${API_URL}/remove/${itemId}`, config);
            fetchCart(); // Refresh cart after removal
            
            // Dispatch custom event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove item.');
        }
    };
    
    // Total items counter for summary
    const totalItems = cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);

        if (loading) return <div className="text-center py-10 text-xl font-medium">Loading Cart...</div>;
        if (error) return <div className="text-center py-10 text-xl font-bold text-red-600">{error}</div>;

        return (
                <div className="cartitems">
                        <div className="cartitems-format-main">
                                <p>Products</p>
                                <p>Title</p>
                                <p>Price</p>
                                <p>Quantity</p>
                                <p>Total</p>
                                <p>Remove</p>
                        </div>
                        <hr />
                    {cart.cartItems.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-lg shadow-md">
                                    <p className="text-xl text-gray-600">Your cart is empty.</p>
                                    <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-semibold">
                                            Start Shopping
                                    </Link>
                            </div>
                    ) : (
                            cart.cartItems.map((item) => (
                                    <div key={item._id}>
                                            <div className="cartitems-format cartitems-format-main">
                                                    <img className='carticon-product-icon' src={item.image || 'https://via.placeholder.com/90'} alt={item.name} />
                                                    <p>{item.name}</p>
                                                    <p>₹{Math.round(item.price)}</p>
                                                    <button className='cartitems-quantity'>{item.quantity}</button>
                                                    <p>₹{Math.round((item.price + (item.customization_cost || 0)) * item.quantity)}</p>
                                                    <button className="carticon-remove-icon" onClick={() => removeFromCartHandler(item._id)} aria-label="Remove item">
                                                            <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                            </div>
                                            {/* Display customization if present */}
                                            <div className="cart-item-customization">
                                                <CustomizationDisplay 
                                                    customizationDetails={item.customization_details}
                                                    customizationCost={item.customization_cost}
                                                />
                                            </div>
                                            <hr />
                                    </div>
                            ))
                    )}
                    <div className="cartitems-down">
                        <div className="cartitems-total">
                                <h1>Cart Totals</h1>
                                        <div>
                                                <div className="cartitems-total-item">
                                                        <p>Subtotal</p>
                                                        <p>₹{Math.round(cart.totalAmount)}</p>
                                                </div>
                                                <hr />
                                                <div className="cartitems-total-item">
                                                        <p>Shipping Fee</p>
                                                        <p style={{ color: '#10b981', fontWeight: 'bold' }}>Free</p>    
                                                </div>
                                                <hr />
                                                <div className="cartitems-total-item">
                                                        <h3>Total</h3>
                                                        <h3>₹{Math.round(cart.totalAmount)}</h3>
                                                </div>
                                        </div>
                                        <button onClick={() => navigate('/shipping')} >PROCEED TO CHECKOUT</button>
                        </div>
                    </div>
                </div>
        );
};

export default CartScreen;