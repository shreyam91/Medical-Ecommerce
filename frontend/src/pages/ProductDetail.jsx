import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";
import Style from "../components/Style";

import badges from '/assets/badges.svg';
import brands from '/assets/brands.svg';
import order from '/assets/order.svg';
import products from '/assets/products.svg';
import { ProductCardScrollable } from "../components/ProductCard";
import { Link } from "react-router-dom";


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
    const [peoplePreferredProducts, setPeoplePreferredProducts] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]);

  

  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scrollInterval = setInterval(() => {
      if (!scrollContainer) return;
      scrollContainer.scrollBy({ left: 1, behavior: 'smooth' });
      scrollAmount += 1;

      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 20); // Adjust speed (lower = faster)

    return () => clearInterval(scrollInterval);
  }, []);



  const icons = [
  { img: badges, title: 'Genuine & Authentic ' },
  { img: brands, title: '100+ Top Brands' },
  { img: order, title: 'Fast & Safe Delivery' },
  { img: products, title: '1000+ Products' },
];

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3001/api/product/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(
          (Array.isArray(data.images) ? data.images[0] : null) || null
        );

    // After setProduct(data);
fetch(`http://localhost:3001/api/product?category=${encodeURIComponent(data.category)}&exclude_id=${data.id}`)
  .then((res) => res.json())
  .then((similarData) => {
    if (Array.isArray(similarData)) {
      setSimilarProducts(similarData.slice(0, 10)); // limit results
    } else {
      setSimilarProducts([]);
    }
  })
  .catch((err) => {
    console.error("Failed to fetch similar products", err);
    setSimilarProducts([]);
  });


        // Fetch people preferred products
    fetch("http://localhost:3001/api/product?people_preferred=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPeoplePreferredProducts(data);
        } else {
          setPeoplePreferredProducts([]);
          console.error("API error (people preferred):", data.error || data);
        }
      })
      .catch((err) => {
        setPeoplePreferredProducts([]);
        console.error("Network error (people preferred):", err);
      });


        // Fetch prices
        fetch(`http://localhost:3001/api/product_price`)
          .then((res) => res.json())
          .then((prices) => {
            const productPrices = prices.filter(
              (p) => String(p.product_id) === String(data.id)
            );
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

  if (loading)
    return <div className="p-10 text-center">Loading product...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!product)
    return (
      <div className="p-10 text-center text-gray-400">Product not found.</div>
    );

  // Sizes/units come from priceMap
  const sizes = priceMap.map((p) => p.size).filter(Boolean);

  const selectedPrice = priceMap.find((p) => p.size === selectedSize);
  const actualPrice = Number(
    selectedPrice?.actual_price || product.actual_price || 0
  );
  const sellingPrice = Number(
    selectedPrice?.selling_price || product.selling_price || 0
  );
  const hasDiscount = actualPrice > sellingPrice;
  const discount = hasDiscount
    ? Math.round(((actualPrice - sellingPrice) / actualPrice) * 100)
    : 0;

  const handleCheckDelivery = () => {
    if (pincode.trim().length >= 5) {
      setDeliveryMessage("✅ Delivered within 5-7 days.");
    } else {
      setDeliveryMessage("❌ Enter a valid pincode.");
    }
  };

  // Helper for reference books
  const renderReferenceBooks = () => {
    if (!product.reference_books || product.reference_books.length === 0)
      return null;
    return (
      <div className="mt-2 flex items-center text-sm">
        <span className="font-medium text-gray-700 mr-1">
          Reference Book{product.reference_books.length > 1 ? "s" : ""}:
        </span>
        {product.reference_books.map((ref, i) => {
          const isUrl =
            typeof ref === "string" &&
            (ref.startsWith("http://") || ref.startsWith("https://"));
          return (
            <span key={i} className="text-blue-700">
              {isUrl ? (
                <a
                  href={ref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-500"
                >
                  {ref}
                </a>
              ) : (
                ref
              )}
              {i < product.reference_books.length - 1 && (
                <span className="text-gray-500">, </span>
              )}
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

  // Remove prescription file
  const handleRemovePrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionError("");
  };

  const { addToCart } = useCart();

  return (
    <>
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      {/* Responsive Images Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile view: main image + thumbnails below */}
        <div className="block md:hidden">
          <div className="flex items-center justify-center mb-4">
            <img
              src={
                selectedImage ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt="Main product"
              className="w-full h-[300px] object-contain rounded"
            />
          </div>
          <div className="flex overflow-x-auto gap-4">
            {(Array.isArray(product.images) ? product.images : []).map(
              (img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover cursor-pointer border ${
                    selectedImage === img
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  alt="product-thumbnail"
                />
              )
            )}
          </div>
        </div>

        {/* Desktop view: thumbnails left, main image right */}
        <div className="hidden md:flex flex-row gap-6 w-full">
          <div className="flex flex-col gap-4">
            {(Array.isArray(product.images) ? product.images : []).map(
              (img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover cursor-pointer border ${
                    selectedImage === img
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  alt="product-thumbnail"
                />
              )
            )}
          </div>
          <div className=" flex-1 flex items-center justify-center">
            <img
              src={
                selectedImage ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt="Main product"
              className="w-[400px] h-[400px] object-contain rounded"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">{product.name}</h1>

          {/* Key Tags */}
          {product.key &&
            Array.isArray(product.key) &&
            product.key.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {product.key.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          {product.key &&
            typeof product.key === "string" &&
            product.key.trim() && (
              <div className="flex flex-wrap gap-2 mt-2">
                {product.key.split(",").map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium border border-blue-300"
                  >
                    {tag.trim()}
                  </span>
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
                    className={`px-4 py-1 border rounded ${
                      selectedSize === size
                        ? "bg-blue-500 text-white"
                        : "border-gray-400"
                    }`}
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
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              className="px-2 py-1 border rounded text-lg"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Prescription Required */}
{product.prescription_required && (
  <div className="mt-4 border p-4 rounded bg-gray-50">
    <label className="block font-medium text-red-600 mb-2">
      * Prescription required
    </label>
    <input
      type="file"
      accept="image/*,application/pdf"
      onChange={handlePrescriptionChange}
      className="block w-full text-sm text-gray-700 border rounded p-2 mb-2 bg-white"
    />
    {prescriptionFile && (
      <div className="flex items-center gap-4 mt-2">
        {/* Preview */}
        {prescriptionFile.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(prescriptionFile)}
            alt="Preview"
            className="w-24 h-24 object-contain border rounded shadow"
          />
        ) : (
          <div className="w-24 h-24 border rounded flex items-center justify-center text-gray-500 bg-white shadow">
            📄 PDF
          </div>
        )}
        <div>
          <p className="text-green-700 text-sm">{prescriptionFile.name}</p>
          <button
            type="button"
            onClick={handleRemovePrescription}
            className="text-red-600 text-xs underline mt-1 hover:text-red-800"
          >
            Remove file
          </button>
        </div>
      </div>
    )}
    {prescriptionError && (
      <div className="text-red-600 text-sm mt-2">{prescriptionError}</div>
    )}
  </div>
)}


          {/* Pricing */}
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-3 text-lg font-semibold text-green-600">
              ₹{sellingPrice.toFixed(2)}
              {hasDiscount && (
                <>
                  <span className="line-through text-gray-500 text-sm">
                    MRP: ₹{actualPrice.toFixed(2)}
                  </span>
                  <span className="text-red-700 text-sm">
                    Save: {discount}%
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">Inclusive of all taxes</div>
            {/* Product Notes */}
            <div className="text-xs text-gray-600 mt-4 space-y-1">
              {/* <p>
                * 10 Capsules per products.
              </p> */}
              <p>
                 Company
              </p>
              <p>* Country of Origin: India</p>
              <p>* Delivery charges will be applied at checkout.</p>
            </div>
          </div>

              
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
      {icons.map((item, index) => (
        <div key={index} className="flex flex-col items-center w-24">
          <img src={item.img} alt={item.title} className="w-12 h-12 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>
        </div>
      ))}
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
            <button
              onClick={handleCheckDelivery}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Check
            </button>
          </div>
          {deliveryMessage && (
            <div className="text-sm mt-1 text-gray-700">{deliveryMessage}</div>
          )}

          {/* Add to Cart Button */}
          <button
            className="bg-green-600 text-white w-full mt-4 py-2 rounded disabled:opacity-60 cursor-pointer"
            disabled={
              (product.prescription_required && !prescriptionFile) ||
              !selectedSize
            }
            onClick={() => {
              if (product.prescription_required && !prescriptionFile) {
                setPrescriptionError("Please upload prescription to proceed.");
                return;
              }
              // addToCart({
              //   id: product.id,
              //   name: product.name,
              //   size: selectedSize,
              //   price: sellingPrice,
              //   quantity,
              //   prescriptionFile,
              //   image: selectedImage,
              // });
              addToCart({
  id: product.id,
  name: product.name,
  size: selectedSize,
  price: sellingPrice,
  quantity,
  image: selectedImage,
});

// Store prescription file in sessionStorage
if (prescriptionFile) {
  sessionStorage.setItem(
    `prescription_${product.id}`,
    JSON.stringify({
      name: prescriptionFile.name,
      type: prescriptionFile.type,
    })
  );

  // Optionally store the actual File object using a workaround:
  window.__prescriptions__ = window.__prescriptions__ || {};
  window.__prescriptions__[product.id] = prescriptionFile;
}

              toast.success("Product added to cart");
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-5 border-t pt-4">
        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-4 border-b pb-2">
          {[
            { key: "description", label: "description" },
            { key: "key_ingredients", label: "key ingredients" },
            { key: "how_to_use", label: "Dosage" },
            { key: "safety_precaution", label: "dietary & lifestyle advice" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`capitalize px-4 pb-2 font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop Tab Content */}
        <div className="hidden md:block mt-3 text-gray-800 leading-relaxed">
          {activeTab === "description" && (
            <p>{product.description || "No description available."}</p>
          )}
          {activeTab === "key_benefits" && (
            <p>{product.key_benefits || "No key benefits provided."}</p>
          )}
          {activeTab === "how_to_use" && (
            <p>{product.how_to_use || "Usage information not available."}</p>
          )}
          {activeTab === "safety_precaution" && (
            <p>
              {product.safety_precaution || "No safety or precaution info."}
            </p>
          )}
          {activeTab === "key_ingredients" && (
            <p>{product.key_ingredients || "No ingredients found."}</p>
          )}
        </div>

        {/* Mobile Accordion Tabs */}
        <div className="block md:hidden mt-4 space-y-6 text-gray-800 leading-relaxed whitespace-pre-line">
          {[
            { label: "Description", content: product.description },
            { label: "Key Ingredients", content: product.key_ingredients },
            { label: "Dosage", content: product.how_to_use },
            {
              label: "Dietary & Lifestyle Advice",
              content: product.dietary,
            },
          ].map((section) => (
            <div key={section.label} className="border-b pb-4">
              <h2 className="text-lg font-semibold mb-1">{section.label}</h2>
              <p>{section.content || "Not available."}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ----------  */}
           {similarProducts.length > 0 && (
  <div className="mt-10 px-4 sm:px-6">
    <div className="flex justify-between items-center mb-4 gap-2">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Similar Products</h1>
      <Link
        to={`/products?category=${encodeURIComponent(product.category)}`}
        className=" text-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg  transition-colors text-s sm:text-sm font-medium whitespace-nowrap"
      >
        View All
      </Link>
    </div>
    <div 
      className="flex overflow-x-auto gap-4 scrollbar-hide"
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* Internet Explorer 10+ */
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      {similarProducts.map((item) => (
        <Link to={`/product/${item.id}`} key={item.id}>
          <ProductCardScrollable
            id={item.id}
            name={item.name}
            image={
              Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : "https://via.placeholder.com/200"
            }
            actualPrice={item.actual_price}
            sellingPrice={item.selling_price}
          />
        </Link>
      ))}
    </div>
  </div>
)}

        {/* ---------------  */}

        {/* ----------  */}
            <div className="mt-8 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">People Preferred Products</h1>
          <Link
            to="/products?people_preferred=true"
            className=" text-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg  transition-colors text-s sm:text-sm font-medium whitespace-nowrap"
          >
            View All
          </Link>
        </div>
        <div 
          className="flex overflow-x-auto gap-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Safari and Chrome */
            }
          `}</style>
          {peoplePreferredProducts.map((product) => (
            <Link
        key={product.id}
        to={`/product/${product.id}`}
        style={{ textDecoration: 'none' }} 
      >
            <ProductCardScrollable
              key={product.id}
              id={product.id}
              image={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : undefined}
              name={product.name}
              actualPrice={product.actual_price}
              sellingPrice={product.selling_price}
            />
            </Link>
          ))}
        </div>
      </div>
        {/* ---------------  */}

    <Style/>  

    </>
  );
}
