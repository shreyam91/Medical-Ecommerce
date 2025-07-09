import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { getBanners, createBanner, deleteBanner } from "../lib/bannerApi";

const BannerManager = () => {
  const [newBanner, setNewBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    getBanners()
      .then(setBanners)
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBanner(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Helper to delete uploaded image on server if banner creation fails
  const cleanupUploadedImage = async (imageUrl) => {
    if (!imageUrl) return;
    try {
      const baseApiUrl = (process.env.REACT_APP_API_URL?.replace('/banner', '') || 'http://localhost:3001/api');
      await fetch(`${baseApiUrl}/upload/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      console.log("Cleaned up uploaded image:", imageUrl);
    } catch (err) {
      console.error("Failed to clean up uploaded image:", err);
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner) {
      toast.error("Please select an image.");
      return;
    }

    const toastId = toast.loading("Adding banner...");

    let uploadedImageUrl = "";

    try {
      let compressedFile = newBanner;
      try {
        compressedFile = await imageCompression(newBanner, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      } catch {
        toast.error("Image compression failed. Uploading original.");
      }

      // Upload image
      const formData = new FormData();
      formData.append("image", compressedFile);

      const baseApiUrl = (process.env.REACT_APP_API_URL?.replace('/banner', '') || 'http://localhost:3001/api');
      const uploadRes = await fetch(`${baseApiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Image upload failed');
      const uploadData = await uploadRes.json();
      uploadedImageUrl = uploadData.imageUrl;

      // Create banner with uploaded image URL
      const created = await createBanner({ image_url: uploadedImageUrl });
      setBanners([created, ...banners]);
      toast.success("Banner added!", { id: toastId });

      // Clear form
      setNewBanner(null);
      setPreview(null);
    } catch (error) {
      // Cleanup the uploaded image if banner creation failed
      await cleanupUploadedImage(uploadedImageUrl);

      toast.error("Failed to add banner.", { id: toastId });
    }
  };

  const handleRemoveBanner = async (id) => {
    const toastId = toast.loading("Removing banner...");
    try {
      await deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
      toast.success("Banner removed.", { id: toastId });
    } catch (err) {
      toast.error("Failed to remove banner.", { id: toastId });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <Toaster position="top-right" />
      <div className="mb-4">
        <input
          key={preview ? "reset" : "default"}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
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

      <div>
        <h3 className="text-lg font-semibold mb-2">Previously Added Banners</h3>
        {banners.length === 0 ? (
          <p className="text-sm text-gray-500">No banners added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="relative border rounded overflow-hidden">
                {banner.image_url && (
                  <img src={banner.image_url} alt={`Banner ${banner.id}`} className="w-full h-auto" />
                )}
                <button
                  onClick={() => handleRemoveBanner(banner.id)}
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
