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
  const [quantity, setQuantity] = useState(1);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3001/api/product/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage((Array.isArray(data.images) ? data.images[0] : null) || null);
        // Fetch prices
        fetch(`http://localhost:3001/api/product_price`)
          .then((res) => res.json())
          .then((prices) => {
            const productPrices = prices.filter(p => String(p.product_id) === String(data.id));
            setPriceMap(productPrices);
            if (productPrices.length > 0) {
              setSelectedSize(productPrices[0].size);
            } else {
              setSelectedSize(null);
            }
          })
          .catch(() => {
            setPriceMap([]);
            setSelectedSize(null);
          });
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

  // Sizes/units come from priceMap
  const sizes = priceMap.map(p => p.size).filter(Boolean);

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

  // Helper for reference books
  const renderReferenceBooks = () => {
    if (!product.reference_books || product.reference_books.length === 0) return null;
    return (
      <div className="mt-2 flex items-center text-sm">
        <span className="font-medium text-gray-700 mr-1">Reference Book{product.reference_books.length > 1 ? 's' : ''}:</span>
        {product.reference_books.map((ref, i) => {
          const isUrl = typeof ref === 'string' && (ref.startsWith('http://') || ref.startsWith('https://'));
          return (
            <span key={i} className="text-blue-700">
              {isUrl ? (
                <a href={ref} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">{ref}</a>
              ) : (
                ref
              )}
              {i < product.reference_books.length - 1 && <span className="text-gray-500">, </span>}
            </span>
          );
        })}
      </div>
    );
  };

  // Handler for prescription file
  const handlePrescriptionChange = (e) => {
    setPrescriptionError("");
    const file = e.target.files[0];
    setPrescriptionFile(file);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnails */}
        <div className="flex flex-row md:flex-col gap-4">
          {(Array.isArray(product.images) ? product.images : []).map((img, i) => (
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

          {/* Key Tags */}
          {product.key && Array.isArray(product.key) && product.key.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {product.key.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-300">{tag}</span>
              ))}
            </div>
          )}
          {product.key && typeof product.key === 'string' && product.key.trim() && (
            <div className="flex flex-wrap gap-2 mt-2">
              {product.key.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-300">{tag.trim()}</span>
              ))}
            </div>
          )}

          {/* Reference Books */}
          {renderReferenceBooks()}

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

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mt-2">
            <span className="font-medium">Quantity:</span>
            <button
              className="px-2 py-1 border rounded text-lg"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              className="px-2 py-1 border rounded text-lg"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Prescription Required */}
          {product.prescription_required && (
            <div className="mt-4">
              <div className="text-red-600 font-medium mb-2">* Prescription required for this product</div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handlePrescriptionChange}
                className="block mb-2"
              />
              {prescriptionFile && (
                <div className="text-green-700 text-sm mb-1">Selected: {prescriptionFile.name}</div>
              )}
              {prescriptionError && (
                <div className="text-red-600 text-sm mb-1">{prescriptionError}</div>
              )}
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
          <button
            className="bg-green-600 text-white w-full mt-4 py-2 rounded disabled:opacity-60"
            disabled={product.prescription_required && !prescriptionFile}
            onClick={() => {
              if (product.prescription_required && !prescriptionFile) {
                setPrescriptionError("Please upload a prescription to add this product to cart.");
                return;
              }
              // Add to cart logic here
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 border-t pt-2">
        <div className="flex gap-2 border-b pb-1">
          {[
            { key: "description", label: "description" },
            { key: "key_benefits", label: "key benefits" },
            { key: "how_to_use", label: "how to use" },
            { key: "safety_precaution", label: "safety or precautions" },
            { key: "key_ingredients", label: "ingredients" },
            { key: "other_info", label: "other information" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`capitalize px-4 pb-2 ${activeTab === tab.key ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-2 text-gray-800">
          {activeTab === "description" && <p>{product.description || "No description available."}</p>}
          {activeTab === "key_benefits" && <p>{product.key_benefits || "No key benefits provided."}</p>}
          {activeTab === "how_to_use" && <p>{product.how_to_use || "Usage information not available."}</p>}
          {activeTab === "safety_precaution" && <p>{product.safety_precaution || "No safety or precaution info."}</p>}
          {activeTab === "key_ingredients" && <p>{product.key_ingredients || "No ingredients found."}</p>}
          {activeTab === "other_info" && <p>{product.other_info || "No additional information."}</p>}
        </div>
      </div>
    </div>
  );
}
