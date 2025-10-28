import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { API_ENDPOINTS } from '../config/api';

const FeaturedProducts = ({ limit = 6 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_ENDPOINTS.GET_PRODUCTS}?isVerified=true&limit=${limit}`);
        if (!mounted) return;
        setProducts(data.slice ? data.slice(0, limit) : data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false };
  }, [limit]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center text-sm text-gray-600">Loading featured products...</div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center text-sm text-red-600">{error}</div>
    </div>
  );

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">Featured Products</h3>
        <a href="/" className="text-sm text-[#B799FF]">See all</a>
      </div>

      <div className="-mx-4 px-4 overflow-x-auto">
        <div className="flex gap-6" style={{ minWidth: 600 }}>
          {products.map(p => (
            <div key={p._id || p.id} style={{ minWidth: 260, flex: '0 0 260px' }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
