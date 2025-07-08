const API_URL = 'http://localhost:3001/api/payment';

export async function getPayments() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

export async function getPayment(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch payment');
  return res.json();
}

export async function createPayment(payment) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
}

export async function updatePayment(id, payment) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  if (!res.ok) throw new Error('Failed to update payment');
  return res.json();
}

export async function deletePayment(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete payment');
  return res.json();
} 