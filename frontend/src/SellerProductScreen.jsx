import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, IMAGE_CONFIG, PLACEHOLDER_IMAGE } from './config/api';

const categories = ['Suits', 'Hijabs', 'Accessories', 'Abayas'];

const SellerProductScreen = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState(categories[0]);
    // imageFile is the File selected; previewUrl is local preview
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [loading, setLoading] = useState(false); // product submit loading
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'seller') {
            navigate('/login');
        }
        // cleanup preview URL when unmounting or when imageFile changes
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, []); // run once

    // When a file is selected, set preview and keep the file
    const handleFileChange = (e) => {
        setError(null);
        const file = e.target.files?.[0];
        if (!file) {
            setImageFile(null);
            setPreviewUrl('');
            return;
        }
        // simple mime-type check (images only)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!file.type.startsWith('image/') || !allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (jpg, png, webp, gif).');
            setImageFile(null);
            setPreviewUrl('');
            return;
        }
        // limit file size (optional) - keep consistent with backend limit (example 5MB)
        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Image is too large. Maximum ${maxSizeMB} MB allowed.`);
            setImageFile(null);
            setPreviewUrl('');
            return;
        }

        // create local preview URL
        const url = URL.createObjectURL(file);
        setImageFile(file);
        setPreviewUrl(url);
    };

    // Upload image file to backend endpoint, return uploaded URL on success
    const uploadImageToServer = async () => {
        if (!imageFile) {
            // Return a default response with placeholder image if no file is selected
            return {
                url: IMAGE_CONFIG.PLACEHOLDERS.PRIMARY,
                public_id: null
            };
        }

        setUploadingImage(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Client-side validation
            if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(imageFile.type)) {
                throw new Error(`Please select a valid image file (${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')})`);
            }

            if (imageFile.size > IMAGE_CONFIG.MAX_SIZE) {
                throw new Error(`File size must be less than ${IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`);
            }

            if (!userInfo?.token) {
                throw new Error('Please login to upload images');
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('image', imageFile);

            const config = {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total || progressEvent.target?.getResponseHeader('content-length') || 0;
                    if (total > 0) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                        setUploadProgress(percentCompleted);
                    }
                },
            };

            console.log('Starting image upload:', {
                filename: imageFile.name,
                type: imageFile.type,
                size: imageFile.size,
                endpoint: IMAGE_CONFIG.UPLOAD_ENDPOINT
            });

            const res = await axios.post(IMAGE_CONFIG.UPLOAD_ENDPOINT, formData, config);

            if (!res.data?.success) {
                throw new Error(res.data?.message || 'Upload failed');
            }

            console.log('Upload successful:', res.data);

            return {
                url: res.data.url,
                public_id: res.data.public_id
            };
        } catch (err) {
            console.error('Image upload failed:', err);
            
            // Detailed error logging
            if (err.response) {
                console.log('Response data:', err.response.data);
                console.log('Response status:', err.response.status);
                console.log('Response headers:', err.response.headers);
            }

            const errorMessage = err.response?.data?.message || err.message || 'Image upload failed';
            setError(errorMessage);

            // Return fallback image URL on error
            return {
                url: IMAGE_CONFIG.PLACEHOLDERS.ERROR,
                public_id: null,
                error: errorMessage
            };
        } finally {
            setUploadingImage(false);
            setUploadProgress(0);
        }
    };

    // Submit handler: upload image first (if any), then create product with returned image url
    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // basic validation
        if (!name || !price || !category) {
            setError('Please fill in required fields: name, price and category.');
            return;
        }

        setLoading(true);

        try {
            // 1) upload image first if a file was provided
            let imageResult = null;
            if (imageFile) {
                imageResult = await uploadImageToServer();
                if (!imageResult) {
                    // upload failed; stop submission
                    setLoading(false);
                    return;
                }
            }

            // 2) prepare product payload
            // Use "images" array for schema compatibility; fallback to placeholder if no imageUrl
            const payload = {
                name,
                description,
                price: Number(price),
                stock: Number(stock || 0),
                category,
                images: [{ 
                    url: imageResult?.url || IMAGE_CONFIG.PLACEHOLDERS.PRIMARY,
                    public_id: imageResult?.public_id || 'placeholder'
                }],
            };

            // 3) create product
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
                },
            };

            const res = await axios.post(API_ENDPOINTS.CREATE_PRODUCT, payload, config);

            setSuccess(res.data?.message || 'Product created successfully and is awaiting admin approval.');
            // reset fields
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setCategory(categories[0]);
            setImageFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl('');
            }

            // Optionally navigate to seller product list or dashboard
            setTimeout(() => {
                try {
                    navigate('/seller/products'); // adjust route to your seller products page
                } catch (err) {
                    // ignore navigation errors
                }
            }, 800);
        } catch (err) {
            console.error('Create product failed', err);
            setError(err.response?.data?.message || err.message || 'Failed to create product.');
        } finally {
            setLoading(false);
            setUploadingImage(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F0FF] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Seller Panel</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 border-b pb-3">Add New Product</h2>

                <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-[#FFC7EA]">
                    {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
                    {success && <p className="text-green-600 bg-green-100 p-3 rounded-lg mb-4">{success}</p>}

                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-[#B799FF] focus:border-[#B799FF]"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-[#B799FF] focus:border-[#B799FF]"
                            ></textarea>
                        </div>

                        {/* Price & Stock - Responsive Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    required
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-[#B799FF] focus:border-[#B799FF]"
                                />
                            </div>
                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Count</label>
                                <input
                                    type="number"
                                    id="stock"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    min="0"
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-[#B799FF] focus:border-[#B799FF]"
                                />
                            </div>
                        </div>

                        {/* Category & Image Upload - Responsive Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-[#B799FF] focus:border-[#B799FF]"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>

                                {/* File Input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="mt-1 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                                    file:rounded-full file:border-0 file:text-sm file:font-semibold
                                    file:bg-[#F7F0FF] file:text-[#B799FF] hover:file:bg-[#E5D5FF]"
                                />

                                {/* Preview */}
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={previewUrl || IMAGE_CONFIG.PLACEHOLDERS.PRIMARY}
                                            alt="Product preview"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMAGE_CONFIG.PLACEHOLDERS.PRIMARY; }}
                                        />
                                    </div>
                                </div>

                                {/* Upload progress indicator (visible while uploading image) */}
                                {uploadingImage && (
                                    <div className="mt-3">
                                        <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
                                            <div
                                                style={{ width: `${uploadProgress}%` }}
                                                className="h-3 bg-indigo-600 transition-all"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || uploadingImage}
                            className="w-full py-3 mt-4 bg-[#B799FF] text-white font-semibold rounded-lg hover:bg-[#A080E0] transition duration-200 shadow-md disabled:opacity-60"
                        >
                            {loading ? 'Adding Product...' : 'Add Product Listing'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerProductScreen;