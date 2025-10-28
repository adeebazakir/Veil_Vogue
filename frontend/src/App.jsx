import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CartScreen from './CartScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import RandomProductsGrid from './components/RandomProductsGrid';
import CategoryPage from './pages/CategoryPage';
import ShippingScreen from './ShippingScreen';
import PaymentScreen from './PaymentScreen';
import PlaceOrderScreen from './PlaceOrderScreen';
import OrderScreen from './OrderScreen';
import SellerProductScreen from './SellerProductScreen';
import SellerDashboardNew from './SellerDashboardNew';
import AdminDashboard from './AdminDashboard';
import ProductDetailScreen from './ProductDetailScreen';
import ProfileScreen from './ProfileScreen';

const HomeScreen = () => (
  <ErrorBoundary>
    <div>
      <Hero />
      <RandomProductsGrid />
    </div>
  </ErrorBoundary>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>
          <Header />
          <main>
            <Routes>
              <Route path="/product/:id" element={<ProductDetailScreen />} />
              
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/cart" element={<CartScreen />} />

              {/* Checkout Routes */} 
              <Route path="/shipping" element={<ShippingScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route path="/order/:id" element={<OrderScreen />} />

              {/* Seller/Admin Dashboards*/}
              <Route path="/seller/products" element={<SellerProductScreen />} />
              <Route path="/seller/dashboard" element={<SellerDashboardNew />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Category Routes */}
              <Route path="/:category" element={<CategoryPage />} />

              <Route path="/" element={<HomeScreen />} exact />
            </Routes>
          </main>
          <Footer />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;