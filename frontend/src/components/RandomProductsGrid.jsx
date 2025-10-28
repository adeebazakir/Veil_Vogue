import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ui/ProductCard';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import './RandomProductsGrid.css';

const RandomProductsGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleAddToCart = async (productId, productName, quantity) => {
        // Check if user is logged in
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!userInfo) {
            alert('⚠️ Please login to add items to cart');
            window.location.href = '/login';
            return;
        }

        try {
            console.log(`🛒 Adding to cart: ${quantity}x ${productName} (ID: ${productId})`);
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                }
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/cart/add`,
                { productId, quantity },
                config
            );

            console.log('✅ Cart updated:', data);
            alert(`✓ Added ${quantity}x ${productName} to cart!`);
            
            // Dispatch custom event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
            
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
            alert(`❌ ${errorMessage}`);
        }
    };

    useEffect(() => {
        fetchRandomProducts();
    }, []);

    const fetchRandomProducts = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching products from:', `${API_ENDPOINTS.GET_PRODUCTS}?isVerified=true`);
            
            // Fetch all verified products
            const response = await axios.get(`${API_ENDPOINTS.GET_PRODUCTS}?isVerified=true`);
            console.log('📡 Full response:', response);
            console.log('📦 Response data:', response.data);
            console.log('📊 Data type:', typeof response.data);
            console.log('📋 Is array?', Array.isArray(response.data));
            
            // Handle response data - ensure it's an array
            let productsData = response.data;
            
            // If response is wrapped in an object (e.g., {products: [...]})
            if (!Array.isArray(productsData)) {
                if (productsData && productsData.products && Array.isArray(productsData.products)) {
                    productsData = productsData.products;
                } else {
                    console.error('❌ Unexpected response format:', productsData);
                    setError('No products available');
                    setLoading(false);
                    return;
                }
            }
            
            console.log('✅ Products fetched:', productsData.length, 'products');
            
            // Shuffle products randomly and take first 16
            const shuffled = [...productsData].sort(() => Math.random() - 0.5);
            const randomProducts = shuffled.slice(0, 16);
            
            console.log('🎲 Random selection:', randomProducts.length, 'products for display');
            if (randomProducts.length > 0) {
                console.log('📦 First product structure:', randomProducts[0]);
            }
            setProducts(randomProducts);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            console.error('❌ Error response:', err.response);
            setError('Failed to load products');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="random-products-section">
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: '#6b7280' }}>Loading products...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="random-products-section">
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '1rem', borderRadius: '0.5rem' }}>
                    <p style={{ color: '#b91c1c' }}>{error}</p>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="random-products-section">
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                        <svg style={{ width: '4rem', height: '4rem', margin: '0 auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>No products available</h3>
                    <p style={{ color: '#6b7280' }}>Check back soon for new products!</p>
                </div>
            </section>
        );
    }

    console.log('🎨 Rendering RandomProductsGrid with', products.length, 'products');

    return (
        <section className="random-products-section">
            {/* Section Header */}
            <div className="random-products-header">
                <h2>Featured Products</h2>
                <p>Discover our handpicked collection of elegant modest fashion</p>
            </div>

            {/* Grid - Using ProductCard component for consistency */}
            <div className="random-products-grid">
                {products.map((product, index) => {
                    console.log(`🎴 Rendering card ${index + 1}:`, product.name);
                    return (
                        <ProductCard 
                            key={product._id}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    );
                })}
            </div>

            {/* Refresh Button */}
            <div className="refresh-button-container">
                <button onClick={fetchRandomProducts} className="refresh-button">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Show More Products
                </button>
            </div>
        </section>
    );
};

export default RandomProductsGrid;

