import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Sample order data
const initialOrders = [
  {
    id: 'ORD-20250721-ABC123',
    date: '2025-07-24',
    status: 'Delivered',
    total: '₹89.99',
   items: [
  { name: 'T-shirt', price: '₹40.00' },
  { name: 'Sneakers', price: '₹49.99' },
]
,
  },
  {
    id: 'ORD-20250715-XYZ789',
    date: '2025-07-15',
    status: 'Shipped',
    total: '₹49.50',
   items: [
  { name: 'T-shirt', price: '₹40.00' },
  { name: 'Sneakers', price: '₹49.99' },
]

  },
  {
    id: 'ORD-20250710-QWE456',
    date: '2025-07-10',
    status: 'Shipped',
    total: '₹120.00',
    items: [
  { name: 'T-shirt', price: '₹40.00' },
  { name: 'Sneakers', price: '₹49.99' },
]

  },
  {
    id: 'ORD-20250710-QWE467',
    date: '2025-07-10',
    status: 'Returned',
    total: '₹120.00',
    items: [
  { name: 'T-shirt', price: '₹40.00' },
  { name: 'Sneakers', price: '₹49.99' },
]

  },
  {
    id: 'ORD-20250710-QWE434',
    date: '2025-07-10',
    status: 'Cancelled',
    total: '₹120.00',
   items: [
  { name: 'T-shirt', price: '₹40.00' },
  { name: 'Sneakers', price: '₹49.99' },
]

  },
];

const statuses = ['All', 'Delivered', 'Shipped', 'Processing', 'Replacement', 'Cancelled'];

const isReturnEligible = (deliveryDateStr) => {
  const deliveryDate = new Date(deliveryDateStr);
  const returnDeadline = new Date(deliveryDate);
  returnDeadline.setDate(returnDeadline.getDate() + 2);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today <= returnDeadline;
};

const OrderHistory = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  const [replacementIssues, setReplacementIssues] = useState([]);
  const [replacementReason, setReplacementReason] = useState('');
  const [replacementImage, setReplacementImage] = useState(null);

  const filteredOrders =
    statusFilter === 'All'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const openModal = (order, action) => {
    setModalOrder(order);
    setModalAction(action);
    setReplacementIssues([]);
    setReplacementReason('');
    setReplacementImage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalOrder(null);
    setModalAction(null);
  };

  const confirmAction = () => {
    if (modalAction === 'replacement') {
      if (replacementIssues.length === 0 || !replacementReason.trim() || !replacementImage) {
        toast.error('Please fill in all fields and upload an image.');
        return;
      }
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === modalOrder.id
          ? { ...order, status: modalAction === 'cancel' ? 'Cancelled' : 'Replacement' }
          : order
      )
    );

    toast.success(
      `${modalAction === 'cancel' ? 'Cancel' : 'Replacement'} request submitted.`
    );

    setModalOpen(false);
    setModalOrder(null);
    setModalAction(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📦 Order History</h1>

      {/* Filter Dropdown */}
      <div className="flex flex-wrap justify-end max-w-4xl mx-auto mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-md shadow-sm"
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md overflow-x-auto">
        <table className="min-w-full table-auto text-left text-sm sm:text-base">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const returnEligible = isReturnEligible(order.date);
              return (
                <React.Fragment key={order.id}>
                  <tr
                    onClick={() => toggleExpand(order.id)}
                    className="cursor-pointer border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 text-blue-600 font-mono">{order.id}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'Returned'
                            ? 'bg-orange-100 text-orange-700'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'Replacement'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.total}</td>
                    <td className="py-3 px-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                      {order.status === 'Processing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(order, 'cancel');
                          }}
                          className="text-red-600 font-bold bg-amber-200 px-4 py-1 rounded"
                        >
                          Cancel
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (returnEligible) {
                              openModal(order, 'replacement');
                            }
                          }}
                          disabled={!returnEligible}
                          className={`${
                            returnEligible
                              ? 'text-purple-600 font-bold bg-gray-200 px-4 py-1 rounded'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Replacement
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <h3 className="font-semibold mb-2 text-gray-700">Items:</h3>
                        <ul className="text-gray-600 text-sm space-y-1">
  {order.items.map((item, index) => (
    <li key={index} className="flex justify-between">
      <span>{item.name}</span>
      <span className="text-gray-500">{item.price}</span>
    </li>
  ))}
</ul>

                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && modalOrder && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 sm:mx-0 p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">
              {modalAction === 'cancel' ? 'Cancel Order' : 'Replacement Request'}
            </h2>

            <p className="mb-4">
              {modalAction === 'cancel' ? (
                <>
                  Are you sure you want to{' '}
                  <span className="text-red-600 font-semibold">cancel</span> order{' '}
                  <span className="font-mono text-blue-600">{modalOrder.id}</span>?
                </>
              ) : (
                <>
                  Please select the issue(s) and provide a reason for requesting a{' '}
                  <span className="text-purple-600 font-semibold">replacement</span> of order{' '}
                  <span className="font-mono text-blue-600">{modalOrder.id}</span>.
                </>
              )}
            </p>

            {modalAction === 'replacement' && (
              <>
                <div className="mb-4">
                  <label className="block font-semibold mb-2">Select Issue(s):</label>
                  {['Wrong product delivered', 'Damaged product delivered', 'Expired product delivered'].map(
                    (issue) => (
                      <label key={issue} className="block text-sm mb-1">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={replacementIssues.includes(issue)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setReplacementIssues((prev) => [...prev, issue]);
                            } else {
                              setReplacementIssues((prev) =>
                                prev.filter((item) => item !== issue)
                              );
                            }
                          }}
                        />
                        {issue}
                      </label>
                    )
                  )}
                </div>

                <div className="mb-4">
                  <label className="block font-semibold mb-2">Reason:</label>
                  <textarea
                    value={replacementReason}
                    onChange={(e) => setReplacementReason(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Please describe the issue..."
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block font-semibold mb-2">Upload Image (required):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReplacementImage(e.target.files[0])}
                  />
                  {replacementImage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {replacementImage.name}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                No, Go Back
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded text-white ${
                  modalAction === 'cancel'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                Yes, {modalAction === 'cancel' ? 'Cancel' : 'Submit Replacement'}
              </button>
            </div>
          </div>
        </div>
        
      )}
      <p className='font-medium text-xl'>Customer Support: 1234567898</p>
    </div>
  );
};

export default OrderHistory;
