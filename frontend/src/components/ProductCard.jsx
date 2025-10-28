// frontend/src/components/ProductCard.jsx - Enhanced Product Display

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import ProductImage from './ProductImage';

const ProductCardInner = ({
    product = {},
    onAddToCart = () => {},
    customizationInput = {},
    onCustomizationChange = () => {},
    userInfo = null,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Product Image */}
            <div className="relative h-64 overflow-hidden">
                <Link to={`/product/${product._id ?? ''}`} className="block">
                    <ProductImage 
                        src={product?.image?.[0]}
                        alt={product?.name || 'product'} 
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                            isHovered ? 'scale-110' : 'scale-100'
                        }`}
                    />
                </Link>
                
                {/* Stock Badge */}
                {product?.stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                    </div>
                )}
                
                {/* Quick View Overlay */}
                <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                    <Link 
                        to={`/product/${product._id ?? ''}`}
                        className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-[#B799FF] hover:text-white transition-colors duration-200"
                    >
                        Quick View
                    </Link>
                </div>
            </div>
            
            {/* Product Info */}
            <div className="p-6">
                <Link to={`/product/${product._id ?? ''}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-[#B799FF] transition-colors duration-200 line-clamp-2">
                        {product?.name || 'Untitled'}
                    </h3>
                </Link>
                
                {/* Price */}
                <div className="mb-4">
                    <span className="text-2xl font-bold text-[#B799FF]">
                        ${product?.price != null ? Number(product.price).toFixed(2) : '0.00'}
                    </span>
                    {product.oldPrice && (
                        <span className="text-lg text-gray-500 line-through ml-2">
                            ${Number(product.oldPrice).toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                    <span className="inline-block bg-[#F7F0FF] text-[#B799FF] px-3 py-1 rounded-full text-sm font-medium">
                        {product?.category || '—'}
                    </span>
                </div>

                {/* Customization Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customization (Optional):
                    </label>
                    <input 
                        type="text"
                        placeholder="e.g., Size L, Color Navy"
                        value={customizationInput?.[product._id] || ''}
                        onChange={(e) => onCustomizationChange?.(product._id, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B799FF] focus:border-[#B799FF] transition-colors duration-200"
                    />
                </div>

                {/* Add to Cart Button */}
                <button 
                    onClick={() => onAddToCart?.(product._id, product.name)}
                    disabled={!userInfo || product?.stock === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                        !userInfo || product?.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#B799FF] text-white hover:bg-[#A080E0] hover:shadow-lg transform hover:scale-105'
                    }`}
                >
                    {!userInfo 
                        ? 'Login to Add to Cart' 
                        : product?.stock === 0 
                            ? 'Out of Stock' 
                            : 'Add to Cart'
                    }
                </button>

                {/* Stock Info */}
                {product?.stock > 0 && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        {product.stock} in stock
                    </p>
                )}
            </div>
        </div>
    );
};

const ProductCard = (props) => (
    <ErrorBoundary>
        <ProductCardInner {...props} />
    </ErrorBoundary>
);

export default ProductCard;
