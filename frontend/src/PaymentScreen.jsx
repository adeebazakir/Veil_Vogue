import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentScreen = () => {
    const [paymentMethod, setPaymentMethod] = useState('PayPal');
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            alert('Please login to proceed with payment');
            navigate('/login');
        }
    }, [navigate]);

    const submitHandler = (e) => {
        e.preventDefault();
        
        // Double check authentication before proceeding
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            alert('Please login to proceed with payment');
            navigate('/login');
            return;
        }
        
        localStorage.setItem('paymentMethod', paymentMethod);
        navigate('/placeorder');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Payment Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Method</h2>
                        <p className="text-gray-600">Choose your preferred payment method</p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        {/* Payment Options */}
                        <div className="space-y-4">
                            {/* PayPal */}
                            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                paymentMethod === 'PayPal' 
                                    ? 'border-purple-600 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                            }`}>
                                <input
                                    type="radio"
                                    value="PayPal"
                                    checked={paymentMethod === 'PayPal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="ml-4">
                                    <p className="font-semibold text-gray-900">PayPal</p>
                                    <p className="text-sm text-gray-500">Fast and secure payment</p>
                                </div>
                            </label>

                            {/* Stripe */}
                            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                paymentMethod === 'Stripe' 
                                    ? 'border-purple-600 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                            }`}>
                                <input
                                    type="radio"
                                    value="Stripe"
                                    checked={paymentMethod === 'Stripe'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="ml-4">
                                    <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                                    <p className="text-sm text-gray-500">Powered by Stripe</p>
                                </div>
                            </label>

                            {/* COD */}
                            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                paymentMethod === 'COD' 
                                    ? 'border-purple-600 bg-purple-50' 
                                    : 'border-gray-200 hover:border-purple-300'
                            }`}>
                                <input
                                    type="radio"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="ml-4">
                                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                                    <p className="text-sm text-gray-500">Pay when you receive</p>
                                </div>
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/shipping')}
                                className="px-6 py-3 text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Continue to Review →
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentScreen;

