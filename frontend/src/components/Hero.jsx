// frontend/src/components/Hero.jsx - With Product Carousel

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Hero.css';
import { API_BASE_URL } from '../config/api';

const Hero = () => {
    const [productImages, setProductImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRandomProducts = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/products`);
                
                // Ensure data is an array
                if (!Array.isArray(data)) {
                    console.error('Hero: Expected array but got:', typeof data);
                    setProductImages([]);
                    setLoading(false);
                    return;
                }
                
                // Get products with valid images
                const productsWithImages = data.filter(
                    product => product.images && product.images.length > 0 && product.images[0].url
                );

                // Shuffle and get 4 random products
                const shuffled = productsWithImages.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 4);
                
                // Extract image URLs
                const imageUrls = selected.map(product => product.images[0].url);
                setProductImages(imageUrls);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product images:', error);
                // Set empty array if error
                setProductImages([]);
                setLoading(false);
            }
        };

        fetchRandomProducts();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        arrows: true,
    };

    return (
        <div className="relative bg-gradient-to-br from-[#F7F0FF] via-white to-[#FFC7EA] min-h-[70vh] flex items-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20 w-32 h-32 bg-[#B799FF] rounded-full"></div>
                <div className="absolute top-40 right-32 w-24 h-24 bg-[#FFC7EA] rounded-full"></div>
                <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-[#A080E0] rounded-full"></div>
                <div className="absolute bottom-20 right-20 w-28 h-28 bg-[#B799FF] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Hero Title */}
                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Discover Elegant
                        <span className="block text-[#B799FF]">Modest Fashion</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
                        Explore our curated collection of beautiful suits, hijabs, and accessories 
                        that celebrate style, modesty, and elegance. Find your perfect look today.
                    </p>

                    {/* Centered Product Carousel */}
                    <div className="hero-carousel-container relative z-10 mx-auto">
                        {loading ? (
                            <div className="hero-slide flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#B799FF]"></div>
                                    <p className="text-gray-600 font-medium">Loading products...</p>
                                </div>
                            </div>
                        ) : productImages.length > 0 ? (
                            <Slider {...settings}>
                                {productImages.map((image, index) => (
                                    <div key={index} className="hero-slide">
                                        <img 
                                            className="hero-image" 
                                            src={image} 
                                            alt={`Fashion Product ${index + 1}`} 
                                        />
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <div className="hero-slide flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-gray-600 text-lg font-medium">No products available</p>
                                    <p className="text-gray-500 text-sm mt-2">Check back soon for new items!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-[#B799FF] rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-[#B799FF] rounded-full mt-2 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
