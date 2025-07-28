import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { slugToText, extractIdFromSlug, createBreadcrumb, createSlug } from '../utils/slugUtils';

const BrandProducts = () => {
  const { brandSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProducts();
    fetchBrandInfo();
  }, [brandSlug]);

  useEffect(() => {
    applySorting();
  }, [products, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to extract ID from slug, otherwise use slug as brand name
      const brandId = extractIdFromSlug(brandSlug);
      const brandName = slugToText(brandSlug.replace(`-${brandId}`, ''));
      
      let url = 'http://localhost:3001/api/product';
      if (brandId) {
        url += `?brandId=${brandId}`;
      } else {
        // Try with slug first, then fallback to name
        url += `?brandSlug=${brandSlug}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        // Fallback to brand name if slug doesn't work
        if (!brandId) {
          const fallbackUrl = `http://localhost:3001/api/product?brand=${encodeURIComponent(brandName)}`;
          const fallbackResponse = await fetch(fallbackUrl);
          if (!fallbackResponse.ok) throw new Error('Failed to fetch products');
          const data = await fallbackResponse.json();
          setProducts(Array.isArray(data) ? data : []);
          return;
        }
        throw new Error('Failed to fetch products');
      }
      
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
      const brandId = extractIdFromSlug(brandSlug);
      
      if (brandId) {
        // Try to fetch by ID first
        const response = await fetch(`http://localhost:3001/api/brand/${brandId}`);
        if (response.ok) {
          const data = await response.json();
          setBrand(data);
          return;
        }
      }
      
      // Try to fetch by slug
      const slugResponse = await fetch(`http://localhost:3001/api/brand/slug/${brandSlug}`);
      if (slugResponse.ok) {
        const data = await slugResponse.json();
        setBrand(data);
      } else {
        // Create a mock brand object from slug
        setBrand({
          name: slugToText(brandSlug),
          slug: brandSlug
        });
      }
    } catch (err) {
      console.error('Error fetching brand info:', err);
      setBrand({
        name: slugToText(brandSlug),
        slug: brandSlug
      });
    }
  };

  const applySorting = () => {
    let sorted = [...products];

    switch (sortBy) {
      case 'price_low':
        sorted.sort((a, b) => Number(a.selling_price || 0) - Number(b.selling_price || 0));
        break;
      case 'price_high':
        sorted.sort((a, b) => Number(b.selling_price || 0) - Number(a.selling_price || 0));
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const getDiscount = (product) => {
            const actual = Number(product.actual_price || 0);
            const selling = Number(product.selling_price || 0);
            return actual > selling ? ((actual - selling) / actual) * 100 : 0;
          };
          return getDiscount(b) - getDiscount(a);
        });
        break;
      case 'name':
      default:
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }

    setSortedProducts(sorted);
  };

  const getBrandTitle = () => {
    return brand?.name || slugToText(brandSlug);
  };

  const breadcrumbItems = createBreadcrumb('brand', brandSlug, getBrandTitle());

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading {getBrandTitle()} products...</div>
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
      {brand?.banner_url && (
  <div className="mb-6">
    <img
      src={brand.banner_url}
      alt={`${brand.name} banner`}
      className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-md shadow"
    />
  </div>
)}
      {/* <Breadcrumb items={breadcrumbItems} /> */}
      
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {getBrandTitle()} Products
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
          <div className="text-gray-500 text-lg mb-4">No products found for {getBrandTitle()}</div>
          <p className="text-gray-400 mb-6">
            This brand doesn't have any products available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandProducts;