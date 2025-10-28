// frontend/src/ProfileScreen.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileScreen.css';
import CustomizationDisplay from './components/CustomizationDisplay';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    
    // Seller-specific state
    const [sellerProducts, setSellerProducts] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    
    // Customer-specific state
    const [customerOrders, setCustomerOrders] = useState([]);
    const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);
    
    // Edit product state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        stock: ''
    });

    // Profile data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');

    // Password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        // Load user data only once on mount
        setName(userInfo.name || '');
        setEmail(userInfo.email || '');
        setRole(userInfo.role || '');
        setAddress(userInfo.address || '');
        setContact(userInfo.contact || '');
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const updateProfileHandler = async (e) => {
        e.preventDefault();
        
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put(
                'http://localhost:5000/api/users/profile',
                { name, email, address, contact },
                config
            );

            // Update localStorage
            const updatedUserInfo = { 
                ...userInfo, 
                name: data.name, 
                email: data.email,
                address: data.address,
                contact: data.contact
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            setTimeout(() => setError(null), 3000);
        }
    };

    const changePasswordHandler = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All password fields are required');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.put(
                'http://localhost:5000/api/users/password',
                { currentPassword, newPassword },
                config
            );

            setMessage(data.message || 'Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error('Password change error:', err.response);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to change password';
            setError(errorMessage);
            setTimeout(() => setError(null), 5000); // Show error for 5 seconds
        }
    };

    // Fetch seller products
    const fetchSellerProducts = async () => {
        if (role !== 'seller' || !userInfo) return;
        
        setLoadingProducts(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/products/seller/all', config);
            setSellerProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoadingProducts(false);
        }
    };

    // Fetch seller orders
    const fetchSellerOrders = async () => {
        if (role !== 'seller' || !userInfo) return;
        
        setLoadingOrders(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/orders/seller/myorders', config);
            setSellerOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Fetch customer orders
    const fetchCustomerOrders = async () => {
        if (role !== 'customer' || !userInfo) return;
        
        setLoadingCustomerOrders(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
            setCustomerOrders(data);
        } catch (err) {
            console.error('Error fetching customer orders:', err);
            setError(err.response?.data?.message || 'Failed to load order history');
        } finally {
            setLoadingCustomerOrders(false);
        }
    };

    // Load seller data when switching to seller tabs
    useEffect(() => {
        if (role === 'seller') {
            if (activeTab === 'products') {
                fetchSellerProducts();
            } else if (activeTab === 'orders') {
                fetchSellerOrders();
            }
        } else if (role === 'customer') {
            if (activeTab === 'orderHistory') {
                fetchCustomerOrders();
            }
        }
    }, [activeTab, role]);

    // Open edit modal with product data
    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            stock: product.stock
        });
        setShowEditModal(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
        setEditForm({
            name: '',
            price: '',
            description: '',
            category: '',
            stock: ''
        });
        setError(null);
    };

    // Handle edit form input change
    const handleEditFormChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    // Save edited product
    const saveEditedProduct = async (e) => {
        e.preventDefault();
        
        if (!editingProduct) return;

        try {
            const config = {
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}` 
                }
            };

            await axios.put(
                `http://localhost:5000/api/products/${editingProduct._id}`,
                editForm,
                config
            );

            setMessage('Product updated successfully!');
            setTimeout(() => setMessage(null), 3000);
            
            // Refresh products list
            fetchSellerProducts();
            closeEditModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
            setTimeout(() => setError(null), 3000);
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                {/* Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="profile-name">{name}</h1>
                    <p className="profile-email">{email}</p>
                    <span className="profile-role-badge">
                        {role}
                    </span>
                </div>

                {/* Success/Error Messages */}
                {message && (
                    <div className="alert alert-success">
                        <p>{message}</p>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        <p>{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="profile-card">
                    <nav className="tabs-nav">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        >
                            👤 Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
                        >
                            🔐 Password
                        </button>
                        {role === 'customer' && (
                            <button
                                onClick={() => setActiveTab('orderHistory')}
                                className={`tab-button ${activeTab === 'orderHistory' ? 'active' : ''}`}
                            >
                                📦 Order History
                            </button>
                        )}
                        {role === 'seller' && (
                            <>
                                <button
                                    onClick={() => setActiveTab('addProduct')}
                                    className={`tab-button ${activeTab === 'addProduct' ? 'active' : ''}`}
                                >
                                    ➕ Add Product
                                </button>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                                >
                                    📦 My Products
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                                >
                                    🛍️ Orders
                                </button>
                            </>
                        )}
                    </nav>

                    <div className="tab-content">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={updateProfileHandler} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">
                                        📝 Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        📧 Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address" className="form-label">
                                        🏠 Address
                                    </label>
                                    <textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your complete address"
                                        rows="3"
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contact" className="form-label">
                                        📱 Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="contact"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your contact number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        🎭 Account Role
                                    </label>
                                    <input
                                        type="text"
                                        value={role.charAt(0).toUpperCase() + role.slice(1)}
                                        disabled
                                        className="form-input"
                                    />
                                </div>

                                <button type="submit" className="submit-button">
                                    Update Profile
                                </button>
                            </form>
                        )}

                        {/* Order History Tab - For Customers Only */}
                        {activeTab === 'orderHistory' && role === 'customer' && (
                            <div className="customer-section">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">📦 My Order History</h3>
                                    <button
                                        onClick={fetchCustomerOrders}
                                        className="refresh-btn"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>

                                {loadingCustomerOrders ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Loading orders...</p>
                                    </div>
                                ) : customerOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
                                        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="submit-button"
                                            style={{ maxWidth: '300px', margin: '0 auto' }}
                                        >
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {customerOrders.map((order) => {
                                            const totalItems = order.orderItems.reduce((acc, item) => acc + item.qty, 0);
                                            
                                            return (
                                                <div key={order._id} className="order-item customer-order">
                                                    {/* Order Header */}
                                                    <div className="order-header" style={{ 
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        padding: '1rem',
                                                        borderRadius: '8px 8px 0 0'
                                                    }}>
                                                        <div>
                                                            <p className="order-id" style={{ color: 'white', fontWeight: 'bold' }}>
                                                                Order ID: #{order._id.substring(0, 10).toUpperCase()}
                                                            </p>
                                                            <p className="order-date" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                                                                📅 {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div className="order-status" style={{
                                                                background: order.isPaid ? '#10b981' : '#f59e0b',
                                                                color: 'white',
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '20px',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {order.isPaid ? '✓ Paid' : '⏳ Pending Payment'}
                                                            </div>
                                                            {order.isDelivered && (
                                                                <div style={{
                                                                    background: '#10b981',
                                                                    color: 'white',
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 'bold',
                                                                    marginTop: '0.5rem'
                                                                }}>
                                                                    ✓ Delivered
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="order-products" style={{ padding: '1rem' }}>
                                                        {order.orderItems.map((item, idx) => (
                                                            <div key={idx} className="order-product-row" style={{
                                                                display: 'flex',
                                                                gap: '1rem',
                                                                padding: '1rem',
                                                                background: idx % 2 === 0 ? '#f9fafb' : 'white',
                                                                borderRadius: '8px',
                                                                marginBottom: '0.5rem',
                                                                border: '1px solid #e5e7eb'
                                                            }}>
                                                                <img
                                                                    src={item.image || '/images/placeholder-product.jpg'}
                                                                    alt={item.name}
                                                                    className="order-product-image"
                                                                    style={{
                                                                        width: '80px',
                                                                        height: '80px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px',
                                                                        border: '2px solid #e5e7eb'
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="order-product-name" style={{
                                                                        fontWeight: 'bold',
                                                                        fontSize: '1rem',
                                                                        color: '#1f2937',
                                                                        marginBottom: '0.5rem'
                                                                    }}>
                                                                        {item.name}
                                                                    </p>
                                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                                                                        <p>Quantity: <strong>{item.qty}</strong></p>
                                                                        <p>Price: <strong>₹{item.price}</strong></p>
                                                                        <p>Subtotal: <strong>₹{(item.price * item.qty).toFixed(2)}</strong></p>
                                                                    </div>
                                                                    
                                                                    {/* Customization Details */}
                                                                    {item.customization_details && (
                                                                        <div style={{ marginTop: '0.75rem' }}>
                                                                            <CustomizationDisplay 
                                                                                customizationDetails={item.customization_details}
                                                                                customizationCost={item.customization_cost}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Order Summary */}
                                                    <div className="order-summary" style={{
                                                        padding: '1rem',
                                                        background: '#f9fafb',
                                                        borderTop: '2px solid #e5e7eb'
                                                    }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                            {/* Shipping Address */}
                                                            <div>
                                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>
                                                                    📍 Shipping Address
                                                                </h4>
                                                                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
                                                                    {order.shippingAddress?.address}<br />
                                                                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                                                    {order.shippingAddress?.country}
                                                                </p>
                                                            </div>
                                                            
                                                            {/* Payment & Price Details */}
                                                            <div>
                                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>
                                                                    💳 Payment & Total
                                                                </h4>
                                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                                    <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                                                    <p><strong>Total Items:</strong> {totalItems}</p>
                                                                    <p style={{ 
                                                                        fontSize: '1.1rem', 
                                                                        fontWeight: 'bold', 
                                                                        color: '#059669', 
                                                                        marginTop: '0.5rem' 
                                                                    }}>
                                                                        Total: ₹{order.totalPrice?.toFixed(2) || '0.00'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* View Details Button */}
                                                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => navigate(`/order/${order._id}`)}
                                                                className="submit-button"
                                                                style={{
                                                                    padding: '0.75rem 2rem',
                                                                    fontSize: '0.9rem',
                                                                    maxWidth: '250px'
                                                                }}
                                                            >
                                                                📄 View Full Order Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <form onSubmit={changePasswordHandler} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="currentPassword" className="form-label">
                                        🔒 Current Password
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="newPassword" className="form-label">
                                        🆕 New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter new password (min 6 characters)"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        ✅ Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                </div>

                                <button type="submit" className="submit-button">
                                    Change Password
                                </button>
                            </form>
                        )}

                        {/* Add Product Tab - For Sellers Only */}
                        {activeTab === 'addProduct' && role === 'seller' && (
                            <div className="seller-section">
                                <div className="seller-info-box">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Add New Product</h3>
                                    <p className="text-gray-600 mb-4">
                                        Use the seller dashboard to add new products with images and detailed information.
                                    </p>
                                    <button
                                        onClick={() => navigate('/seller/products')}
                                        className="submit-button"
                                    >
                                        Go to Product Upload Page
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* My Products Tab - For Sellers Only */}
                        {activeTab === 'products' && role === 'seller' && (
                            <div className="seller-section">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">📦 My Products</h3>
                                    <button
                                        onClick={fetchSellerProducts}
                                        className="refresh-btn"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>

                                {loadingProducts ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Loading products...</p>
                                    </div>
                                ) : sellerProducts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 mb-4">You haven't added any products yet.</p>
                                        <button
                                            onClick={() => navigate('/seller/products')}
                                            className="submit-button"
                                            style={{ maxWidth: '300px', margin: '0 auto' }}
                                        >
                                            Add Your First Product
                                        </button>
                                    </div>
                                ) : (
                                    <div className="products-grid">
                                        {sellerProducts.map((product) => (
                                            <div key={product._id} className="product-item">
                                                <div className="product-image-container">
                                                    <img
                                                        src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                                                        alt={product.name}
                                                        className="product-image-small"
                                                    />
                                                    {product.isVerified ? (
                                                        <span className="status-badge verified">✓ Verified</span>
                                                    ) : (
                                                        <span className="status-badge pending">⏳ Pending</span>
                                                    )}
                                                </div>
                                                <div className="product-details-small">
                                                    <h4 className="product-name-small">{product.name}</h4>
                                                    <p className="product-price">₹{product.price}</p>
                                                    <p className="product-category">{product.category}</p>
                                                    <p className="product-stock">Stock: {product.stock}</p>
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="edit-product-btn"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab - For Sellers Only */}
                        {activeTab === 'orders' && role === 'seller' && (
                            <div className="seller-section">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">🛍️ My Orders</h3>
                                    <button
                                        onClick={fetchSellerOrders}
                                        className="refresh-btn"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>

                                {loadingOrders ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Loading orders...</p>
                                    </div>
                                ) : sellerOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No orders received yet.</p>
                                    </div>
                                ) : (
                                    <div className="orders-list">
                                        {sellerOrders.map((order) => (
                                            <div key={order._id} className="order-item">
                                                <div className="order-header">
                                                    <div>
                                                        <p className="order-id">Order #{order._id.substring(0, 8)}</p>
                                                        <p className="order-date">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="order-status">
                                                        {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                                                    </div>
                                                </div>
                                                <div className="order-products">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="order-product-row">
                                                            <img
                                                                src={item.image || '/images/placeholder-product.jpg'}
                                                                alt={item.name}
                                                                className="order-product-image"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="order-product-name">{item.name}</p>
                                                                <p className="order-product-qty">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="order-product-price">₹{item.price}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="order-customer">
                                                    <p><strong>Customer:</strong> {order.customer?.name || 'N/A'}</p>
                                                    <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="logout-section">
                    <button onClick={logoutHandler} className="logout-button">
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Edit Product Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">✏️ Edit Product</h2>
                            <button onClick={closeEditModal} className="modal-close-btn">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={saveEditedProduct} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">📝 Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditFormChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">💰 Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={editForm.price}
                                    onChange={handleEditFormChange}
                                    className="form-input"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">📦 Category</label>
                                <select
                                    name="category"
                                    value={editForm.category}
                                    onChange={handleEditFormChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Suits">Suits</option>
                                    <option value="Hijabs">Hijabs</option>
                                    <option value="Abayas">Abayas</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">📊 Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={editForm.stock}
                                    onChange={handleEditFormChange}
                                    className="form-input"
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">📄 Description</label>
                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditFormChange}
                                    className="form-input"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                >
                                    💾 Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;

