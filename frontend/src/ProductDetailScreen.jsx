// frontend/src/ProductDetailScreen.jsx

import React, { useState, useEffect } from 'react';
import CloudinaryImage from './components/ui/CloudinaryImage';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomizationForm from './components/CustomizationForm';
import './ProductDetailScreen.css';

const ProductDetailScreen = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Customization State
    const [customization, setCustomization] = useState({});

    // Review Form State
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    const fetchProductData = async () => {
        try {
            // Fetch product details
            const productRes = await axios.get(`http://localhost:5000/api/products/${productId}`);
            setProduct(productRes.data);

            // Fetch product reviews
            const reviewsRes = await axios.get(`http://localhost:5000/api/products/${productId}/reviews`);
            setReviews(reviewsRes.data);
            
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Product not found or failed to load data.');
            setLoading(false);
        }
    };

        // Helper function to get main product image
        const getMainImage = () => {
            return product.images && product.images.length > 0 ? product.images[0] : null;
        };
    useEffect(() => {
        fetchProductData();
    }, [productId]);

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        setReviewMessage('');
        setReviewLoading(true);

        if (!userInfo) {
            setReviewMessage('Please log in to submit a review.');
            setReviewLoading(false);
            return;
        }

        try {
            const config = { 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
            };
            
            // POST request to createProductReview controller
            await axios.post(
                `http://localhost:5000/api/products/${productId}/reviews`, 
                { rating, title, comment }, 
                config
            );

            setReviewMessage('Review submitted successfully! Refreshing reviews...');
            setTitle('');
            setComment('');
            setRating(5);
            setReviewLoading(false);
            
            // Re-fetch data to show the new review and updated average rating
            setTimeout(fetchProductData, 1500);

        } catch (err) {
            setReviewMessage(err.response?.data?.message || 'Error submitting review. Check if you have already reviewed this product.');
            setReviewLoading(false);
        }
    };

    // --- RENDER LOGIC ---
    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Product Details...</div>
        </div>
    );
    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
        </div>
    );
    if (!product) return null;

    // Helper function to render star icons
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="text-yellow-500 text-xl">★</span>);
            } else {
                stars.push(<span key={i} className="text-gray-300 text-xl">★</span>);
            }
        }
        return <div className="flex space-x-0.5">{stars}</div>;
    };
    
    // Handle customization changes
    const handleCustomizationChange = (customizationData) => {
        setCustomization(customizationData);
    };

    // Add to cart functionality
    const addToCartHandler = async () => {
        if (!userInfo) {
            alert('Please login to add items to the cart.');
            return;
        }

        // Convert customization object to JSON string (only if measurements were added)
        const customizationDetails = Object.keys(customization).length > 0
            ? JSON.stringify(customization)
            : '';

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.post(
                'http://localhost:5000/api/cart/add', 
                { productId, quantity: 1, customization_details: customizationDetails }, 
                config
            );
            
            const hasCustom = customizationDetails ? ' with your custom measurements' : '';
            alert(`${product.name} added to cart${hasCustom}!`);
            
            // Dispatch custom event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding to cart. Check stock/login.');
        }
    };


    return (
        <div className="product-detail-container">
            {/* Breadcrumb Navigation */}
            <div className="breadcrumb fade-in-up">
                <span className="breadcrumb-item" onClick={() => navigate('/')}>Home</span>
                <span className="breadcrumb-item">/</span>
                <span className="breadcrumb-item" onClick={() => navigate('/products')}>Products</span>
                <span className="breadcrumb-item">/</span>
                <span className="breadcrumb-item active">{product.name}</span>
            </div>

            {/* PRODUCT INFO SECTION */}
            <div className="product-info-card fade-in-up">
                {/* Enhanced Image Gallery */}
                <div className="image-gallery-section">
                    <div className="main-image-container">
                        <div className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                        </div>
                        <CloudinaryImage
                            image={product.images?.[selectedImageIndex || 0]}
                            alt={product.name}
                            className="w-full h-full"
                        />
                    </div>
                    {/* Thumbnail Gallery */}
                    {product.images?.length > 1 && (
                        <div className="thumbnail-gallery">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`thumbnail-button ${selectedImageIndex === index ? 'active' : ''}`}
                                >
                                    <CloudinaryImage
                                        image={img}
                                        alt={`${product.name} - View ${index + 1}`}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Product Details */}
                <div className="product-details-section">
                    <h1 className="product-title">{product.name}</h1>
                    
                    <div className="seller-info">
                        <div className="seller-avatar">
                            {product.seller.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="seller-name">
                            Sold by <span>{product.seller.name}</span>
                        </p>
                    </div>
                    
                    {/* Rating and Reviews Count */}
                    <div className="rating-section">
                        {renderStars(product.rating)}
                        <span className="review-count">{product.numReviews} Reviews</span>
                    </div>

                    <div className="price-section">
                        <div className="price-label">Price</div>
                        <div className="price-amount">₹{product.price.toFixed(2)}</div>
                    </div>
                    
                    <div className="product-description">
                        {product.description}
                    </div>
                    
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-label">Category</div>
                            <div className="info-value">{product.category}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Availability</div>
                            <div className="info-value" style={{ color: product.stock > 0 ? '#10b981' : '#ef4444' }}>
                                {product.stock > 0 ? `${product.stock} Units` : 'Out of Stock'}
                            </div>
                        </div>
                    </div>

                    {/* Customization Form - Only for Suits and Abayas */}
                    <CustomizationForm
                        category={product.category}
                        onCustomizationChange={handleCustomizationChange}
                    />

                    {/* Price Summary with Customization */}
                    {Object.keys(customization).length > 0 && Object.values(customization).some(val => val && val.trim() !== '') && (
                        <div style={{
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                            borderRadius: '12px',
                            border: '2px solid #10b981',
                            marginTop: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600', color: '#065f46' }}>Product Price:</span>
                                <span style={{ fontWeight: '700', color: '#065f46' }}>₹{product.price.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600', color: '#065f46' }}>Customization Charge:</span>
                                <span style={{ fontWeight: '700', color: '#065f46' }}>₹150.00</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '2px solid #10b981', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', color: '#047857', fontSize: '1.125rem' }}>Total per Item:</span>
                                <span style={{ fontWeight: '900', color: '#047857', fontSize: '1.25rem' }}>₹{(product.price + 150).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={addToCartHandler} 
                        className="add-to-cart-button primary"
                        disabled={product.stock === 0 || !userInfo}
                    >
                        {product.stock === 0 ? 'Out of Stock' : !userInfo ? 'Login to Add to Cart' : '🛒 Add to Cart'}
                    </button>
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="reviews-container">
                {/* Existing Reviews List */}
                <div className="reviews-list-section fade-in-up">
                    <h2 className="section-title">
                        Customer Reviews ({reviews.length})
                    </h2>
                    {reviews.length === 0 ? (
                        <p className="no-reviews">Be the first to review this product! 📝</p>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review) => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <h4 className="review-title-text">{review.title}</h4>
                                        <div className="review-author">
                                            <div className="author-avatar">
                                                {review.customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{review.customer.name}</span>
                                        </div>
                                    </div>
                                    <div className="review-rating">
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                    <p className="review-date">
                                        Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Review Form */}
                <div className="review-form-section fade-in-up">
                    <h3 className="form-title">Write a Review</h3>
                    
                    {userInfo ? (
                        <form onSubmit={submitReviewHandler} className="review-form">
                            {/* Rating Dropdown */}
                            <div className="form-group">
                                <label className="form-label">Rating</label>
                                <select 
                                    value={rating} 
                                    onChange={(e) => setRating(e.target.value)}
                                    className="form-select"
                                >
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <option key={r} value={r}>{'⭐'.repeat(r)} {r} Stars</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title Input */}
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Amazing product!"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="form-input"
                                />
                            </div>

                            {/* Comment Textarea */}
                            <div className="form-group">
                                <label className="form-label">Your Review</label>
                                <textarea
                                    rows="4"
                                    placeholder="Share your experience with this product..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    className="form-textarea"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={reviewLoading}
                            >
                                {reviewLoading ? '⏳ Submitting...' : '✉️ Submit Review'}
                            </button>
                            
                            {reviewMessage && (
                                <div className={`form-message ${reviewMessage.toLowerCase().includes('error') || reviewMessage.toLowerCase().includes('check') ? 'error' : 'success'}`}>
                                    {reviewMessage}
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="login-prompt">
                            Please <Link to="/login" className="login-link">log in</Link> to write a review.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailScreen;