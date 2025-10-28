// frontend/src/PlaceOrderScreen.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderLoading, setOrderLoading] = useState(false);
    const [error, setError] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
    const paymentMethod = localStorage.getItem('paymentMethod');

    // Free shipping - No shipping cost applied
    const SHIPPING_COST = 0.00;

    const fetchCart = async () => {
        if (!userInfo) {
            alert('Please login to place an order');
            navigate('/login');
            return;
        }
        
        if (!shippingAddress || !paymentMethod) {
            navigate('/shipping');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/cart`, config);
            
            const itemsPrice = data.totalAmount;
            const taxPrice = 0; // No tax
            const shippingPrice = 0; // Free shipping
            const totalPrice = itemsPrice; // Only items price, no shipping

            setCart({
                ...data,
                itemsPrice: itemsPrice,
                taxPrice: taxPrice,
                shippingPrice: shippingPrice,
                totalPrice: totalPrice,
            });
            setLoading(false);

        } catch (err) {
            setError('Error fetching cart or details. Please check cart.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const placeOrderHandler = async () => {
        setOrderLoading(true);
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            
            const orderData = {
                shippingAddress,
                paymentMethod,
                itemsPrice: cart.itemsPrice,
                taxPrice: cart.taxPrice,
                shippingPrice: cart.shippingPrice,
                totalPrice: cart.totalPrice,
            };

            // Call the addOrderItems API (FR-6: Creates order, updates stock, clears cart)
            const { data } = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);
            
            // Clear temporary storage
            localStorage.removeItem('shippingAddress');
            localStorage.removeItem('paymentMethod');

            navigate(`/order/${data._id}`); // Redirect to order success page
        } catch (err) {
            setError(err.response?.data?.message || 'Error placing order.');
        } finally {
            setOrderLoading(false);
        }
    };

    if (loading || !cart) return <div style={containerStyle}><h2>Loading Order Summary...</h2></div>;
    if (error) return <div style={containerStyle}><h2 style={{ color: 'red' }}>{error}</h2></div>;
    if (cart.cartItems.length === 0) return <div style={containerStyle}><p>Your cart is empty. <Link to="/">Go Shopping</Link></p></div>;

    return (
        <div style={containerStyle}>
            <h2>Place Order (3/3)</h2>
            <div style={layoutStyle}>
                <div style={detailsStyle}>
                    <h3>Shipping</h3>
                    <p>Address: {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
                    <hr />

                    <h3>Payment Method</h3>
                    <p>Method: **{paymentMethod}**</p>
                    <hr />

                    <h3>Order Items</h3>
                    {cart.cartItems.map(item => (
                        <div key={item._id} style={itemStyle}>
                            <p style={{ flex: 1 }}>
                                <Link to={`/product/${item.product}`}>{item.name}</Link>
                            </p>
                            <p style={{ flex: 1, textAlign: 'right' }}>
                                {item.quantity} x ₹{item.price.toFixed(2)} = **₹{(item.quantity * item.price).toFixed(2)}**
                            </p>
                            {item.customization_details && <p style={{ fontSize: '0.8em', color: '#555', gridColumn: '1 / span 2' }}>Customization: {item.customization_details}</p>}
                        </div>
                    ))}
                </div>

                <div style={summaryStyle}>
                    <h3>Order Summary</h3>
                    <div style={priceDetailStyle}><p>Items</p><p>₹{cart.itemsPrice.toFixed(2)}</p></div>
                    <div style={priceDetailStyle}>
                        <p>Shipping</p>
                        <p style={{ color: '#10b981', fontWeight: 'bold' }}>Free</p>
                    </div>
                    <hr />
                    <div style={priceDetailStyle}><h4>Total</h4><h4>**₹{cart.totalPrice.toFixed(2)}**</h4></div>
                    
                    <button 
                        onClick={placeOrderHandler} 
                        style={placeOrderButtonStyle}
                        disabled={orderLoading}
                    >
                        {orderLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </div>
            </div>
        </div>
    );
};

// Styles
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: 'auto' };
const layoutStyle = { display: 'flex', gap: '30px', marginTop: '20px' };
const detailsStyle = { flex: 2, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
const summaryStyle = { flex: 1, padding: '20px', border: '1px solid #333', borderRadius: '8px', height: 'fit-content' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', flexWrap: 'wrap' };
const priceDetailStyle = { display: 'flex', justifyContent: 'space-between', margin: '5px 0' };
const placeOrderButtonStyle = { width: '100%', padding: '15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' };

export default PlaceOrderScreen;