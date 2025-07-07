import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3001/api/product/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null);
        // Fetch unit from product_price
        fetch(`http://localhost:3001/api/product_price`)
          .then((res) => res.json())
          .then((prices) => {
            const priceObj = Array.isArray(prices) ? prices.find(p => String(p.product_id) === String(data.id)) : null;
            setUnit(priceObj ? priceObj.unit : "");
          })
          .catch(() => setUnit(""));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading product...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-10 text-center text-gray-400">Product not found.</div>;

  const sizes = product.sizes || [];
  const actualPriceNum = Number(product.actual_price);
  const sellingPriceNum = Number(product.selling_price);
  const hasDiscount = actualPriceNum > sellingPriceNum;
  const discountPercentage = hasDiscount
    ? Math.round(((actualPriceNum - sellingPriceNum) / actualPriceNum) * 100)
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-6 flex-col md:flex-row">
        {/* Thumbnail Images */}
        <div className="flex flex-row md:flex-col gap-4">
          {Array.isArray(product.images) && product.images.length > 0 ? (
            product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 object-cover cursor-pointer border ${selectedImage === img ? "border-blue-500" : "border-gray-300"}`}
                alt={product.name}
              />
            ))
          ) : (
            <img
              src="https://via.placeholder.com/300x200?text=No+Image"
              className="w-20 h-20 object-cover border border-gray-300"
              alt="No product"
            />
          )}
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center">
          <img src={selectedImage || "https://via.placeholder.com/300x200?text=No+Image"} alt="Main" className="w-full h-[400px] object-contain rounded" />
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/3 space-y-4">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div>
              <h2 className="font-medium mb-2">Select Size:</h2>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1 border rounded ${selectedSize === size ? "bg-blue-500 text-white" : "border-gray-400"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prices */}
          <div className="space-x-2">
            <span className="text-lg font-bold text-red-600">₹{sellingPriceNum.toFixed(2)}</span>
            {hasDiscount && <span className="line-through text-gray-500">₹{actualPriceNum.toFixed(2)}</span>}
            {hasDiscount && <span className="text-green-600">({discountPercentage}% OFF)</span>}
          </div>

          {/* Product Unit */}
          {unit && <div className="text-sm text-gray-700">Unit: {unit}</div>}

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add to Cart</button>
            <button className="border px-4 py-2 rounded">Check Delivery</button>
          </div>

          {/* Short Description */}
          {/* <p className="text-gray-700 mt-4">
            {product.description || "No description available."}
          </p> */}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-10 border-t pt-6">
        <div className="flex gap-6 border-b pb-2">
          {[
            "description",
            "key ingredients",
            "how to use"
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-4 pb-2 ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4 text-gray-800">
          {activeTab === "description" && <p>{product.description || "No description available."}</p>}
          {activeTab === "key ingredients" && <p>{product.key_ingredients || "No key ingredients info."}</p>}
          {activeTab === "how to use" && <p>{product.how_to_use || "No usage info."}</p>}
        </div>
      </div>
    </div>
  );
}
