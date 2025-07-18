import React, { useState, useEffect, useRef } from "react";
import ImageUploader from "./ImageUploader";
import toast, { Toaster } from "react-hot-toast";
import { createProduct, updateProduct, deleteImage } from "../lib/productApi";
import { getBrands } from "../lib/brandApi";
import { getReferenceBooks } from "../lib/referenceBookApi";
import TagInput from "./TagInput";

const MedicineForm = ({ editProduct, setEditProduct, category, onDelete }) => {
  const imageRef = useRef();
  const typeOptions = [
    { value: "tablet", label: "Tablet" },
    { value: "capsule", label: "Capsule" },
    { value: "ml", label: "Liquid (ml)" },
    { value: "gm", label: "Gram (gm)" },
  ];

  const initial = {
    type: "tablet",
    name: "",
    brand_id: "",
    referenceBook: "",
    keyTags: [],
    ingredients: "",
    howToUse: "",
    safetyPrecaution: "",
    description: "",
    benefits: "",
    otherInfo: "",
    gst: "",
    prescriptionRequired: false,
    strength: "",
    prices: [
      {
        size: "",
        quantity: "",
        actualPrice: "",
        discount: "",
        sellingPrice: "",
      },
    ],
    selectedImages: [],
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [brandsList, setBrandsList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch brands & books, initialize on edit
  useEffect(() => {
    getBrands()
      .then(setBrandsList)
      .catch(() => setBrandsList([]));
    getReferenceBooks()
      .then(setBooksList)
      .catch(() => setBooksList([]));

    if (editProduct) {
      setForm({
        type:
          editProduct.medicine_type === "Syrup"
            ? "ml"
            : editProduct.medicine_type === "Powder"
            ? "gm"
            : "tablet",
        name: editProduct.name || "",
        brand_id: String(editProduct.brand_id || ""),
        referenceBook: editProduct.reference_books?.[0] || "",
        keyTags: (editProduct.key || "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        ingredients: editProduct.key_ingredients || "",
        howToUse: editProduct.how_to_use || "",
        safetyPrecaution: editProduct.safety_precaution || "",
        description: editProduct.description || "",
        benefits: editProduct.key_benefits || "",
        otherInfo: editProduct.other_info || "",
        gst: String(editProduct.gst || ""),
        prescriptionRequired: Boolean(editProduct.prescription_required),
        strength: editProduct.strength || "",
        prices: [
          {
            size: editProduct.size || editProduct.medicine_type || form.type,
            quantity: String(editProduct.total_quantity || ""),
            actualPrice: String(editProduct.actual_price || ""),
            discount: String(editProduct.discount_percent || ""),
            sellingPrice: String(editProduct.selling_price || ""),
          },
        ],
        selectedImages: editProduct.images || [],
      });
    }
  }, [editProduct]);

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceChange = (idx, field, value) => {
    const prices = [...form.prices];
    prices[idx][field] = value;

    const actual = parseFloat(prices[idx].actualPrice) || 0;
    const discount = parseFloat(prices[idx].discount) || 0;
    // Calculate discounted price
    let discounted = actual > 0 ? actual - (actual * discount) / 100 : 0;
    // Add GST if available
    const gst = parseFloat(form.gst) || 0;
    let sellingWithGst = discounted > 0 ? discounted + (discounted * gst) / 100 : "";
    prices[idx].sellingPrice = sellingWithGst !== "" ? sellingWithGst.toFixed(2) : "";

    setForm((prev) => ({ ...prev, prices }));
  };

  const addPriceRow = () =>
    setForm((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        {
          size: "",
          quantity: "",
          actualPrice: "",
          discount: "",
          sellingPrice: "",
        },
      ],
    }));

  const removePriceRow = (idx) => {
    if (form.prices.length === 1) return;
    setForm((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== idx),
    }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.brand_id) e.brand_id = "Required";
    if (!form.keyTags.length) e.keyTags = "Add tags";
    if (!form.description.trim()) e.description = "Required";
    if (!form.benefits.trim()) e.benefits = "Required";
    if (!form.howToUse.trim()) e.howToUse = "Required";
    if (!form.safetyPrecaution.trim()) e.safetyPrecaution = "Required";
    if (!form.ingredients.trim()) e.ingredients = "Required";
    if (!form.otherInfo.trim()) e.otherInfo = "Required";
    if (!["0", "5", "12", "18"].includes(form.gst)) e.gst = "Select valid GST";
    if (form.type === "tablet" && !form.strength) e.strength = "Required";
    form.prices.forEach((p, i) => {
      if (!p.size) e[`size_${i}`] = "Required";
      if (!p.quantity) e[`quantity_${i}`] = "Required";
      if (
        !p.actualPrice ||
        isNaN(p.actualPrice) ||
        parseFloat(p.actualPrice) <= 0
      )
        e[`actualPrice_${i}`] = "Enter price";
      if (p.discount === "" || isNaN(p.discount) || parseFloat(p.discount) < 0)
        e[`discount_${i}`] = "Invalid";
      if (!p.sellingPrice) e[`sellingPrice_${i}`] = "Required";
    });
    if (!form.selectedImages || form.selectedImages.length === 0)
      e.selectedImages = "Select at least one";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleDelete = async () => {
    if (!editProduct) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
     await deleteProduct(editProduct.id);
toast.success("Product deleted successfully");
// Add a short delay before unmounting/resetting
setTimeout(() => {
  setEditProduct?.(null);
  if (typeof onDelete === 'function') onDelete();
}, 500);
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    let productId,
      uploadedUrls = [],
      initialUrls = [];

    if (editProduct && Array.isArray(editProduct.images)) {
      initialUrls = [...editProduct.images];
    }

    try {
      const common = {
        name: form.name.trim(),
        category: category || "Ayurvedic",
        medicine_type:
          form.type === "ml"
            ? "Liquid"
            : form.type === "gm"
            ? "Gram"
            : "Tablet",
        brand_id: parseInt(form.brand_id, 10),
        reference_books: form.referenceBook ? [form.referenceBook] : [],
        key: form.keyTags.join(", "),
        key_ingredients: form.ingredients.trim(),
        key_benefits: form.benefits.trim(),
        how_to_use: form.howToUse.trim(),
        safety_precaution: form.safetyPrecaution.trim(),
        description: form.description.trim(),
        other_info: form.otherInfo.trim(),
        strength: form.strength.trim(),
        gst: parseInt(form.gst, 10),
        prescription_required: form.prescriptionRequired,
        actual_price: parseFloat(form.prices[0].actualPrice),
        selling_price: parseFloat(form.prices[0].sellingPrice),
        discount_percent: parseFloat(form.prices[0].discount),
        total_quantity: parseInt(form.prices[0].quantity, 10),
        images: [],
      };

      if (editProduct) {
        await updateProduct(editProduct.id, { ...common });
        productId = editProduct.id;
        toast.success("Product updated successfully");
      } else {
        const pr = await createProduct({ ...common });
        productId = pr.id;
        toast.success("Product added successfully");
      }

      for (const img of form.selectedImages) {
        if (typeof img === "string") {
          uploadedUrls.push(img);
        } else {
          const fd = new FormData();
          fd.append("image", img);
          const res = await fetch(
            `${ "http://localhost:3001/api"}/upload`,
            {
              method: "POST",
              body: fd,
            }
          );
          if (!res.ok) throw new Error("Image upload failed");
          const js = await res.json();
          uploadedUrls.push(js.imageUrl);
        }
      }

      const finalUrls = Array.from(new Set([...initialUrls, ...uploadedUrls]));

      if (uploadedUrls.length > 0) {
        await updateProduct(productId, { ...common, images: finalUrls });
        toast.success("Product images updated successfully");
      }

      setForm(initial);
      imageRef.current?.clearImages();
      setEditProduct?.(null);
    } catch (err) {
      toast.error(err.message || "Failed to submit product");
      // Clean up orphaned images
      for (const url of uploadedUrls) {
        try {
          await deleteImage(url);
        } catch {
          console.error("Cleanup failed for", url);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Toaster position="top-right" />
      {/* Type selectors */}
      <div className="flex gap-2">
        {typeOptions.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`w-full font-semibold px-6 py-3 rounded ${
              form.type === o.value
                ? "bg-orange-600 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={() =>
              setForm((f) => ({
                ...f,
                type: o.value,
                prices: [{ ...f.prices[0], size: "" }],
              }))
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Image Uploader */}
      <ImageUploader
        ref={imageRef}
        onFilesSelected={(files) => {
          setForm((f) => {
            const existing = f.selectedImages || [];
            const all = [...existing, ...files];
            const unique = [];
            const seen = new Set();
            for (const img of all) {
              let key;
              if (typeof img === "string") {
                key = img;
              } else {
                key = img.name + "_" + img.size;
              }
              if (!seen.has(key)) {
                seen.add(key);
                unique.push(img);
              }
            }
            return { ...f, selectedImages: unique };
          });
        }}
        deferUpload
        previewUrls={form.selectedImages && form.selectedImages.length > 0 && typeof form.selectedImages[0] === 'string' ? form.selectedImages : undefined}
      />
      {errors.selectedImages && (
        <p className="text-red-500">{errors.selectedImages}</p>
      )}

      {/* Product Name */}
      <div>
        <label className="font-medium block mb-1">Product Name</label>
        <input
          type="text"
          name="name"
          className="w-full border rounded p-2"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Brand */}
      <div>
        <label htmlFor="brand_id" className="block font-medium mb-1">
          Brand
        </label>
        <select
          id="brand_id"
          name="brand_id"
          value={form.brand_id}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${
            errors.brand_id ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Brand</option>
          {brandsList.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {errors.brand_id && (
          <p className="text-red-600 text-sm mt-1">{errors.brand_id}</p>
        )}
      </div>

      {/* Reference Book */}
      <div>
        <label htmlFor="referenceBook" className="block font-medium mb-1">
          Reference Book
        </label>
        <select
          id="referenceBook"
          name="referenceBook"
          value={form.referenceBook}
          onChange={handleChange}
          className="w-full border rounded p-2 border-gray-300"
        >
          <option value="">Select Reference Book</option>
          {booksList.map((book) => (
            <option key={book.id} value={book.name}>
              {book.name}
            </option>
          ))}
        </select>
        {errors.referenceBook && (
          <p className="text-red-600 text-sm mt-1">{errors.referenceBook}</p>
        )}
      </div>

      {/* Key Tags */}
      <TagInput
        tags={form.keyTags}
        onChange={(keyTags) => setForm((f) => ({ ...f, keyTags }))}
        placeholder="Write key Eg: Cough, Fever, Ayurvedic, Homeopathic"
      />
      {errors.keyTags && (
        <p className="text-red-500 text-sm">{errors.keyTags}</p>
      )}

      {/* Description */}
      <div>
        <label className="font-medium block mb-1">Description</label>
        <textarea
          name="description"
          placeholder="Write description of product here."
          className="w-full border rounded p-2"
          rows={2}
          value={form.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>

      {/* Key Benefits */}
      <div>
        <label className="font-medium block mb-1">Key Benefits</label>
        <textarea
          name="benefits"
          placeholder="key benefits of product Eg: Immune Boost."
          className="w-full border rounded p-2"
          rows={2}
          value={form.benefits}
          onChange={handleChange}
        />
        {errors.benefits && (
          <p className="text-red-500 text-sm">{errors.benefits}</p>
        )}
      </div>

      {/* How to use */}
      <div>
        <label className="font-medium block mb-1">How to use</label>
        <textarea
          name="howToUse"
          placeholder="Dosage info eg: 1 tab, 1 spoon at a time"
          className="w-full border rounded p-2"
          rows={2}
          value={form.howToUse}
          onChange={handleChange}
        />
        {errors.howToUse && (
          <p className="text-red-500 text-sm">{errors.howToUse}</p>
        )}
      </div>

      {/* Safety & Precaution */}
      <div>
        <label className="font-medium block mb-1">Safety & Precaution</label>
        <textarea
          name="safetyPrecaution"
          placeholder="Write Safety & precaution for product."
          className="w-full border rounded p-2"
          rows={2}
          value={form.safetyPrecaution}
          onChange={handleChange}
        />
        {errors.safetyPrecaution && (
          <p className="text-red-500 text-sm">{errors.safetyPrecaution}</p>
        )}
      </div>

      {/* Key Ingredients */}
      <div>
        <label className="font-medium block mb-1">Key Ingredients</label>
        <textarea
          name="ingredients"
          placeholder="Key Ingredients of product Eg: Amla, Tulsi."
          className="w-full border rounded p-2"
          rows={2}
          value={form.ingredients}
          onChange={handleChange}
        />
        {errors.ingredients && (
          <p className="text-red-500 text-sm">{errors.ingredients}</p>
        )}
      </div>

      {/* Other Information */}
      <div>
        <label className="font-medium block mb-1">Other Information</label>
        <textarea
          name="otherInfo"
          placeholder="Eg: If any adverse reactions occur, discontinue use and seek medical advice."
          className="w-full border rounded p-2"
          rows={2}
          value={form.otherInfo}
          onChange={handleChange}
        />
        {errors.otherInfo && (
          <p className="text-red-500 text-sm">{errors.otherInfo}</p>
        )}
      </div>

      {/* GST & Strength */}
      <div className="flex gap-4">
        <div className="w-1/2">
          <label htmlFor="gst" className="block font-medium mb-1">
            GST
          </label>
          <select
            id="gst"
            name="gst"
            value={form.gst}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">Select GST</option>
            <option value={0}>0%</option>
            <option value={5}>5%</option>
            <option value={12}>12%</option>
            <option value={18}>18%</option>
          </select>
        </div>
        {form.type === "tablet" && (
          <div className="w-1/2">
            <label htmlFor="strength" className="block font-medium mb-1">
              Strength
            </label>
            <input
              id="strength"
              name="strength"
              value={form.strength}
              onChange={handleChange}
              placeholder="Eg:500mg"
              className="w-full border rounded p-2"
            />
            {errors.strength && (
              <p className="text-red-500 text-sm">{errors.strength}</p>
            )}
          </div>
        )}
      </div>

      {/* Prices per portion of Size */}
      <div>
        <label className="font-medium block mb-1">
          Prices per portion of Size
        </label>
        <div className="space-y-2 ">
          {form.prices.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1/5 relative">
                <label className="text-sm">Product Size</label>
                <input
                  type="text"
                  placeholder="Eg: 100"
                  value={item.size}
                  onChange={(e) =>
                    handlePriceChange(index, "size", e.target.value)
                  }
                  className="border rounded p-1 w-full pr-10"
                />
                <span className="absolute right-3 top-7 text-gray-600 pointer-events-none select-none">
                  {form.type}
                </span>
                {errors[`size_${index}`] && (
                  <p className="text-red-500 text-sm ">
                    {errors[`size_${index}`]}
                  </p>
                )}
              </div>
              <div className="w-1/5 relative">
                <label className="text-sm">Actual Price</label>
                <span className="absolute left-2 top-7 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Actual Price "
                  value={item.actualPrice}
                  onChange={(e) =>
                    handlePriceChange(index, "actualPrice", e.target.value)
                  }
                  className="border rounded p-1 pl-6 w-full"
                />
                {errors[`actualPrice_${index}`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`actualPrice_${index}`]}
                  </p>
                )}
              </div>
              <div className="w-1/5">
                <label className="text-sm">Discount (%)</label>
                <input
                  type="number"
                  placeholder="Discount %"
                  value={item.discount}
                  onChange={(e) =>
                    handlePriceChange(index, "discount", e.target.value)
                  }
                  className="border rounded p-1 w-full"
                />
                {errors[`discount_${index}`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`discount_${index}`]}
                  </p>
                )}
              </div>
              <div className="w-1/5 relative">
                <label className="text-sm">Selling Price</label>
                <span className="absolute left-2 top-7 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Selling Price"
                  value={item.sellingPrice}
                  onChange={(e) =>
                    handlePriceChange(index, "sellingPrice", e.target.value)
                  }
                  className="border rounded p-1 pl-6 w-full"
                />
                {errors[`sellingPrice_${index}`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`sellingPrice_${index}`]}
                  </p>
                )}
              </div>
              <div className="w-1/5">
                <label className="text-sm">Quantity</label>
                <input
                  type="number"
                  placeholder="Eg:150"
                  value={item.quantity}
                  onChange={(e) =>
                    handlePriceChange(index, "quantity", e.target.value)
                  }
                  className="border rounded p-1 w-full"
                />
                {errors[`quantity_${index}`] && (
                  <p className="text-red-500 text-sm">
                    {errors[`quantity_${index}`]}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removePriceRow(index)}
                className="text-red-600 mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPriceRow}
            className="mt-2 text-blue-600"
          >
            + Add More Size
          </button>
        </div>
      </div>

      {/* Prescription Required checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="prescriptionRequired"
          name="prescriptionRequired"
          checked={form.prescriptionRequired}
          onChange={handleChange}
          className="w-5 h-5"
        />
        <label
          htmlFor="prescriptionRequired"
          className="select-none font-medium"
        >
          Prescription Required
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-green-600 text-white font-semibold px-6 py-3 rounded ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
        }`}
      >
        {loading
          ? "Submitting…"
          : `Submit ${
              form.type === "tablet"
                ? "Tablet"
                : form.type === "ml"
                ? "Syrup"
                : "Powder"
            }`}
      </button>
      {editProduct && (
        <button
          type="button"
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded"
          disabled={loading}
        >
          Delete Product
        </button>
      )}
    </form>
  );
};

export default MedicineForm;
