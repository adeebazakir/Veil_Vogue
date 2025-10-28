import React, { useState, useEffect } from 'react';

const DEFAULT_LOCAL_IMAGE = '/images/product-placeholder.png';
const FALLBACK_REMOTE_IMAGE = 'https://placehold.co/300x300?text=Product';

/**
 * ProductImage component with multiple fallback mechanisms
 * @param {Object} props
 * @param {string} props.src - Primary image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {Object} props.className - CSS classes to apply
 * @param {Function} props.onLoad - Optional callback when image loads successfully
 * @param {Function} props.onError - Optional callback when image fails to load
 */
const ProductImage = ({ 
    src, 
    alt = 'Product image', 
    className = '', 
    onLoad, 
    onError,
    ...props 
}) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [error, setError] = useState(false);

    useEffect(() => {
        setCurrentSrc(src);
        setError(false);
    }, [src]);

    const handleError = () => {
        if (!error) {
            // If we haven't tried the fallback yet
            setError(true);
            
            // Try local fallback first
            const img = new Image();
            img.onerror = () => {
                // If local fallback fails, use remote fallback
                setCurrentSrc(FALLBACK_REMOTE_IMAGE);
                onError?.('Failed to load both primary and local fallback images');
            };
            img.src = DEFAULT_LOCAL_IMAGE;
            
            setCurrentSrc(DEFAULT_LOCAL_IMAGE);
        }
    };

    const handleLoad = (e) => {
        onLoad?.(e);
    };

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={`${className} ${error ? 'opacity-90' : ''}`}
            onError={handleError}
            onLoad={handleLoad}
            {...props}
        />
    );
};

export default ProductImage;