const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = `${BASE_URL}/product`;

function getAuthHeaders(isJson = true) {
  const token = localStorage.getItem('token');
  return {
    ...(isJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function getProducts() {
  const res = await fetch(API_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch product #${id}: ${res.statusText}`);
  return res.json();
}

export async function createProduct(product) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create product failed: ${err}`);
  }
  return res.json();
}

export async function updateProduct(id, product) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update product #${id} failed: ${err}`);
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Delete product #${id} failed: ${res.statusText}`);
  return res.json();
}

// New helper to allow cleanup of orphaned images
export async function deleteImage(imageUrl) {
  const res = await fetch(`${BASE_URL}/upload/delete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error(`Failed to delete image: ${await res.text()}`);
  return res.json();
}
