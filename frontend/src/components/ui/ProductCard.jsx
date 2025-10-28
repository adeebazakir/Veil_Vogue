import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CloudinaryImage from './CloudinaryImage';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const handleAddToCart = () => {
        onAddToCart(product._id, product.name, 1); // Always add 1 quantity
    };

    return (
        <motion.div
            className="product-card"
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {product.oldPrice && (
                <div className="discount-badge">
                    {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </div>
            )}

            <Link to={`/product/${product._id}`} className="image-container">
                    <CloudinaryImage
                        image={product.images?.[0]}
                        alt={product.name}
                        className="product-image"
                    />
                {isHovered && (
                    <div className="hover-overlay">
                        <span>View Details</span>
                    </div>
                )}
            </Link>

            <div className="product-details">
                <Link to={`/product/${product._id}`}>
                    <h3 className="product-name">{product.name}</h3>
                </Link>

                <div className="price-container">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                        <span className="original-price">{formatPrice(product.oldPrice)}</span>
                    )}
                </div>

                <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </div>

                <button
                    className="add-to-cart-button"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;