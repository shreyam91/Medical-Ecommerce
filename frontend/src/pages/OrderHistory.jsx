import React, { useState } from 'react';

// Sample order data
const initialOrders = [
  {
    id: 'ORD-20250721-ABC123',
    date: '2025-07-24',
    status: 'Delivered',
    total: '₹89.99',
    items: ['T-shirt', 'Sneakers'],
  },
  {
    id: 'ORD-20250715-XYZ789',
    date: '2025-07-15',
    status: 'Shipped',
    total: '₹49.50',
    items: ['Hoodie'],
  },
  {
    id: 'ORD-20250710-QWE456',
    date: '2025-07-10',
    status: 'Processing',
    total: '₹120.00',
    items: ['Backpack', 'Sunglasses'],
  },
  {
    id: 'ORD-20250710-QWE467',
    date: '2025-07-10',
    status: 'Returned',
    total: '₹120.00',
    items: ['Backpack', 'Sunglasses'],
  },
  {
    id: 'ORD-20250710-QWE434',
    date: '2025-07-10',
    status: 'Cancelled',
    total: '₹120.00',
    items: ['Backpack', 'Sunglasses'],
  },
];

// Filter options
const statuses = ['All', 'Delivered', 'Shipped', 'Processing', 'Returned', 'Cancelled'];

// Return eligibility: within 2 days of delivery
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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'cancel' or 'return'

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
    setModalOpen(true);
  };

  const confirmAction = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === modalOrder.id
          ? { ...order, status: modalAction === 'cancel' ? 'Cancelled' : 'Returned' }
          : order
      )
    );

    alert(
      `${modalAction === 'cancel' ? 'Cancel' : 'Return'} request for ${
        modalOrder.id
      } submitted. Refund will be processed within 7 days.`
    );

    setModalOpen(false);
    setModalOrder(null);
    setModalAction(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalOrder(null);
    setModalAction(null);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📦 Order History</h1>

      {/* Filter Dropdown */}
      <div className="flex justify-end max-w-4xl mx-auto mb-4">
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
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md overflow-hidden">
        <table className="w-full table-auto text-left">
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
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.total}</td>
                    <td className="py-3 px-4 space-x-2">
                      {order.status === 'Processing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(order, 'cancel');
                          }}
                          className="text-red-600 font-bold bg-amber-200 px-4 rounded"
                        >
                          Cancel
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (returnEligible) {
                                openModal(order, 'return');
                              }
                            }}
                            disabled={!returnEligible}
                            className={`${
                              returnEligible
                                ? 'text-purple-600  font-bold bg-gray-200 px-4 rounded'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Return
                          </button>
                          {!returnEligible && (
                            <div className="text-xs text-red-500 mt-1">Return window expired</div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <h3 className="font-semibold mb-2 text-gray-700">Items:</h3>
                        <ul className="list-disc list-inside text-gray-600">
                          {order.items.map((item, index) => (
                            <li key={index}>{item}</li>
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

      {/* Confirmation Modal */}
      {modalOpen && modalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {modalAction === 'cancel' ? 'Cancel Order' : 'Return Order'}
            </h2>
            <p className="mb-4">
              Are you sure you want to{' '}
              <span className="font-semibold text-red-600">
                {modalAction === 'cancel' ? 'cancel' : 'return'}
              </span>{' '}
              order <span className="font-mono text-blue-600">{modalOrder.id}</span>?
            </p>

            <p className="mb-6 text-sm text-gray-600">
              {modalAction === 'cancel'
                ? 'Refund will be initiated or refunded within 7 days after cancellation.'
                : 'Refund will be initiated or refunded within 7 days after receiving the order.'}
            </p>

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
                Yes, {modalAction === 'cancel' ? 'Cancel' : 'Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
