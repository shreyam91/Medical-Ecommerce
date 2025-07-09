import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../lib/doctorApi";

function DoctorForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    degree: "",
    specialization: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    startTime: "",
    endTime: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [editDoctor, setEditDoctor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDoctors()
      .then(setDoctorList)
      .catch(() => setDoctorList([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Preview image but do NOT upload here
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const validateForm = () => {
    const {
      name,
      phone,
      degree,
      specialization,
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
      !specialization ||
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

  const uploadImage = async (file) => {
    const toastId = toast.loading("Uploading image...");
    let compressedFile = file;
    try {
      compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
    } catch (err) {
      toast.error("Image compression failed. Uploading original.");
    }

    const formDataImg = new FormData();
    formDataImg.append("image", compressedFile);

    try {
      const res = await fetch("http://localhost:3001/api/upload", {
        method: "POST",
        body: formDataImg,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      toast.success("Image uploaded successfully!", { id: toastId });
      return data.imageUrl;
    } catch (error) {
      toast.error("Image upload failed.", { id: toastId });
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare doctor data without image_url
      const doctorPayload = {
        name: formData.name,
        phone_number: formData.phone,
        degree: formData.degree,
        specialization: formData.specialization,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        start_time: formData.startTime,
        end_time: formData.endTime,
        image_url: editDoctor ? editDoctor.image_url : "", // fallback if no image update
      };

      let doctorRes;

      if (editDoctor) {
        // Update doctor first without changing image_url
        doctorRes = await updateDoctor(editDoctor.id, doctorPayload);
      } else {
        // Create new doctor without image_url
        doctorRes = await createDoctor(doctorPayload);
      }

      // If user selected an image, upload it now
      let imageUrl = editDoctor ? editDoctor.image_url : "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);

        // Update doctor with imageUrl
        const updatedDoctor = { ...doctorRes, image_url: imageUrl };
        doctorRes = await updateDoctor(doctorRes.id, updatedDoctor);
      }

      // Update doctor list in state
      setDoctorList((prevList) => {
        if (editDoctor) {
          return prevList.map((d) => (d.id === doctorRes.id ? doctorRes : d));
        } else {
          return [doctorRes, ...prevList];
        }
      });

      // Reset form and states
      setFormData({
        name: "",
        phone: "",
        degree: "",
        specialization: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        startTime: "",
        endTime: "",
      });
      setImagePreview(null);
      setImageFile(null);
      setEditDoctor(null);

      toast.success(editDoctor ? "Doctor updated successfully!" : "Doctor created successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save doctor.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditDoctor(doctor);
    setFormData({
      name: doctor.name,
      phone: doctor.phone_number,
      degree: doctor.degree,
      specialization: doctor.specialization,
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      pincode: doctor.pincode,
      startTime: doctor.start_time,
      endTime: doctor.end_time,
    });
    setImagePreview(doctor.image_url || null);
    setImageFile(null); // Clear file because we only preview URL now
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id);
      setDoctorList((prevList) => prevList.filter((d) => d.id !== id));
      toast.success("Doctor removed.");
    } catch {
      toast.error("Failed to remove doctor.");
    }
  };

  return (
    <div className="min-h-screen p-8">
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
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded border"
              />
            )}
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

          <div>
            <label className="block mb-1 font-medium">Specialization*</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

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
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? (editDoctor ? "Updating..." : "Creating...") : (editDoctor ? "Update Doctor" : "Add Doctor")}
          </button>
          {editDoctor && (
            <button
              type="button"
              onClick={() => {
                setEditDoctor(null);
                setFormData({
                  name: "",
                  phone: "",
                  degree: "",
                  specialization: "",
                  address: "",
                  city: "",
                  state: "",
                  pincode: "",
                  startTime: "",
                  endTime: "",
                });
                setImagePreview(null);
                setImageFile(null);
              }}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        {/* Doctor List */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Doctor List</h3>
          <ul>
            {doctorList.map((doctor) => (
              <li key={doctor.id} className="border p-4 rounded mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {doctor.image_url && (
                    <img
                      src={doctor.image_url}
                      alt={doctor.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DoctorForm;
