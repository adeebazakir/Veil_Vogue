import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

const SellerProductUpload = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState('0');
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || null;

    const validate = () => {
        if (!name || !price || !category) {
            setError('Please fill in required fields: name, price and category.');
            return false;
        }
        if (!imageFile) {
            setError('Please select an image to upload.');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!userInfo) {
            setError('You must be logged in as a seller to upload products.');
            return;
        }

        if (!validate()) return;

        setUploading(true);
        setProgress(0);

        try {
            const payload = {
                name,
                description,
                price,
                category,
                stock,
                imageFile,
            };

            const data = await productService.uploadProduct(payload, userInfo.token, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            });

            setMessage(data.message || 'Product uploaded successfully');
            setUploading(false);

            // Clear form
            setName('');
            setDescription('');
            setPrice('');
            setCategory('');
            setStock('0');
            setImageFile(null);

            // Navigate to seller dashboard or refresh seller product list
            // If you have a seller products page, redirect there. Otherwise stay and show message.
            setTimeout(() => {
                try {
                    navigate('/seller/products');
                } catch (err) {
                    // ignore navigation errors
                }
            }, 800);

        } catch (err) {
            setUploading(false);
            setError(err.message || JSON.stringify(err));
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Upload New Product</h2>

            {message && <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded mb-4">{message}</div>}
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        placeholder="Product name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="p-3 border rounded"
                    />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="p-3 border rounded h-24"
                    />

                    <input
                        type="number"
                        step="0.01"
                        placeholder="Price *"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="p-3 border rounded"
                    />

                    <input
                        type="text"
                        placeholder="Category *"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="p-3 border rounded"
                    />

                    <input
                        type="number"
                        placeholder="Stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="p-3 border rounded"
                    />

                    <label className="block">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="p-2"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {uploading ? `Uploading... (${progress}%)` : 'Upload Product'}
                    </button>

                    {uploading && (
                        <div className="w-full bg-gray-100 rounded mt-2 h-3 overflow-hidden">
                            <div style={{ width: `${progress}%` }} className="h-3 bg-indigo-600 transition-all"></div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SellerProductUpload;
