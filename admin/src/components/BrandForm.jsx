import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { getBrands, createBrand, deleteBrand } from "../lib/brandApi";

const BrandForm = () => {
  const [brandName, setBrandName] = useState("");
  const [image, setImage] = useState(null);
  const [brandList, setBrandList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getBrands()
      .then(setBrandList)
      .catch(() => setBrandList([]));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!image) {
  //     toast.error("Please upload an image.");
  //     return;
  //   }
  //   setIsUploading(true);
  //   const toastId = toast.loading("Uploading brand image...");
  //   let compressedFile = image;
  //   try {
  //     compressedFile = await imageCompression(image, {
  //       maxSizeMB: 0.2,
  //       maxWidthOrHeight: 1024,
  //       useWebWorker: true,
  //     });
  //   } catch (err) {
  //     toast.error("Image compression failed. Uploading original.");
  //   }
  //   const formData = new FormData();
  //   formData.append("image", compressedFile);
  //   try {
  //     const res = await fetch("http://localhost:3001/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     if (!res.ok) throw new Error("Upload failed");
  //     const data = await res.json();
  //     const newBrand = {
  //       name: brandName,
  //       image_url: data.imageUrl,
  //     };
  //     const created = await createBrand(newBrand);
  //     setBrandList([created, ...brandList]);
  //     toast.success("Brand added successfully!", { id: toastId });
  //     setBrandName("");
  //     setImage(null);
  //   } catch (err) {
  //     toast.error("Image upload or brand creation failed.", { id: toastId });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Form validation first
  if (!brandName.trim()) {
    toast.error("Please enter a brand name.");
    return;
  }

  if (!image) {
    toast.error("Please upload an image.");
    return;
  }

  setIsUploading(true);
  const toastId = toast.loading("Uploading brand image...");
  let compressedFile = image;

  try {
    // Compress image
    compressedFile = await imageCompression(image, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });
  } catch (err) {
    toast.error("Image compression failed. Uploading original.");
  }

  const formData = new FormData();
  formData.append("image", compressedFile);

  try {
    // Upload image
    const res = await fetch("http://localhost:3001/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    const newBrand = {
      name: brandName,
      image_url: data.imageUrl,
    };

    // Save brand
    const created = await createBrand(newBrand);
    setBrandList([created, ...brandList]);
    toast.success("Brand added successfully!", { id: toastId });

    // Reset form
    setBrandName("");
    setImage(null);
  } catch (err) {
    toast.error("Image upload or brand creation failed.", { id: toastId });
  } finally {
    setIsUploading(false);
  }
};


  const handleRemoveBrand = async (id) => {
    // Only try API delete if id is a real number
    if (typeof id === 'number' && !isNaN(id)) {
      try {
        await deleteBrand(id);
        setBrandList(brandList.filter((brand) => brand.id !== id));
        toast.info("Brand removed.");
      } catch {
        toast.error("Failed to remove brand.");
      }
    } else {
      // Remove local-only brands
      setBrandList(brandList.filter((brand) => brand.id !== id));
      toast.info("Brand removed (local only).");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="md:w-1/2 w-full">
          <label className="block mb-2 text-sm font-medium">Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            required
            className="w-full p-2 mb-4 border rounded"
            placeholder="Enter brand name"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>

        {/* Right: Brand List */}
        <div className="md:w-1/2 w-full border rounded p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">All Brands</h2>
          {brandList.length === 0 ? (
            <p className="text-gray-500">No brands added yet.</p>
          ) : (
            <div className="max-h-[240px] overflow-y-auto pr-2">
              <ul className="space-y-4">
                {brandList.map((brand) => (
                  <li
                    key={brand.id}
                    className="flex items-center gap-4 bg-white p-3 rounded shadow"
                  >
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{brand.name}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBrand(brand.id)}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandForm;
