import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import AppRoutes from "./route/AppRoutes";
import Footer from './components/Footer'

function App() {
  return (
    <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <AppRoutes/>
          </main>
          <Footer />
        </div>
    </CartProvider>
  );
}

export default App;
