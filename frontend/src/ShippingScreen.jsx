// frontend/src/ShippingScreen.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ShippingScreen = () => {
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    // Check if all fields are filled
    useEffect(() => {
        if (address.trim() && city.trim() && postalCode.trim() && country.trim()) {
            setShowConfirmation(true);
        } else {
            setShowConfirmation(false);
        }
    }, [address, city, postalCode, country]);

    // Check if user is logged in
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
        }

        // Load saved shipping address if exists
        const savedAddress = JSON.parse(localStorage.getItem('shippingAddress'));
        if (savedAddress) {
            setAddress(savedAddress.address || '');
            setCity(savedAddress.city || '');
            setPostalCode(savedAddress.postalCode || '');
            setCountry(savedAddress.country || '');
        }
    }, [navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        const shippingDetails = { address, city, postalCode, country };
        // Save shipping details temporarily in localStorage
        localStorage.setItem('shippingAddress', JSON.stringify(shippingDetails));
        navigate('/payment'); // Move to the next step
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Shipping Form */}
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Shipping Information</h2>
                    <p className="text-gray-600 mb-8">Please enter your shipping address details</p>

                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Address */}
                        <div className="relative">
                            <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
                                📍 Street Address *
                            </label>
                            <input
                                type="text"
                                id="address"
                                placeholder="Enter your complete street address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="w-full px-6 py-6 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-gray-800 placeholder-gray-400 bg-white hover:border-purple-300 shadow-sm text-base"
                            />
                        </div>

                        {/* City */}
                        <div className="relative">
                            <label htmlFor="city" className="block text-sm font-semibold text-gray-800 mb-2">
                                🏙️ City *
                            </label>
                            <input
                                type="text"
                                id="city"
                                placeholder="Enter your city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="w-full px-6 py-6 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-gray-800 placeholder-gray-400 bg-white hover:border-purple-300 shadow-sm text-base"
                            />
                        </div>

                        {/* Postal Code & Country */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-800 mb-2">
                                    📮 Postal Code *
                                </label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    placeholder="Postal/ZIP code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    required
                                    className="w-full px-6 py-6 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-gray-800 placeholder-gray-400 bg-white hover:border-purple-300 shadow-sm text-base"
                                />
                            </div>

                            <div className="relative">
                                <label htmlFor="country" className="block text-sm font-semibold text-gray-800 mb-2">
                                    🌍 Country *
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    placeholder="Enter your country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                    className="w-full px-6 py-6 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-gray-800 placeholder-gray-400 bg-white hover:border-purple-300 shadow-sm text-base"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mb-8">
                            <button
                                type="button"
                                onClick={() => navigate('/cart')}
                                className="px-6 py-3 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                ← Back to Cart
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Continue to Payment →
                            </button>
                        </div>
                    </form>
                </div>

                {/* Address Confirmation Section */}
                {showConfirmation && (
                    <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-green-200 animate-fadeIn max-w-2xl mx-auto">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    📦 Confirm Your Shipping Address
                                </h3>
                                <div className="bg-white rounded-lg p-5 shadow-md border border-green-100">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <span className="text-gray-500 font-medium min-w-[100px]">Address:</span>
                                            <span className="text-gray-800 font-semibold">{address}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-gray-500 font-medium min-w-[100px]">City:</span>
                                            <span className="text-gray-800 font-semibold">{city}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-gray-500 font-medium min-w-[100px]">Postal Code:</span>
                                            <span className="text-gray-800 font-semibold">{postalCode}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="text-gray-500 font-medium min-w-[100px]">Country:</span>
                                            <span className="text-gray-800 font-semibold">{country}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingScreen;