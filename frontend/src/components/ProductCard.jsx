import React from 'react';

const ProductCard = ({ product }) => {
  const { images, name, actual_price, selling_price } = product;

  // Fallback image if none provided
  const image =
    Array.isArray(images) && images.length > 0
      ? images[0]
      : 'https://via.placeholder.com/300x200?text=No+Image';

  const actualPriceNum = Number(actual_price);
  const sellingPriceNum = Number(selling_price);

  const hasDiscount = actualPriceNum > sellingPriceNum;
  const discountPercentage = hasDiscount
    ? Math.round(((actualPriceNum - sellingPriceNum) / actualPriceNum) * 100)
    : 0;

  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden max-w-xs w-full sm:w-72 md:w-80 lg:w-96 group transition-transform duration-300 hover:scale-[1.02]">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </div>
      )}

      {/* Product Image with lazy-loading and hover zoom */}
      <div className="bg-gray-100 flex justify-center items-center h-48 overflow-hidden">
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
        <div className="mt-2 mb-4 flex items-center gap-2 flex-wrap">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ₹{actualPriceNum.toFixed(2)}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            ₹{sellingPriceNum.toFixed(2)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded transition duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
