import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './CloudinaryImage.css';

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/300/f0f0f0?text=No+Image';

const CloudinaryImage = ({ image, alt, className = '' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Get the actual image URL from the image object or string
    const getImageUrl = () => {
        if (!image) return DEFAULT_PLACEHOLDER;
        if (typeof image === 'string') return image;
        return image.url || DEFAULT_PLACEHOLDER;
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={`cloudinary-image-container ${className}`}>
            {isLoading && (
                <div className="image-skeleton">
                    <div className="skeleton-shimmer"></div>
                </div>
            )}
            <motion.img
                src={hasError ? DEFAULT_PLACEHOLDER : getImageUrl()}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="cloudinary-image"
            />
        </div>
    );
};

export default CloudinaryImage;