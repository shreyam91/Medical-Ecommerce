import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast, { Toaster } from "react-hot-toast";


const ProductCard = ({ product }) => {
  const { images, name, actual_price, selling_price } = product;
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fallback image if none provided
  const image =
    Array.isArray(images) && images.length > 0
      ? images[0]
      : 'https://via.placeholder.com/300x200?text=No+Image';

  const actualPriceNum = Number(actual_price ?? 0);
  const sellingPriceNum = Number(selling_price ?? 0);

  const hasDiscount = actualPriceNum > sellingPriceNum;
  const discountPercentage = hasDiscount
    ? Math.round(((actualPriceNum - sellingPriceNum) / actualPriceNum) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    // Add price, image, and actual_price fields for cart compatibility
    addToCart({
      ...product,
      price: sellingPriceNum,
      image: image,
      actual_price: actualPriceNum,
    });
    toast.success("Added to cart!");
  };

  return (
    <>
          <Toaster position="top-right" />
    <Link to={`/product/${product.id}`} className="block">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden max-w-xs w-full sm:w-72 md:w-80 lg:w-96 group transition-transform duration-300 hover:scale-[1.02]">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
            -{discountPercentage}%
          </div>
        )}

        {/* Product Image with lazy-loading and hover zoom */}
        <div className=" flex justify-center items-center h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-auto object-contain transform transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
<h3 className="text-lg font-medium text-gray-800 line-clamp-2">{name}</h3>

          {/* Prices */}
         <div className="mt-2 mb-4 flex flex-col">
      {sellingPriceNum > 0 ? (
        <span className="text-lg font-bold text-gray-900">
          ₹{sellingPriceNum.toFixed(2)}
        </span>
      ) : (
        <span className="text-lg font-bold text-gray-500">N/A</span>
      )}
      {hasDiscount && actualPriceNum > 0 && (
        <span className="text-sm text-gray-400">
          MRP: <span className="line-through">₹{actualPriceNum.toFixed(2)}</span>
        </span>
      )}
    </div>


          {/* Add to Cart Button */}
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded transition duration-200 cursor-pointer"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
    </>
  );
};

export default ProductCard;
