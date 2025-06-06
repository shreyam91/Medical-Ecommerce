import { useState, useEffect } from 'react';
import AppRoutes from './route/AppRoutes';
import Footer from './components/Footer';
import GlobalLoader from './components/GlobalLoader';
import './index.css';
import { NavbarMain } from './components/Navbar';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-16 w-16 mb-4 animate-bounce"
        />
        <h1 className="text-2xl font-bold text-blue-600 tracking-wide">
          HerbalMG
        </h1>
      </div>
    );
  }

  return (
    <>
    <NavbarMain/>
      <GlobalLoader />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;
