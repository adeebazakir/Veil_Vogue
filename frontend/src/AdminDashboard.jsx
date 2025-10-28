import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from './config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filter, setFilter] = useState('all'); // all, verified, pending
    const [activeTab, setActiveTab] = useState('products'); // products, customers, sellers
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        // Check admin access
        if (!userInfo || userInfo.role !== 'admin') {
            setError('Access Denied: Admin privileges required');
            setLoading(false);
            navigate('/login');
            return;
        }
        
        fetchAllData();
    }, []);

    // Fetch all data
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` } 
            };
            
            // Fetch products, customers, sellers, and stats in parallel
            const [productsRes, customersRes, sellersRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/products/admin/all-products', config),
                axios.get('http://localhost:5000/api/users/admin/customers', config),
                axios.get('http://localhost:5000/api/users/admin/sellers', config),
                axios.get('http://localhost:5000/api/users/admin/stats', config)
            ]);
            
            // Handle products data
            const productsData = productsRes.data.products || productsRes.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
            
            // Handle customers data
            const customersData = customersRes.data.customers || customersRes.data || [];
            setCustomers(Array.isArray(customersData) ? customersData : []);
            
            // Handle sellers data
            const sellersData = sellersRes.data.sellers || sellersRes.data || [];
            setSellers(Array.isArray(sellersData) ? sellersData : []);
            
            // Handle stats data
            const statsData = statsRes.data.stats || statsRes.data || {};
            setStats({
                totalCustomers: statsData.totalCustomers || customersData.length || 0,
                totalSellers: statsData.totalSellers || sellersData.length || 0,
                totalAdmins: statsData.totalAdmins || 0,
                totalUsers: statsData.totalUsers || 0
            });
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            console.error('Error details:', err.response?.data);
            setError('Failed to load data: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Fetch products only
    const fetchProducts = async () => {
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` } 
            };
            
            const { data } = await axios.get('http://localhost:5000/api/products/admin/all-products', config);
            setProducts(data.products || data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        }
    };

    // Toggle product verification
    const toggleVerification = async (productId, currentStatus) => {
        const action = currentStatus ? 'unverify' : 'verify';
        
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` } 
            };
            
            await axios.put(
                `http://localhost:5000/api/products/admin/verify/${productId}`, 
                { isVerified: !currentStatus },
                config
            );
            
            setSuccess(`Product ${action}ed successfully!`);
            fetchProducts(); // Refresh list
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(`Failed to ${action} product`);
            setTimeout(() => setError(null), 3000);
        }
    };

    // Delete product
    const deleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` } 
            };
            
            await axios.delete(`http://localhost:5000/api/products/${productId}`, config);
            setSuccess('Product deleted successfully');
            fetchProducts();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete product');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Delete user (customer or seller)
    const deleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) return;
        
        try {
            const config = { 
                headers: { Authorization: `Bearer ${userInfo.token}` } 
            };
            
            await axios.delete(`http://localhost:5000/api/users/admin/${userId}`, config);
            setSuccess('User deleted successfully');
            
            // Refresh data
            fetchAllData();
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
            setTimeout(() => setError(null), 3000);
        }
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        if (filter === 'verified') return product.isVerified;
        if (filter === 'pending') return !product.isVerified;
        return true; // all
    });

    const verifiedCount = products.filter(p => p.isVerified).length;
    const pendingCount = products.filter(p => !p.isVerified).length;

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="admin-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading Admin Dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-container">
                {/* Header */}
                <div className="admin-header fade-in">
                    <h1 className="admin-header-title">🛡️ Admin Dashboard</h1>
                    <p className="admin-header-subtitle">Manage and verify products submitted by sellers</p>
                </div>

                {/* Alert Messages */}
                {success && (
                    <div className="admin-alert admin-alert-success">
                        <span className="admin-alert-icon">✓</span>
                        <p className="font-medium">{success}</p>
                    </div>
                )}
                
                {error && (
                    <div className="admin-alert admin-alert-error">
                        <span className="admin-alert-icon">⚠</span>
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="admin-stats fade-in">
                    <div className="stats-grid stats-grid-extended">
                        <div className="stat-card stat-card-total">
                            <div className="stat-icon">📦</div>
                            <div className="stat-number">{products.length}</div>
                            <div className="stat-label">Total Products</div>
                        </div>
                        <div className="stat-card stat-card-verified">
                            <div className="stat-icon">✓</div>
                            <div className="stat-number">{verifiedCount}</div>
                            <div className="stat-label">Verified</div>
                        </div>
                        <div className="stat-card stat-card-pending">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-number">{pendingCount}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-card stat-card-customers">
                            <div className="stat-icon">👥</div>
                            <div className="stat-number">{stats.totalCustomers || customers.length || 0}</div>
                            <div className="stat-label">Customers</div>
                        </div>
                        <div className="stat-card stat-card-sellers">
                            <div className="stat-icon">🏪</div>
                            <div className="stat-number">{stats.totalSellers || sellers.length || 0}</div>
                            <div className="stat-label">Sellers</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs fade-in">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`tab-button ${activeTab === 'products' ? 'tab-active' : ''}`}
                    >
                        📦 Products
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`tab-button ${activeTab === 'customers' ? 'tab-active' : ''}`}
                    >
                        👥 Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('sellers')}
                        className={`tab-button ${activeTab === 'sellers' ? 'tab-active' : ''}`}
                    >
                        🏪 Sellers
                    </button>
                </div>

                {/* Filter Buttons - Only for Products Tab */}
                {activeTab === 'products' && (
                    <div className="admin-filters fade-in">
                        <button
                            onClick={() => setFilter('all')}
                            className={`filter-button filter-button-all ${filter === 'all' ? 'active' : 'inactive'}`}
                        >
                            📦 All Products
                        </button>
                        <button
                            onClick={() => setFilter('verified')}
                            className={`filter-button filter-button-verified ${filter === 'verified' ? 'active' : 'inactive'}`}
                        >
                            ✓ Verified
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`filter-button filter-button-pending ${filter === 'pending' ? 'active' : 'inactive'}`}
                        >
                            ⏳ Pending
                        </button>
                    </div>
                )}

                {/* Products Section */}
                {activeTab === 'products' && (
                    <div className="products-section fade-in">
                    {filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="empty-state-title">No products found</h3>
                            <p className="empty-state-message">
                                {filter === 'pending' 
                                    ? '🎉 All products are verified!' 
                                    : filter === 'verified' 
                                    ? '📋 No verified products yet' 
                                    : '📭 No products have been submitted yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <div key={product._id} className="product-card">
                                    {/* Product Image */}
                                    <div className="product-image-wrapper">
                                        <img
                                            src={product.images?.[0]?.url || PLACEHOLDER_IMAGE}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                        <div className={`product-badge ${
                                            product.isVerified 
                                                ? 'product-badge-verified' 
                                                : 'product-badge-pending'
                                        }`}>
                                            {product.isVerified ? '✓ Verified' : '⏳ Pending'}
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="product-details">
                                        <h3 className="product-name" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <p className="product-category">{product.category}</p>
                                        <p className="product-price">₹{product.price}</p>
                                        
                                        <div className="product-seller">
                                            <strong>Seller:</strong> {product.seller?.name || 'Unknown'}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="product-actions">
                                            <button
                                                onClick={() => toggleVerification(product._id, product.isVerified)}
                                                className={`action-button ${
                                                    product.isVerified
                                                        ? 'action-button-unverify'
                                                        : 'action-button-verify'
                                                }`}
                                            >
                                                {product.isVerified ? '↩️ Unverify Product' : '✓ Verify Product'}
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product._id)}
                                                className="action-button action-button-delete"
                                            >
                                                🗑️ Delete Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                )}

                {/* Customers Section */}
                {activeTab === 'customers' && (
                    <div className="users-section fade-in">
                        <h2 className="section-title">👥 All Customers</h2>
                        {customers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="empty-state-title">No Customers Found</h3>
                                <p className="empty-state-message">No customers have registered yet</p>
                            </div>
                        ) : (
                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Contact</th>
                                            <th>Address</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((customer) => (
                                            <tr key={customer._id}>
                                                <td>
                                                    <div className="user-name">
                                                        <span className="user-avatar">👤</span>
                                                        {customer.name}
                                                    </div>
                                                </td>
                                                <td>{customer.email}</td>
                                                <td>{customer.contact || 'N/A'}</td>
                                                <td>{customer.address || 'N/A'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => deleteUser(customer._id, customer.name)}
                                                        className="action-button action-button-delete-small"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Sellers Section */}
                {activeTab === 'sellers' && (
                    <div className="users-section fade-in">
                        <h2 className="section-title">🏪 All Sellers</h2>
                        {sellers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="empty-state-title">No Sellers Found</h3>
                                <p className="empty-state-message">No sellers have registered yet</p>
                            </div>
                        ) : (
                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Contact</th>
                                            <th>Address</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sellers.map((seller) => (
                                            <tr key={seller._id}>
                                                <td>
                                                    <div className="user-name">
                                                        <span className="user-avatar">🏪</span>
                                                        {seller.name}
                                                    </div>
                                                </td>
                                                <td>{seller.email}</td>
                                                <td>{seller.contact || 'N/A'}</td>
                                                <td>{seller.address || 'N/A'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => deleteUser(seller._id, seller.name)}
                                                        className="action-button action-button-delete-small"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
