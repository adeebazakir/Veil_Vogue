// frontend/src/components/SearchBar.jsx - Enhanced Search Component

import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Search for products..." }) => {
    return (
        <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg 
                        className="h-5 w-5 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B799FF] focus:border-[#B799FF] transition-colors duration-200 text-lg placeholder-gray-400 shadow-sm"
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                        <svg 
                            className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M6 18L18 6M6 6l12 12" 
                            />
                        </svg>
                    </button>
                )}
            </div>
            
            {/* Search Suggestions */}
            {searchTerm && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-2 z-10 max-h-60 overflow-y-auto">
                    <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">Popular searches:</p>
                        <div className="flex flex-wrap gap-2">
                            {['Elegant Suits', 'Silk Hijabs', 'Modest Dresses', 'Fashion Accessories'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => onSearchChange(suggestion)}
                                    className="px-3 py-1 bg-[#F7F0FF] text-[#B799FF] rounded-full text-sm hover:bg-[#B799FF] hover:text-white transition-colors duration-200"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
