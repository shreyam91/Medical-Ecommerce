const API_URL = 'http://localhost:3001/api/order_item';

export async function getOrderItems() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch order items');
  return res.json();
}

export async function getOrderItem(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order item');
  return res.json();
}

export async function createOrderItem(item) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create order item');
  return res.json();
}

export async function updateOrderItem(id, item) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to update order item');
  return res.json();
}

export async function deleteOrderItem(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete order item');
  return res.json();
} 