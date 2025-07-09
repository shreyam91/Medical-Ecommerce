import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import { getBrands, createBrand, updateBrand, deleteBrand, deleteUploadedImage } from "../lib/brandApi";

const BrandForm = () => {
  const [brandName, setBrandName] = useState("");
  const [image, setImage] = useState(null);
  const [brandList, setBrandList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editBrand, setEditBrand] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Please enter a brand name.");
      return;
    }
    if (!image && !editBrand) {
      toast.error("Please upload an image.");
      return;
    }
    setIsUploading(true);

    let brandId = null;
    let createdBrand = null;
    let imageUrl = editBrand ? editBrand.logo_url : null;
    let uploadedImageUrl = null;

    try {
      // Prepare brand payload without image initially
      const payload = { name: brandName, logo_url: editBrand ? editBrand.logo_url : '' };

      if (editBrand) {
        // Update brand data (without image)
        const updatedBrand = await updateBrand(editBrand.id, payload);
        brandId = editBrand.id;
      } else {
        // Create brand (without image)
        createdBrand = await createBrand(payload);
        brandId = createdBrand.id;
      }

      // Upload image if a new image was selected
      if (image) {
        const toastId = toast.loading("Uploading brand image...");
        let compressedFile = image;
        try {
          compressedFile = await imageCompression(image, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          });
        } catch {
          toast.error('Image compression failed. Uploading original.', { id: toastId });
        }

        const formData = new FormData();
        formData.append("image", compressedFile);

        const res = await fetch("http://localhost:3001/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        imageUrl = data.imageUrl;
        uploadedImageUrl = data.imageUrl;
        toast.success("Image uploaded!", { id: toastId });
      }

      // Update brand with new imageUrl if changed
      if (imageUrl && brandId) {
        const currentBrand = await fetch(`http://localhost:3001/api/brand/${brandId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!currentBrand.ok) throw new Error('Failed to fetch current brand data');
        const current = await currentBrand.json();

        if (current.logo_url !== imageUrl) {
          const updatedPayload = { ...current, logo_url: imageUrl };
          const updatedBrandRes = await fetch(`http://localhost:3001/api/brand/${brandId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(updatedPayload),
          });
          if (!updatedBrandRes.ok) {
            // Rollback: delete uploaded image if brand update failed
            if (uploadedImageUrl) {
              try {
                await deleteUploadedImage(uploadedImageUrl);
              } catch (delErr) {
                console.error("Failed to delete uploaded image on rollback", delErr);
              }
            }
            throw new Error("Failed to update brand with new image");
          }
          const updatedBrand = await updatedBrandRes.json();
          setBrandList(brandList.map(b => (b.id === brandId ? updatedBrand : b)));
        } else {
          // No logo_url change, update brand list state with updated brand info
          if (editBrand) {
            setBrandList(brandList.map(b => (b.id === brandId ? { ...b, name: brandName } : b)));
          } else if (createdBrand) {
            setBrandList([createdBrand, ...brandList]);
          }
        }
      } else if (!editBrand && createdBrand) {
        // Add created brand if no image upload
        setBrandList([createdBrand, ...brandList]);
      }

      setBrandName("");
      setImage(null);
      setEditBrand(null);
      toast.success(editBrand ? "Brand updated successfully!" : "Brand created successfully!");
    } catch (err) {
      toast.error(err.message || "Brand creation or update failed.");

      // If image was uploaded but form submission failed, try to cleanup uploaded image
      if (uploadedImageUrl) {
        try {
          await deleteUploadedImage(uploadedImageUrl);
          toast.success("Uploaded image cleaned up after failure.");
        } catch (delErr) {
          console.error("Failed to delete uploaded image after failure", delErr);
          toast.error("Failed to cleanup uploaded image after failure.");
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditBrand = (brand) => {
    setEditBrand(brand);
    setBrandName(brand.name);
    setImage(null);
  };

  const handleRemoveBrand = async (id) => {
    if (typeof id === 'number' && !isNaN(id)) {
      try {
        await deleteBrand(id);
        setBrandList(brandList.filter((brand) => brand.id !== id));
        toast.success("Brand removed.");
      } catch (err) {
        console.error('Delete brand error:', err);
        toast.error("Failed to remove brand.");
      }
    } else {
      setBrandList(brandList.filter((brand) => brand.id !== id));
      toast.success("Brand removed (local only).");
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
            required={!editBrand}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            disabled={isUploading}
          >
            {editBrand ? 'Update Brand' : 'Submit'}
          </button>
          {editBrand && (
            <button
              type="button"
              className="w-full mt-2 bg-gray-400 text-white p-2 rounded hover:bg-gray-500"
              onClick={() => {
                setEditBrand(null);
                setBrandName("");
                setImage(null);
              }}
            >
              Cancel Edit
            </button>
          )}
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
                    {brand.logo_url && (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{brand.name}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBrand(brand.id)}
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleEditBrand(brand)}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-2"
                    >
                      Edit
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
