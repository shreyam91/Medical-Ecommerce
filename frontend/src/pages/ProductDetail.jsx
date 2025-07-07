import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [priceMap, setPriceMap] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3001/api/product/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.images?.[0] || null);
        setSelectedSize(data.sizes?.[0] || null);
        // Fetch prices
        fetch(`http://localhost:3001/api/product_price`)
          .then((res) => res.json())
          .then((prices) => {
            const productPrices = prices.filter(p => String(p.product_id) === String(data.id));
            setPriceMap(productPrices);
          })
          .catch(() => setPriceMap([]));
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

  const selectedPrice = priceMap.find(p => p.size === selectedSize);
  const actualPrice = Number(selectedPrice?.actual_price || product.actual_price || 0);
  const sellingPrice = Number(selectedPrice?.selling_price || product.selling_price || 0);
  const hasDiscount = actualPrice > sellingPrice;
  const discount = hasDiscount ? Math.round(((actualPrice - sellingPrice) / actualPrice) * 100) : 0;

  const handleCheckDelivery = () => {
    if (pincode.trim().length >= 5) {
      setDeliveryMessage("✅ Delivered within 5-7 days.");
    } else {
      setDeliveryMessage("❌ Enter a valid pincode.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnails */}
        <div className="flex flex-row md:flex-col gap-4">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 object-cover cursor-pointer border ${selectedImage === img ? "border-blue-500" : "border-gray-300"}`}
              alt="product-thumbnail"
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={selectedImage || "https://via.placeholder.com/300x200?text=No+Image"}
            alt="Main product"
            className="w-full h-[400px] object-contain rounded"
          />
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/3 space-y-4">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {/* Cause Type Tags */}
<div>
  {/* <h2 className="font-medium text-gray-700 mb-2">Cause Type:</h2> */}
  <div className="flex flex-wrap gap-2">
    {(product.causes && product.causes.length > 0 ? product.causes : ["Cold", "Cough", "Fever"]).map((cause, i) => (
      <button
        key={i}
        onClick={() => alert(`Clicked on ${cause}`)} // You can handle navigation or filtering here later
        className="px-3 py-1 rounded-full text-sm border border-blue-500 text-blue-600 hover:bg-blue-100 transition"
      >
        {cause}
      </button>
    ))}
  </div>
</div>


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

          {/* Pricing */}
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-3 text-lg font-semibold text-red-600">
              ₹{sellingPrice.toFixed(2)}
              {hasDiscount && (
                <>
                  <span className="line-through text-gray-500 text-sm">MRP: ₹{actualPrice.toFixed(2)}</span>
                  <span className="text-green-600 text-sm">Save: {discount}%</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">Inclusive of all taxes</div>
            {/* Product Notes */}
          <div className="text-xs text-gray-600 mt-4 space-y-1">
            <p>* This product cannot be returned & refunded or exchanged unless you received a wrong or damaged product.</p>
            <p>* Country of Origin: India</p>
            <p>* Delivery charges will be applied at checkout.</p>
          </div>
          </div>
          

          {/* Delivery Check */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter pincode"
              className="border px-3 py-2 rounded w-full"
            />
            <button onClick={handleCheckDelivery} className="bg-blue-600 text-white px-4 py-2 rounded">
              Check
            </button>
          </div>
          {deliveryMessage && <div className="text-sm mt-1 text-gray-700">{deliveryMessage}</div>}

          {/* Add to Cart Button */}
          <button className="bg-green-600 text-white w-full mt-4 py-2 rounded">Add to Cart</button>

          
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 border-t pt-6">
        <div className="flex gap-6 border-b pb-2">
          {["description", "key benefits", "how to use", "safety or precautions","ingredients", "other information"].map((tab) => (
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
          {activeTab === "key benefits" && <p>{product.key_benefits || "No key benefits provided."}</p>}
          {activeTab === "how to use" && <p>{product.how_to_use || "Usage information not available."}</p>}
          {activeTab === "safety or precautions" && <p>{product.safety_info || "No safety or precaution info."}</p>}
          {activeTab === "ingredients" && <p>{product.ingredients || "No ingredients found."}</p>}
          {activeTab === "other info" && <p>{product.other_info || "No additional information."}</p>}
        </div>
      </div>
    </div>
  );
}
