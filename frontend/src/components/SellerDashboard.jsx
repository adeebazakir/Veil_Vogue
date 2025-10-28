import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductEditModal from './ProductEditModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CloudinaryImage from './ui/CloudinaryImage';
import { API_BASE_URL } from '../config/api';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [focusedProductId, setFocusedProductId] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Keyboard navigation for grid view
    const handleKeyNavigation = useCallback((event, product) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleEdit(product);
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            handleDelete(product);
        }
    }, []);

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'seller') {
            navigate('/login');
            return;
        }
        fetchSellerProducts();
    }, [userInfo, navigate]);

    const fetchSellerProducts = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/products/seller', config);
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch your products. Please try again.');
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
    };

    const handleDelete = (product) => {
        setDeletingProduct(product);
    };

    const handleEditSuccess = () => {
        setEditingProduct(null);
        fetchSellerProducts(); // Refresh the list
    };

    const handleDeleteSuccess = () => {
        setDeletingProduct(null);
        fetchSellerProducts(); // Refresh the list
    };

    const handleAddNew = () => {
        navigate('/seller/upload');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F0FF] flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#B799FF]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F7F0FF] p-8">
                <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F0FF] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Your Products</h1>
                        <p className="text-gray-600 mt-1">Manage your product listings</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* View Toggle */}
                        <div className="bg-white rounded-lg shadow-sm p-1 flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded ${viewMode === 'grid' ? 'bg-[#B799FF] text-white' : 'text-gray-600'}`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded ${viewMode === 'table' ? 'bg-[#B799FF] text-white' : 'text-gray-600'}`}
                            >
                                Table
                            </button>
                        </div>
                        
                        {/* Add New Button */}
                        <button
                            onClick={handleAddNew}
                            className="bg-[#B799FF] text-white px-4 py-2 rounded-lg hover:bg-[#A080E0] transition duration-200 shadow-md flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Products Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                                <div className="relative aspect-square">
                                    <CloudinaryImage
                                        image={product.images?.[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white rounded-lg shadow-md p-1">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                            product.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {product.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-lg font-bold text-[#B799FF]">${product.price}</span>
                                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition duration-200"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Products Table View */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <CloudinaryImage
                                                            image={product.images?.[0]}
                                                            alt={product.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#B799FF]">${product.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                                                    product.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {product.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-[#B799FF] hover:text-[#A080E0] mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modals */}
                {editingProduct && (
                    <ProductEditModal
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onSuccess={handleEditSuccess}
                    />
                )}
                
                {deletingProduct && (
                    <DeleteConfirmationModal
                        product={deletingProduct}
                        onClose={() => setDeletingProduct(null)}
                        onSuccess={handleDeleteSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;