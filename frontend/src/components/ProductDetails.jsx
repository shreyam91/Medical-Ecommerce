import { useState } from "react";

const images = [
  "/img1.jpg",
  "/img2.jpg",
  "/img3.jpg"
];

const sizes = ["S", "M", "L", "XL"];

export default function ProductDetails() {
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Thumbnail Images */}
        <div className="flex flex-col gap-4">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 object-cover cursor-pointer border ${selectedImage === img ? "border-blue-500" : "border-gray-300"}`}
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1">
          <img src={selectedImage} alt="Main" className="w-full h-[500px] object-cover rounded" />
        </div>

        {/* Product Info */}
        <div className="w-1/3 space-y-4">
          <h1 className="text-3xl font-semibold">Product Name</h1>

          {/* Size Selector */}
          <div>
            <h2 className="font-medium mb-2">Select Size:</h2>
            <div className="flex gap-2">
              {sizes.map(size => (
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

          {/* Prices */}
          <div className="space-x-2">
            <span className="text-lg font-bold text-red-600">₹899</span>
            <span className="line-through text-gray-500">₹1299</span>
            <span className="text-green-600">(30% OFF)</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Add to Cart</button>
            <button className="border px-4 py-2 rounded">Check Delivery</button>
          </div>

          {/* Short Description */}
          <p className="text-gray-700 mt-4">
            This is a short description about the product. It highlights key features and usage.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-10 border-t pt-6">
        <div className="flex gap-6 border-b pb-2">
          {["description", "key ingredients", "how to use"].map(tab => (
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
          {activeTab === "description" && <p>This is the full product description. It's detailed and informative.</p>}
          {activeTab === "key ingredients" && <p>Key Ingredients: Aloe Vera, Vitamin C, Green Tea.</p>}
          {activeTab === "how to use" && <p>Apply twice daily on clean skin for best results.</p>}
        </div>
      </div>
    </div>
  );
}
