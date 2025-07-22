import { useEffect, useState } from 'react';
import { getProducts } from '../lib/productApi';
import { getCustomers } from '../lib/customerApi';
import { getPayments } from '../lib/paymentApi';
import { createOrder } from '../lib/orderApi';

export default function CreateOrderForm({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    houseNumber: '',
    area: '',
    landmark: '',
    state: '',
    city: '',
    pincode: '',
    country: '',
  });

  const [notes, setNotes] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [productLines, setProductLines] = useState([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    Promise.all([
      getCustomers().catch(() => []),
      getProducts().catch(() => []),
      getPayments().catch(() => []),
    ]).then(([c, p, pay]) => {
      setCustomers(c);
      setProducts(p);
      setPayments(pay);
    });
  }, []);

  useEffect(() => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (customer) {
      setCustomerInfo({
        fullName: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        houseNumber: customer.houseNumber || '',
        area: customer.area || '',
        landmark: customer.landmark || '',
        state: customer.state || '',
        city: customer.city || '',
        pincode: customer.pincode || '',
        country: customer.country || '',
      });
    }
  }, [selectedCustomerId, customers]);

  const handleProductChange = (index, field, value) => {
    const updated = [...productLines];
    updated[index][field] = field === 'quantity' ? parseInt(value) : value;
    setProductLines(updated);
  };

  const addProductLine = () => {
    setProductLines([...productLines, { productId: '', quantity: 1 }]);
  };

  const removeProductLine = (index) => {
    const updated = [...productLines];
    updated.splice(index, 1);
    setProductLines(updated);
  };

  const calculateTotalPrice = () => {
    return productLines.reduce((sum, line) => {
      const product = products.find(p => p.id === line.productId);
      return sum + (product ? product.price * (line.quantity || 1) : 0);
    }, 0);
  };

  const getItemSummary = () => {
    return productLines
      .map(line => {
        const product = products.find(p => p.id === line.productId);
        return product ? `${product.name} x ${line.quantity}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullAddress = `${customerInfo.houseNumber}, ${customerInfo.area}, ${customerInfo.landmark}, ${customerInfo.city}, ${customerInfo.state}, ${customerInfo.pincode}, ${customerInfo.country}`;

    const totalPrice = calculateTotalPrice();
    const order = {
      customer_id: selectedCustomerId,
      items: getItemSummary(),
      price: totalPrice,
      address: fullAddress,
      payment_id: paymentId,
      notes,
      status: 'Ordered',
      date: new Date().toISOString(),
    };

    try {
      const created = await createOrder(order);
      onCreated(created);
      onClose();
    } catch (err) {
      alert('Failed to create order');
    }
  };

  const handleCustomerInputChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl max-h-full overflow-auto relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Create New Order</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selector */}
          <label className="block">
            Select Existing Customer:
            <select
              className="border w-full mt-1 px-2 py-1 rounded"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          {/* Customer Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Full Name" className="border px-3 py-2 rounded" value={customerInfo.fullName} onChange={e => handleCustomerInputChange('fullName', e.target.value)} required />
            <input placeholder="Email" type="email" className="border px-3 py-2 rounded" value={customerInfo.email} onChange={e => handleCustomerInputChange('email', e.target.value)} required />
            <input placeholder="Phone Number" className="border px-3 py-2 rounded" value={customerInfo.phone} onChange={e => handleCustomerInputChange('phone', e.target.value)} required />
            <input placeholder="House Number" className="border px-3 py-2 rounded" value={customerInfo.houseNumber} onChange={e => handleCustomerInputChange('houseNumber', e.target.value)} required />
            <input placeholder="Area" className="border px-3 py-2 rounded" value={customerInfo.area} onChange={e => handleCustomerInputChange('area', e.target.value)} required />
            <input placeholder="Landmark" className="border px-3 py-2 rounded" value={customerInfo.landmark} onChange={e => handleCustomerInputChange('landmark', e.target.value)} />
            <input placeholder="City" className="border px-3 py-2 rounded" value={customerInfo.city} onChange={e => handleCustomerInputChange('city', e.target.value)} required />
            <input placeholder="State" className="border px-3 py-2 rounded" value={customerInfo.state} onChange={e => handleCustomerInputChange('state', e.target.value)} required />
            <input placeholder="Pincode" className="border px-3 py-2 rounded" value={customerInfo.pincode} onChange={e => handleCustomerInputChange('pincode', e.target.value)} required />
            <input placeholder="Country" className="border px-3 py-2 rounded" value={customerInfo.country} onChange={e => handleCustomerInputChange('country', e.target.value)} required />
          </div>

          {/* Product Lines */}
          <div>
            <label className="block mb-2 font-semibold">Products:</label>
            {productLines.map((line, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                <select
                  required
                  className="border px-2 py-1 rounded flex-1"
                  value={line.productId}
                  onChange={e => handleProductChange(index, 'productId', e.target.value)}
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="border w-20 px-2 py-1 rounded"
                  value={line.quantity}
                  onChange={e => handleProductChange(index, 'quantity', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeProductLine(index)}
                  className="text-red-600 hover:underline"
                  disabled={productLines.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProductLine}
              className="mt-1 text-blue-600 hover:underline text-sm"
            >
              + Add another product
            </button>
          </div>

          {/* Payment Method */}
          <label className="block">
            Payment Method:
            <select
              required
              className="border w-full mt-1 px-2 py-1 rounded"
              value={paymentId}
              onChange={e => setPaymentId(e.target.value)}
            >
              <option value="">-- Select Payment --</option>
              {payments.map(p => (
                <option key={p.id} value={p.id}>{p.method}</option>
              ))}
            </select>
          </label>

          {/* Notes */}
          <label className="block">
            Notes:
            <textarea
              className="border w-full mt-1 px-2 py-1 rounded"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </label>

          {/* Total */}
          <div className="text-right font-semibold text-lg">
            Total: ₹{calculateTotalPrice().toFixed(2)}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Order
          </button>
        </form>
      </div>
    </div>
  );
}
