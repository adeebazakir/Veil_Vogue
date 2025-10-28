import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from './config/api';
import CustomizationDisplay from './components/CustomizationDisplay';

const SellerDashboardNew = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'products', 'orders'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Upload Product States (existing from SellerProductScreen)
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('Suits');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const categories = ['Suits', 'Hijabs', 'Accessories', 'Abayas'];

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'seller') {
            navigate('/login');
        }
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'products') {
            fetchVerifiedProducts();
        } else if (activeTab === 'orders') {
            fetchSellerOrders();
        }
    }, [activeTab]);

    const fetchVerifiedProducts = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/products/seller/verified', config);
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
            setLoading(false);
        }
    };

    const fetchSellerOrders = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get('http://localhost:5000/api/orders/seller/myorders', config);
            setOrders(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to fetch orders');
            setLoading(false);
        }
    };

    // Image upload handlers
    const handleFileChange = (e) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            setPreviewUrl('');
            return;
        }
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const uploadImageToCloudinary = async () => {
        if (!imageFile) return null;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);
            setUploadingImage(false);
            return { url: data.url, public_id: data.public_id };
        } catch (err) {
            setUploadingImage(false);
            throw new Error(err.response?.data?.message || 'Image upload failed');
        }
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            if (!imageFile) {
                setError('Please select an image');
                return;
            }

            const imageData = await uploadImageToCloudinary();
            if (!imageData) {
                setError('Image upload failed');
                return;
            }

            const productData = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                images: [imageData],
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.post('http://localhost:5000/api/products', productData, config);
            setSuccess('Product uploaded successfully! Awaiting admin verification.');

            // Reset form
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setCategory(categories[0]);
            setImageFile(null);
            setPreviewUrl('');
        } catch (err) {
            setError(err.message || 'Failed to create product');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage your products and orders</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-4 font-medium transition-colors ${
                                activeTab === 'upload'
                                    ? 'border-b-2 border-purple-600 text-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            📤 Upload Product
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-4 font-medium transition-colors ${
                                activeTab === 'products'
                                    ? 'border-b-2 border-purple-600 text-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            ✅ My Verified Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-4 font-medium transition-colors ${
                                activeTab === 'orders'
                                    ? 'border-b-2 border-purple-600 text-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            📦 My Orders
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'upload' && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold mb-6">Upload New Product</h2>
                        
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}
                        
                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                                <p className="text-green-700">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmitProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity *
                                    </label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Image *
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full"
                                />
                                {previewUrl && (
                                    <div className="mt-4">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="h-48 w-48 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={uploadingImage}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                            >
                                {uploadingImage ? 'Uploading...' : 'Upload Product'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold mb-6">My Verified Products</h2>
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No verified products yet</p>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Upload your first product →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="relative h-48 bg-gray-100">
                                            <img
                                                src={product.images?.[0]?.url || PLACEHOLDER_IMAGE}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                ✓ Verified
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 capitalize mb-2">{product.category}</p>
                                            <p className="text-lg font-bold text-purple-600 mb-2">₹{product.price}</p>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Stock: {product.stock}</span>
                                                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold mb-6">Orders for My Products</h2>
                        
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Order #{order._id.slice(-8)}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                order.isPaid 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.isPaid ? '✓ Paid' : 'Pending'}
                                            </span>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">
                                                <strong>Customer:</strong> {order.customer?.name || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Email:</strong> {order.customer?.email || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                            </p>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-900">Products:</h4>
                                            {order.orderItems.map((item, index) => (
                                                <div key={index} className="border-t pt-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <img
                                                                src={item.image || PLACEHOLDER_IMAGE}
                                                                alt={item.name}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                                <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold text-purple-600">₹{item.price * item.qty}</p>
                                                    </div>
                                                    {/* Display customization if present */}
                                                    {item.customization_details && (
                                                        <div className="mt-3">
                                                            <CustomizationDisplay 
                                                                customizationDetails={item.customization_details}
                                                                customizationCost={item.customization_cost}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboardNew;


