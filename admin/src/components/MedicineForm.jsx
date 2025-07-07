import React, { useState, useEffect, useRef } from "react";
import ImageUploader from "./ImageUploader";
import toast, { Toaster } from "react-hot-toast";
import { createProduct, updateProduct } from "../lib/productApi";
import { getBrands } from "../lib/brandApi";
import { getBooks } from "../lib/bookApi";
import TagInput from "./TagInput";

const MedicineForm = ({ editProduct, setEditProduct, category }) => {
  const typeOptions = [
    { value: "tablet", label: "Tablet" },
    { value: "ml", label: "Syrup (ml)" },
    { value: "gm", label: "Powder (gm)" },
  ];

  const initial = {
    type: "tablet",
    name: "",
    brands: [],
    brand_id: "",
    referenceBook: "",
    keyTags: [],
    ingredients: "",
    howToUse: "",
    safetyPrecaution: "",
    description: "",
    otherInfo: "",
    gst: "",
    prescriptionRequired: false,
    strength: "",
    packSize: "",
    prices: [
      {
        unit: "",
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
  const imageRef = useRef();
  const [brandsList, setBrandsList] = useState([]);
  const [booksList, setBooksList] = useState([]);

  useEffect(() => {
    getBrands()
      .then(setBrandsList)
      .catch(() => setBrandsList([]));
    getBooks()
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
        brand_id: editProduct.brand_id || "",
        referenceBook: editProduct.reference_books?.[0] || "",
        keyTags: editProduct.key?.split(",")?.map((s) => s.trim()) || [],
        ingredients: editProduct.key_ingredients || "",
        howToUse: editProduct.how_to_use || "",
        safetyPrecaution: editProduct.safety_precaution || "",
        description: editProduct.description || "",
        otherInfo: editProduct.other_info || "",
        gst: editProduct.gst || "",
        prescriptionRequired: editProduct.prescription_required || false,
        strength: editProduct.strength || "",
        packSize: editProduct.pack_size || "",
        prices: [
          {
            unit:
              editProduct.unit ||
              (editProduct.medicine_type === "Syrup"
                ? "ml"
                : editProduct.medicine_type === "Powder"
                ? "gm"
                : "tablet"),
            quantity: editProduct.total_quantity || "",
            actualPrice: editProduct.actual_price || "",
            discount: editProduct.discount_percent || "",
            sellingPrice: editProduct.selling_price || "",
          },
        ],
        selectedImages: editProduct.images || [],
      });
    }
  }, [editProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceChange = (index, field, value) => {
    const updatedPrices = [...form.prices];
    updatedPrices[index][field] = value;

    const actual = parseFloat(updatedPrices[index].actualPrice) || 0;
    const discount = parseFloat(updatedPrices[index].discount) || 0;

    if (!isNaN(actual) && !isNaN(discount)) {
      const selling = actual - (actual * discount) / 100;
      updatedPrices[index].sellingPrice = selling.toFixed(2);
    }

    setForm((prev) => ({
      ...prev,
      prices: updatedPrices,
    }));
  };

  const addPriceRow = () => {
    setForm((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        {
          unit: form.type,
          quantity: "",
          actualPrice: "",
          discount: "",
          sellingPrice: "",
        },
      ],
    }));
  };

  const removePriceRow = (index) => {
    const updated = [...form.prices];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, prices: updated }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.brand_id) newErrors.brand_id = "Brand is required.";
    if (!form.referenceBook)
      newErrors.referenceBook = "Reference book is required.";
    if (form.keyTags.length === 0)
      newErrors.keyTags = "At least one key is required.";
    if (!form.description.trim())
      newErrors.description = "Description is required.";
    if (!form.ingredients.trim())
      newErrors.ingredients = "Ingredients are required.";
    if (!form.gst || ![0, 5, 12, 18].includes(Number(form.gst)))
      newErrors.gst = "Valid GST required.";

    if (form.type === "tablet" && (!form.strength || !form.packSize)) {
      newErrors.strength = "Strength is required for tablets.";
      newErrors.packSize = "Pack size is required for tablets.";
    }

    if ((form.type === "ml" || form.type === "gm") && !form.packSize) {
      newErrors.packSize = "Pack size is required.";
    }

    if (form.prices.length === 0) {
      newErrors.prices = "At least one price entry is required.";
    }

    form.prices.forEach((price, i) => {
      if (!price.unit) newErrors[`unit_${i}`] = "Unit required.";
      if (!price.quantity) newErrors[`quantity_${i}`] = "Quantity required.";
      if (!price.actualPrice || parseFloat(price.actualPrice) <= 0)
        newErrors[`actualPrice_${i}`] = "Valid actual price.";
      if (price.discount === "" || parseFloat(price.discount) < 0)
        newErrors[`discount_${i}`] = "Valid discount.";
      if (!price.sellingPrice || parseFloat(price.sellingPrice) <= 0)
        newErrors[`sellingPrice_${i}`] = "Selling price required.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let uploadedImageUrls = [];

    if (
      form.selectedImages.length > 0 &&
      typeof form.selectedImages[0] !== "string"
    ) {
      toast.loading("Uploading images...");
      for (const file of form.selectedImages) {
        const data = new FormData();
        data.append("image", file);
        try {
          const res = await fetch("http://localhost:3001/api/upload", {
            method: "POST",
            body: data,
          });
          const json = await res.json();
          uploadedImageUrls.push(json.imageUrl);
        } catch {
          toast.dismiss();
          toast.error("Image upload failed.");
          return;
        }
      }
      toast.dismiss();
      toast.success("Images uploaded");
    } else {
      uploadedImageUrls = form.selectedImages;
    }

    const payload = {
      name: form.name,
      category: category || "Ayurvedic",
      medicine_type:
        form.type === "ml" ? "Syrup" : form.type === "gm" ? "Powder" : "Tablet",
      brand_id: form.brand_id ? parseInt(form.brand_id, 10) : null,
      reference_books: form.referenceBook ? [form.referenceBook] : [],
      key: form.keyTags.join(", "),
      key_ingredients: form.ingredients,
      how_to_use: form.howToUse,
      safety_precaution: form.safetyPrecaution,
      description: form.description,
      other_info: form.otherInfo,
      strength: form.strength,
      pack_size: form.packSize,
      gst: parseInt(form.gst, 10),
      prescription_required: form.prescriptionRequired,
      actual_price: parseFloat(form.prices[0].actualPrice),
      selling_price: parseFloat(form.prices[0].sellingPrice),
      discount_percent: parseFloat(form.prices[0].discount),
      total_quantity: parseInt(form.prices[0].quantity, 10),
      images: uploadedImageUrls,
    };

    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        toast.success("Product updated!");
      } else {
        await createProduct(payload);
        toast.success("Product created!");
      }

      setForm(initial);
      imageRef.current?.clearImages();
      setErrors({});
      setEditProduct(null);
    } catch {
      toast.error("Failed to submit.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Toaster />
      <div className="flex gap-2">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={
              form.type === opt.value
                ? "active-btn w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded"
                : "w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded"
            }
            onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <ImageUploader
        ref={imageRef}
        onFilesSelected={(files) =>
          setForm((f) => ({ ...f, selectedImages: files }))
        }
        deferUpload
      />

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

      <div>
        <label htmlFor="brand_id" className="block font-medium mb-1">
          Brand <span className="text-red-600">*</span>
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

      <TagInput
        tags={form.keyTags}
        onChange={(keyTags) => setForm((f) => ({ ...f, keyTags }))}
        placeholder="Write key tag Eg: Cough, Cold, Fever, Ayurvedic, Homeopathic"
      />

      {(form.type === "ml" || form.type === "gm") && (
        <input
          name="packSize"
          value={form.packSize}
          onChange={handleChange}
          placeholder={`Pack Size e.g., 100${form.type}`}
          className="w-full border rounded p-2"
        />
      )}

      <div>
        <label className="font-medium block mb-1">Other Information</label>
        <textarea
          name="otherInfo"
          placeholder="Other Information"
          className="w-full border rounded p-2"
          rows={2}
          value={form.otherInfo}
          onChange={handleChange}
        />
        {errors.lifestyleAdvice && (
          <p className="text-red-500 text-sm">{errors.lifestyleAdvice}</p>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">How to use</label>
        <textarea
          name="howToUse"
          placeholder="How to use"
          className="w-full border rounded p-2"
          rows={2}
          value={form.howToUse}
          onChange={handleChange}
        />
        {errors.lifestyleAdvice && (
          <p className="text-red-500 text-sm">{errors.lifestyleAdvice}</p>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">Safety & Precaution</label>
        <textarea
          name="safetyPrecaution"
          placeholder="Safety & Precaution"
          className="w-full border rounded p-2"
          rows={2}
          value={form.safetyPrecaution}
          onChange={handleChange}
        />
        {errors.lifestyleAdvice && (
          <p className="text-red-500 text-sm">{errors.lifestyleAdvice}</p>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">Ingredients</label>
        <textarea
          name="ingredients"
          placeholder="Ingredients"
          className="w-full border rounded p-2"
          rows={2}
          value={form.ingredients}
          onChange={handleChange}
        />
        {errors.lifestyleAdvice && (
          <p className="text-red-500 text-sm">{errors.lifestyleAdvice}</p>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">Description</label>
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded p-2"
          rows={2}
          value={form.description}
          onChange={handleChange}
        />
        {errors.lifestyleAdvice && (
          <p className="text-red-500 text-sm">{errors.lifestyleAdvice}</p>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">Other Information</label>
        <textarea
          name="otherInfo"
          placeholder="Other Information"
          className="w-full border rounded p-2"
          rows={2}
          value={form.otherInfo}
          onChange={handleChange}
        />
        {errors.lifestyleAdvice && (
          <p className="text-red-500 text-sm">{errors.lifestyleAdvice}</p>
        )}
      </div>

      <div className="flex gap-4">
        {/* GST Dropdown */}
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

        {/* Strength Input (only shown for tablets) */}
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
              placeholder="e.g., 500mg"
              className="w-full border rounded p-2"
            />
          </div>
        )}
      </div>

      <div>
        <label className="font-medium block mb-1">Prices per Unit</label>
        <div className="space-y-2 ">
          {form.prices.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1/5 relative">
                <label className="text-sm">Size</label>
                <input
                  type="text"
                  placeholder={`e.g. 100`}
                  value={item.unit}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  className="border rounded p-1 pl-6 w-full"
                />
                <span className="absolute right-2 top-9 text-gray-600">
                  {form.type}
                </span>
                {errors[`unit_${index}`] && (
                  <p className="text-red-500 text-sm ">
                    {errors[`unit_${index}`]}
                  </p>
                )}
              </div>

              <div className="w-1/5 relative">
                <label className="text-sm">Actual Price</label>
                <span className="absolute left-2 top-9 text-gray-500">₹</span>
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
                <span className="absolute left-2 top-9 text-gray-500">₹</span>
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
                  placeholder="Quantity eg:150"
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
            + Add Unit
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
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded"
      >
        Submit{" "}
        {form.type === "tablet"
          ? "Tablet"
          : form.type === "ml"
          ? "Syrup"
          : "Powder"}
      </button>
    </form>
  );
};

export default MedicineForm;
