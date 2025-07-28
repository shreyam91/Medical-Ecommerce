// import React, { useState } from "react";
// import dummyOrders from "../data/dummyOrders";
// import toast from "react-hot-toast";

// export default function ProfileForm() {
//   const [user, setUser] = useState({
//   addresses: [
//     {
//       fullName: "John Doe",
//       email: "john@example.com",
//       contact: "9876543210",
//       house_number: "123 Main St",
//       area: "Kurla",
//       landmark: "Apollo Hospital",
//       state: "Maharashtra",
//       city: "Mumbai",
//       pinCode: "400001",
//       country: "India",
//     },
//   ],
// });



//   const [isEditing, setIsEditing] = useState(false);

//   const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
//   const validatePinCode = (pin) => /^\d{6}$/.test(pin);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUser((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEdit = () => setIsEditing(true);

//   const handleSave = (e) => {
//     e.preventDefault();

//     if (!user.fullName || user.fullName.trim().length < 3) {
//       toast.error("Full name must be at least 3 characters.");
//       return;
//     }
//     if (!user.email || !validateEmail(user.email)) {
//       toast.error("Please enter a valid email address.");
//       return;
//     }
//     if (!user.contact || !validatePhone(user.contact)) {
//       toast.error("Please enter a valid 10-digit Indian contact number.");
//       return;
//     }
//     if (!user.house_number || user.house_number.trim().length < 5) {
//       toast.error("House number must be at least 5 characters.");
//       return;
//     }
//     if (!user.area || user.area.trim().length < 2) {
//       toast.error("Area must be at least 2 characters.");
//       return;
//     }
//     if (!user.landmark || user.landmark.trim().length < 2) {
//       toast.error("Landmark must be at least 2 characters.");
//       return;
//     }
//     if (!user.state || user.state.trim().length < 2) {
//       toast.error("State must be at least 2 characters.");
//       return;
//     }
//     if (!user.city || user.city.trim().length < 2) {
//       toast.error("City must be at least 2 characters.");
//       return;
//     }
//     if (!user.pinCode || !validatePinCode(user.pinCode)) {
//       toast.error("Please enter a valid 6-digit pin code.");
//       return;
//     }
//     if (!user.country || user.country.trim().length < 2) {
//       toast.error("Country must be at least 2 characters.");
//       return;
//     }

//     setIsEditing(false);
//     toast.success("Profile updated!");
//   };

//   return (
//     <div className="min-h-screen  py-10 px-4">
//       <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 bg-white shadow-md rounded-md">
//         <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6">User Profile</h2>
//         <form onSubmit={handleSave} noValidate>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Full Name */}
//             <div className="col-span-1 md:col-span-2">
//               <label htmlFor="fullName" className="block text-gray-700 mb-1 font-medium">
//                 Full Name
//               </label>
//               <input
//                 id="fullName"
//                 name="fullName"
//                 type="text"
//                 value={user.fullName}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={user.email}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* Contact Number */}
//             <div>
//               <label htmlFor="contact" className="block text-gray-700 mb-1 font-medium">
//                 Phone Number
//               </label>
//               <input
//                 id="contact"
//                 name="contact"
//                 type="tel"
//                 value={user.contact}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 maxLength={10}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* House Number */}
//             <div>
//               <label htmlFor="house_number" className="block text-gray-700 mb-1 font-medium">
//                 House Number
//               </label>
//               <input
//                 id="house_number"
//                 name="house_number"
//                 type="text"
//                 value={user.house_number}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* Area */}
//             <div>
//               <label htmlFor="area" className="block text-gray-700 mb-1 font-medium">
//                 Area
//               </label>
//               <input
//                 id="area"
//                 name="area"
//                 type="text"
//                 value={user.area}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* Landmark */}
//             <div>
//               <label htmlFor="landmark" className="block text-gray-700 mb-1 font-medium">
//                 Landmark
//               </label>
//               <input
//                 id="landmark"
//                 name="landmark"
//                 type="text"
//                 value={user.landmark}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* State */}
//             <div>
//               <label htmlFor="state" className="block text-gray-700 mb-1 font-medium">
//                 State
//               </label>
//               <input
//                 id="state"
//                 name="state"
//                 type="text"
//                 value={user.state}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* City */}
//             <div>
//               <label htmlFor="city" className="block text-gray-700 mb-1 font-medium">
//                 City
//               </label>
//               <input
//                 id="city"
//                 name="city"
//                 type="text"
//                 value={user.city}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* Pin Code */}
//             <div>
//               <label htmlFor="pinCode" className="block text-gray-700 mb-1 font-medium">
//                 Pin Code
//               </label>
//               <input
//                 id="pinCode"
//                 name="pinCode"
//                 type="text"
//                 value={user.pinCode}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 maxLength={6}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>

//             {/* Country */}
//             <div>
//               <label htmlFor="country" className="block text-gray-700 mb-1 font-medium">
//                 Country
//               </label>
//               <input
//                 id="country"
//                 name="country"
//                 type="text"
//                 value={user.country}
//                 onChange={handleChange}
//                 readOnly={!isEditing}
//                 className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//                   isEditing ? "border-blue-500 focus:ring-blue-300" : "border-gray-300"
//                 }`}
//                 required
//               />
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
//             {!isEditing && (
//               <button
//                 type="button"
//                 onClick={handleEdit}
//                 className="bg-orange-600 text-white px-5 py-2 rounded hover:bg-orange-700"
//               >
//                 Edit
//               </button>
//             )}
//             {isEditing && (
//               <button
//                 type="submit"
//                 className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
//               >
//                 Save
//               </button>
//             )}
//           </div>
//         </form>

