import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from 'browser-image-compression';

const BannerManager = () => {
  const [newBanner, setNewBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [banners, setBanners] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddBanner = async () => {
    if (newBanner) {
      const formData = new FormData();
      // Compress the image before upload
      let compressedFile = newBanner;
      try {
        compressedFile = await imageCompression(newBanner, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      } catch (err) {
        toast.error('Image compression failed. Uploading original.');
      }
      formData.append("image", compressedFile);
      const toastId = toast.loading("Uploading banner...");
      try {
        const res = await fetch("http://localhost:3001/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        const bannerObj = {
          id: Date.now(),
          url: data.imageUrl,
          alt: newBanner.name || "Uploaded banner",
          public_id: data.public_id,
        };
        setBanners([...banners, bannerObj]);
        setNewBanner(null);
        setPreview(null);
        toast.success("Banner uploaded successfully!", { id: toastId });
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Upload failed. Please try again.", { id: toastId });
      }
    }
  };

  const handleRemoveBanner = async (id, public_id) => {
    const toastId = toast.loading("Removing banner...");
    const encodedId = encodeURIComponent(public_id);
    try {
      await fetch(`http://localhost:3001/api/delete/${encodedId}`, {
        method: "DELETE",
      });

      setBanners(banners.filter((banner) => banner.id !== id));
      toast.success("Banner removed.", { id: toastId });
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to remove banner.", { id: toastId });
    }
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/images");
        const data = await res.json();
        const bannersFromCloudinary = data.map((item) => ({
          id: item.asset_id,
          url: item.secure_url,
          alt: item.public_id,
          public_id: item.public_id,
        }));
        setBanners(bannersFromCloudinary);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
        toast.error("Could not load banners.");
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
            <Toaster position="top-right" />
      
      {/* Upload Section */}
      <div className="mb-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {/* Preview */}
        {preview && (
          <div className="relative mt-4">
            <img
              src={preview}
              alt={newBanner?.name || "Banner preview"}
              className="rounded w-full"
            />
            <button
              onClick={() => {
                setPreview(null);
                setNewBanner(null);
              }}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              Remove Preview
            </button>
          </div>
        )}

        {preview && (
          <button
            onClick={handleAddBanner}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Banner
          </button>
        )}
      </div>

      {/* Previously Added Banners */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Previously Added Banners</h3>
        {banners.length === 0 ? (
          <p className="text-sm text-gray-500">No banners added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="relative border rounded overflow-hidden">
                <img
                  src={banner.url}
                  alt={banner.alt}
                  className="w-full h-auto"
                />
                <button
                  onClick={() => handleRemoveBanner(banner.id, banner.public_id)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManager;
