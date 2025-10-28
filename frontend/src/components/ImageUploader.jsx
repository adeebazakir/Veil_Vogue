import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ImageUploader = ({ onUploadSuccess, onUploadError }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const validateFile = (file) => {
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error('File size exceeds 5MB limit');
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Please upload a JPEG, PNG, or WebP image');
        }

        return true;
    };

    const handleUpload = async (event) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            // Validate file before uploading
            validateFile(file);

            setUploading(true);
            setError(null);
            setProgress(0);

            const formData = new FormData();
            formData.append('image', file);

            // Get user token from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo?.token) {
                throw new Error('Please login to upload images');
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                },
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/upload`,
                formData,
                config
            );

            setUploading(false);
            setProgress(100);
            
            if (onUploadSuccess) {
                onUploadSuccess(data);
            }

        } catch (err) {
            setUploading(false);
            const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
            setError(errorMsg);
            
            if (onUploadError) {
                onUploadError(errorMsg);
            }
            
            // Reset file input
            event.target.value = '';
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-center w-full">
                <label
                    className={`flex flex-col items-center justify-center w-full h-64 
                    border-2 border-dashed rounded-lg cursor-pointer 
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'}
                    hover:bg-gray-100`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <div className="w-full px-4">
                                <div className="relative pt-1">
                                    <div className="text-center mb-2">
                                        Uploading... {progress}%
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                        <div
                                            style={{ width: `${progress}%` }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#B799FF]"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <svg
                                    className={`w-8 h-8 mb-4 ${error ? 'text-red-500' : 'text-gray-500'}`}
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 16"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                    />
                                </svg>
                                <p className={`mb-2 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                                    {error || 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    JPEG, PNG or WebP (MAX. 5MB)
                                </p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    );
};

export default ImageUploader;