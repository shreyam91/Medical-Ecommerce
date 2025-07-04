import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import ProductCard from '../components/ProductCard'; // Uncomment and enhance ProductCard as needed

const BrandProducts = () => {
  const { brandId } = useParams();
  const [products, setProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch products for this brand
    fetch(`http://localhost:3001/api/product?brandName=${brandId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // Fetch brand info (optional)
    fetch(`http://localhost:3001/api/brand/${brandId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setBrand(data))
      .catch(() => {});
  }, [brandId]);

  if (loading) return <div className="p-10 text-center">Loading products...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700 text-center">
        Products for {brand ? brand.name : 'Brand'}
      </h1>
      {products.length === 0 ? (
        <div className="text-gray-400 text-center">No products found for this brand.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Replace below with <ProductCard product={product} /> */}
          {products.map((product) => (
            <div key={product.id} className="border rounded p-4 shadow">
              <h2 className="font-semibold">{product.name}</h2>
              {/* Add more product details here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandProducts; 