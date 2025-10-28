import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const TestAPIPage = () => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const testAPI = async () => {
            try {
                console.log('🧪 Testing API...');
                console.log('📍 API_BASE_URL:', API_BASE_URL);
                console.log('🔗 Full URL:', `${API_BASE_URL}/api/products?isVerified=true`);
                
                const response = await axios.get(`${API_BASE_URL}/api/products?isVerified=true`);
                
                console.log('✅ Response received:', response);
                console.log('📦 Response data:', response.data);
                console.log('📊 Data type:', typeof response.data);
                console.log('📋 Is array?', Array.isArray(response.data));
                console.log('🔢 Length:', response.data?.length);
                
                setResult({
                    apiBaseUrl: API_BASE_URL,
                    fullUrl: `${API_BASE_URL}/api/products?isVerified=true`,
                    status: response.status,
                    dataType: typeof response.data,
                    isArray: Array.isArray(response.data),
                    length: response.data?.length || 0,
                    firstProduct: response.data?.[0] || null,
                    rawData: JSON.stringify(response.data).substring(0, 500) + '...'
                });
                
                setLoading(false);
            } catch (err) {
                console.error('❌ Error:', err);
                setError({
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setLoading(false);
            }
        };

        testAPI();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '40px', fontFamily: 'monospace' }}>
                <h1>🧪 API Diagnostic Test</h1>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#fee', color: '#c00' }}>
                <h1>❌ API Test Failed</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#f0f0f0' }}>
            <h1>✅ API Diagnostic Test Results</h1>
            
            <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h2>🔧 Configuration</h2>
                <p><strong>API_BASE_URL:</strong> {result.apiBaseUrl}</p>
                <p><strong>Full URL:</strong> {result.fullUrl}</p>
                <p><strong>Status:</strong> {result.status}</p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h2>📊 Response Data</h2>
                <p><strong>Data Type:</strong> {result.dataType}</p>
                <p><strong>Is Array:</strong> {result.isArray ? '✅ YES' : '❌ NO'}</p>
                <p><strong>Products Count:</strong> {result.length}</p>
            </div>

            {result.firstProduct && (
                <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                    <h2>📦 First Product</h2>
                    <pre style={{ overflow: 'auto', backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '4px' }}>
                        {JSON.stringify(result.firstProduct, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                <h2>📄 Raw Data (first 500 chars)</h2>
                <pre style={{ overflow: 'auto', backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '4px' }}>
                    {result.rawData}
                </pre>
            </div>

            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                <h3>💡 What This Means</h3>
                {result.isArray && result.length > 0 ? (
                    <p style={{ color: '#0a7d0a' }}>
                        ✅ <strong>API is working correctly!</strong> Your backend is returning {result.length} products in the correct format.
                        If the home page is still not working, the issue is likely a caching problem. Try clearing your browser cache or using incognito mode.
                    </p>
                ) : result.isArray && result.length === 0 ? (
                    <p style={{ color: '#c96500' }}>
                        ⚠️ <strong>API works but no products found.</strong> Make sure you have products marked as "isVerified: true" in your database.
                    </p>
                ) : (
                    <p style={{ color: '#c00' }}>
                        ❌ <strong>Wrong data format!</strong> The backend should return an array but it's returning a {result.dataType}.
                    </p>
                )}
            </div>
        </div>
    );
};

export default TestAPIPage;

