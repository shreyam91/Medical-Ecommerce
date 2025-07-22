export default function CreateCustomerForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    houseNumber: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCustomer = await createCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        houseNumber: form.houseNumber,
        area: form.area,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country,
        active: true,
        createdAt: new Date().toISOString(),
      });
      onCreated(newCustomer);
      onClose();
    } catch (err) {
      alert("Failed to create customer.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded p-6 w-full max-w-xl max-h-screen overflow-y-auto relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="border p-2 rounded col-span-2" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="border p-2 rounded col-span-2" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required className="border p-2 rounded col-span-2" />
          <input name="houseNumber" value={form.houseNumber} onChange={handleChange} placeholder="House Number" required className="border p-2 rounded" />
          <input name="area" value={form.area} onChange={handleChange} placeholder="Area" required className="border p-2 rounded" />
          <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Landmark" className="border p-2 rounded col-span-2" />
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" required className="border p-2 rounded" />
          <input name="state" value={form.state} onChange={handleChange} placeholder="State" required className="border p-2 rounded" />
          <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" required className="border p-2 rounded" />
          <input name="country" value={form.country} onChange={handleChange} placeholder="Country" required className="border p-2 rounded" />
          <div className="col-span-2 text-right mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
