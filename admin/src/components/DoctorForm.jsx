import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from 'browser-image-compression';

function DoctorForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    degree: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    startTime: "",
    endTime: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setImagePreview(URL.createObjectURL(file));

  const toastId = toast.loading("Uploading image...");

  let compressedFile = file;
  try {
    compressedFile = await imageCompression(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    });
  } catch (err) {
    toast.error('Image compression failed. Uploading original.');
  }

  const formData = new FormData();
  formData.append("image", compressedFile);

  try {
    const res = await fetch("http://localhost:3001/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Image upload failed");

    const data = await res.json();
    setUploadedImageUrl(data.imageUrl);

    // ✅ Update toast to success
    toast.success("Image uploaded successfully!", { id: toastId });
  } catch (error) {
    // console.error("Image upload error:", error);

    // ❌ Update toast to error
    toast.error("Image upload failed.", { id: toastId });
    setImagePreview(null);
  }
};



  const validateForm = () => {
    const {
      name,
      phone,
      degree,
      address,
      city,
      state,
      pincode,
      startTime,
      endTime,
    } = formData;

    if (
      !name ||
      !phone ||
      !degree ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !startTime ||
      !endTime
    ) {
      toast.error("Please fill in all required fields.");
      return false;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Pincode must be 6 digits.");
      return false;
    }

    if (startTime >= endTime) {
      toast.error("Start time must be earlier than end time.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setSubmittedData({
    ...formData,
    image: uploadedImageUrl,
  });

  toast.success("Form submitted successfully!");

  // Reset form
  setFormData({
    name: "",
    phone: "",
    degree: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    startTime: "",
    endTime: "",
  });
  setImagePreview(null);
  setUploadedImageUrl(null);
};



  return (
    <div className="min-h-screen p-8 ">
      <Toaster position="top-right" />
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Doctor Form</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Degree*</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Address Fields */}
          <div>
            <label className="block mb-1 font-medium">Address*</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">State*</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Pincode*</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Timing Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Time*</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Time*</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Submitted Data Preview */}
      {submittedData && (
        <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow flex items-center space-x-4">
          {submittedData.image && (
            <img
              src={submittedData.image}
              alt="Doctor"
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="text-xl font-bold">{submittedData.name}</h3>
            <p className="text-gray-600">{submittedData.degree}</p>
            <p className="text-gray-500">
              {submittedData.address}, {submittedData.city},{" "}
              {submittedData.state} - {submittedData.pincode}
            </p>
            <p className="text-gray-500">📞 {submittedData.phone}</p>
            <p className="text-gray-500">
              ⏰ {submittedData.startTime} - {submittedData.endTime}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorForm;
