const API_URL = 'http://localhost:3001/api/inventory';

export async function getInventories() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function getInventory(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch inventory item');
  return res.json();
}

export async function createInventory(item) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create inventory item');
  return res.json();
}

export async function updateInventory(id, item) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to update inventory item');
  return res.json();
}

export async function deleteInventory(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete inventory item');
  return res.json();
} 