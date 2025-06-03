import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/Home';
import ProductDetailPage from '../pages/ProductDetail';
import CartPage from '../pages/Cart';
import CheckoutPage from '../pages/Checkout';
import OrderSuccessPage from '../pages/OrderSuccess';

import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
// import ForgotPasswordPage from '../pages/ForgotPassword';

import UserProfilePage from '../pages/UserProfile';
import OrderHistoryPage from '../pages/OrderHistory';

// import SearchResultsPage from '../pages/SearchResultsPage';

import PrivateRoute from '../components/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      {/* <Route path="/search" element={<SearchResultsPage />} /> */}

      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />

      {/* Protected Routes (require login) */}
      <Route path="/profile" element={
        <PrivateRoute>
          <UserProfilePage />
        </PrivateRoute>
      } />

      <Route path="/orders" element={
        <PrivateRoute>
          <OrderHistoryPage />
        </PrivateRoute>
      } />

      {/* Redirect unmatched routes to Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