//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ProfileForm() {
  const [user, setUser] = useState({
    addresses: [
      {
        fullName: "John Doe",
        email: "john@example.com",
        contact: "9876543210",
        house_number: "123 Main St",
        area: "Kurla",
        landmark: "Apollo Hospital",
        state: "Maharashtra",
        city: "Mumbai",
        pinCode: "400001",
        country: "India",
        isEditing: false,
        open: true,
      },
    ],
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
  const validatePinCode = (pin) => /^\d{6}$/.test(pin);

  const updateAddress = (index, updates) => {
    const updated = [...user.addresses];
    updated[index] = { ...updated[index], ...updates };
    setUser({ addresses: updated });
  };

  const handleFieldChange = (index, e) => {
    const { name, value } = e.target;
    updateAddress(index, { [name]: value });
  };

  const toggleOpen = (index) => {
    updateAddress(index, { open: !user.addresses[index].open });
  };

  const toggleEdit = (index) => {
    updateAddress(index, { isEditing: true });
  };

  const saveAddress = (index) => {
    const addr = user.addresses[index];
    if (!addr.fullName.trim() || addr.fullName.trim().length < 3) {
      toast.error("Name must be at least 3 characters.");
      return false;
    }
    if (!validateEmail(addr.email)) { toast.error("Invalid email."); return false; }
    if (!validatePhone(addr.contact)) { toast.error("Invalid mobile number."); return false; }
    if (!addr.house_number.trim() || addr.house_number.trim().length < 5) {
      toast.error("House number too short."); return false;
    }
    if (!addr.area.trim() || addr.area.trim().length < 2) {
      toast.error("Area too short."); return false;
    }
    if (!addr.landmark.trim() || addr.landmark.trim().length < 2) {
      toast.error("Landmark too short."); return false;
    }
    if (!addr.state.trim() || addr.state.trim().length < 2) {
      toast.error("State too short."); return false;
    }
    if (!addr.city.trim() || addr.city.trim().length < 2) {
      toast.error("City too short."); return false;
    }
    if (!validatePinCode(addr.pinCode)) { toast.error("Invalid pin code."); return false; }
    if (!addr.country.trim() || addr.country.trim().length < 2) {
      toast.error("Country too short."); return false;
    }
    updateAddress(index, { isEditing: false });
    toast.success("Address saved!");
    return true;
  };

  const handleRemove = (index) => {
    if (user.addresses.length === 1) {
      toast.error("At least one address is required.");
      return;
    }
    const updated = [...user.addresses];
    updated.splice(index, 1);
    setUser({ addresses: updated });
  };

  const handleAdd = () => {
    setUser({
      addresses: [
        ...user.addresses,
        {
          fullName: "",
          email: "",
          contact: "",
          house_number: "",
          area: "",
          landmark: "",
          state: "",
          city: "",
          pinCode: "",
          country: "",
          isEditing: true,
          open: true,
        },
      ],
    });
  };

  const inputFields = [
    { label: "Name", name: "fullName", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Mobile", name: "contact", type: "tel", maxLength: 10 },
    { label: "House No.", name: "house_number", type: "text" },
    { label: "Area", name: "area", type: "text" },
    { label: "Landmark", name: "landmark", type: "text" },
    { label: "State", name: "state", type: "text" },
    { label: "City", name: "city", type: "text" },
    { label: "Pin Code", name: "pinCode", type: "text", maxLength: 6 },
    { label: "Country", name: "country", type: "text" },
  ];

  return (
    <div className="min-h-screen sm:p-6 ">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">User Profile</h2>

        {user.addresses.map((addr, idx) => (
          <div
            key={idx}
            className="mb-4 border rounded-md overflow-hidden"
          >
            {/* Accordion Header */}
            <div
              className="flex justify-between items-center bg-gray-100 p-3 cursor-pointer"
              onClick={() => toggleOpen(idx)}
            >
              <h3 className="font-medium">
                Address {idx + 1}: {addr.fullName || "(no name)"}
              </h3>
              <span>{addr.open ? "▲" : "▼"}</span>
            </div>

            {/* Panel */}
            {addr.open && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inputFields.map(({ label, name, type, maxLength }) => (
                    <div key={name}>
                      <label className="block mb-1 font-medium text-gray-700">
                        {label}
                      </label>
                      <input
                        name={name}
                        type={type}
                        maxLength={maxLength}
                        value={addr[name]}
                        onChange={(e) => handleFieldChange(idx, e)}
                        readOnly={!addr.isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          addr.isEditing
                            ? "border-blue-500 focus:ring-blue-300"
                            : "border-gray-300 bg-gray-100"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  {addr.isEditing ? (
                    <button
                      type="button"
                      onClick={() => saveAddress(idx)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleEdit(idx)}
                      className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                    >
                      Edit
                    </button>
                  )}
                  {user.addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="pt-2">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Address
          </button>
        </div>
      </div>
    </div>
  );
}

