import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';

const BrandProducts = () => {
  const { brandId } = useParams();
  const [products, setProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProducts();
    fetchBrandInfo();
  }, [brandId]);

  useEffect(() => {
    applySorting();
  }, [products, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/product?brandId=${brandId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandInfo = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/brand/${brandId}`);
      if (response.ok) {
        const data = await response.json();
        setBrand(data);
      }
    } catch (err) {
      console.error('Error fetching brand info:', err);
    }
  };

  const applySorting = () => {
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return Number(a.selling_price || 0) - Number(b.selling_price || 0);
        case 'price_high':
          return Number(b.selling_price || 0) - Number(a.selling_price || 0);
        case 'discount':
          const getDiscount = (product) => {
            const actual = Number(product.actual_price || 0);
            const selling = Number(product.selling_price || 0);
            return actual > selling ? ((actual - selling) / actual) * 100 : 0;
          };
          return getDiscount(b) - getDiscount(a);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setSortedProducts(sorted);
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Brands', path: '/brands' },
    { label: brand?.name || 'Brand', path: `/brand/${brandId}` }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading brand products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* <Breadcrumb items={breadcrumbItems} /> */}
      
      {/* Brand Banner */}
      {brand && brand.banner_url && (
        <div className="w-full mb-6">
          <img
            src={brand.banner_url}
            alt={brand.name + ' banner'}
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {brand ? brand.name : 'Brand'} Products
        </h1>
        <p className="text-gray-600">
          {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price_low">Price (Low to High)</option>
            <option value="price_high">Price (High to Low)</option>
            <option value="discount">Highest Discount</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">No products found for this brand</div>
          <p className="text-gray-400">
            This brand doesn't have any products available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandProducts;