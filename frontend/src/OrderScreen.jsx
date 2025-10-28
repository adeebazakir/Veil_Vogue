// frontend/src/OrderScreen.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CustomizationDisplay from './components/CustomizationDisplay';
import { API_BASE_URL } from './config/api';

const OrderScreen = () => {
    const { id: orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchOrder = async () => {
        if (!userInfo) return;

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, config);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError('Order not found or access denied.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    if (loading) return <div style={containerStyle}><h2>Loading Order Details...</h2></div>;
    if (error) return <div style={containerStyle}><h2 style={{ color: 'red' }}>{error}</h2></div>;
    if (!order) return null;

    return (
        <div style={containerStyle}>
            <h2>Order ID: {order._id}</h2>
            <div style={layoutStyle}>
                <div style={detailsStyle}>
                    <h3>Shipping</h3>
                    <p>Name: **{order.customer.name}**</p>
                    <p>Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                    <hr />

                    <h3>Payment</h3>
                    <p>Method: **{order.paymentMethod}**</p>
                    <p>Status: {order.isPaid ? 
                        <span style={{color: 'green', fontWeight: 'bold'}}>PAID on {new Date(order.paidAt).toLocaleDateString()}</span> 
                        : <span style={{color: 'red', fontWeight: 'bold'}}>NOT PAID</span>}
                    </p>
                    <hr />

                    <h3>Delivery</h3>
                    <p>Status: {order.isDelivered ? 
                        <span style={{color: 'green', fontWeight: 'bold'}}>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span> 
                        : <span style={{color: 'orange', fontWeight: 'bold'}}>Processing</span>}
                    </p>
                    <hr />
                    
                    <h3>Order Items</h3>
                    {order.orderItems.map((item, index) => (
                         <div key={index} style={itemStyle}>
                            <p style={{ flex: 1, fontWeight: 'bold' }}>{item.name}</p>
                            <p style={{ flex: 1, textAlign: 'right' }}>
                                {item.qty} x ₹{item.price.toFixed(2)} = **₹{(item.qty * item.price).toFixed(2)}**
                            </p>
                            {item.customization_details && (
                                <div style={{ width: '100%', marginTop: '0.5rem' }}>
                                    <CustomizationDisplay 
                                        customizationDetails={item.customization_details}
                                        customizationCost={item.customization_cost}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={summaryStyle}>
                    <h3>Order Summary</h3>
                    <div style={priceDetailStyle}><p>Items</p><p>₹{order.itemsPrice.toFixed(2)}</p></div>
                    <div style={priceDetailStyle}><p>Shipping</p><p>₹{order.shippingPrice.toFixed(2)}</p></div>
                    <hr />
                    <div style={priceDetailStyle}><h4>Total</h4><h4>**₹{order.totalPrice.toFixed(2)}**</h4></div>
                    
                    {!order.isPaid && order.paymentMethod !== 'COD' && (
                         <button 
                            onClick={() => console.log('Simulating Payment API Call')} 
                            style={payButtonStyle}
                        >
                            Pay Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
// Reuse styles from PlaceOrderScreen.jsx (simplified for brevity)
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: 'auto' };
const layoutStyle = { display: 'flex', gap: '30px', marginTop: '20px' };
const detailsStyle = { flex: 2, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
const summaryStyle = { flex: 1, padding: '20px', border: '1px solid #333', borderRadius: '8px', height: 'fit-content' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', flexWrap: 'wrap' };
const priceDetailStyle = { display: 'flex', justifyContent: 'space-between', margin: '5px 0' };
const payButtonStyle = { width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' };

export default OrderScreen;