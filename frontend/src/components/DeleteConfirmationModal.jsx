import React, { useState } from 'react';
import axios from 'axios';
import CloudinaryImage from './ui/CloudinaryImage';
import { API_BASE_URL } from '../config/api';

const DeleteConfirmationModal = ({ product, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.delete(`${API_BASE_URL}/api/products/${product._id}`, config);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete product');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 mb-4 rounded-lg overflow-hidden">
                        <CloudinaryImage
                            image={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Delete Product
                    </h3>
                    
                    <p className="text-gray-500 mb-4">
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 disabled:bg-gray-400"
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;