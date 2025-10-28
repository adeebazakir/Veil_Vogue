import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ui/ProductCard';
import './CategoryPage.css';
import { API_BASE_URL } from '../config/api';

const CategoryPage = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [sortBy, setSortBy] = useState('newest');

    const formatTitle = (cat) => {
        return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
    };

    const getCategoryMapping = (cat) => {
        // Map URL category to database category (capitalize first letter)
        const mappings = {
            'suits': 'Suits',
            'abayas': 'Abayas',
            'hijabs': 'Hijabs',
            'accessories': 'Accessories'
        };
        return mappings[cat.toLowerCase()] || cat;
    };

    const getCategoryDescription = (cat) => {
        const descriptions = {
            suits: 'Elegant and modest suits for every occasion',
            hijabs: 'Beautiful hijabs in various styles and fabrics',
            abayas: 'Stylish abayas for your everyday modest fashion',
            accessories: 'Complete your look with our curated accessories'
        };
        return descriptions[cat.toLowerCase()] || 'Discover our curated collection';
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const categoryParam = category ? `category=${getCategoryMapping(category)}` : '';
                const { data } = await axios.get(`${API_BASE_URL}/api/products?${categoryParam}${categoryParam ? '&' : ''}isVerified=true`);
                setProducts(data);
                
                // Update price range based on actual product prices
                if (data.length > 0) {
                    const prices = data.map(p => p.price);
                    setPriceRange({
                        min: Math.min(...prices),
                        max: Math.max(...prices)
                    });
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.response?.data?.message || 'Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    const handleAddToCart = async (productId, productName, quantity) => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!userInfo) {
            alert('Please login to add items to the cart');
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/api/cart/add`,
                { productId, quantity },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );
            alert(`${productName} added to cart!`);
            
            // Dispatch custom event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding to cart');
        }
    };

    // Filter and sort products based on price range
    const filteredProducts = products.filter(product => {
        const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
        return matchesPrice;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Category Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {category ? formatTitle(category) : 'All Products'}
                </h1>
                <p className="text-gray-600">{getCategoryDescription(category)}</p>
            </div>


            {/* Loading, Error, and Products Display */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B799FF] mx-auto"></div>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
            ) : sortedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                    No products found in this category.
                </div>
            ) : (
                <div className="products-grid">
                    {sortedProducts.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;