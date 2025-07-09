const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = `${BASE_URL}/brand`;
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function getBrands() {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

export async function createBrand(brand) {
  const payload = { ...brand };
  if (payload.image_url) {
    payload.logo_url = payload.image_url;
    delete payload.image_url;
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create brand');
  return res.json();
}

export async function updateBrand(id, brand) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(brand),
  });
  if (!res.ok) throw new Error('Failed to update brand');
  return res.json();
}

export async function deleteBrand(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete brand');
  return res.json();
}

// New helper for deleting uploaded image
export async function deleteUploadedImage(imageUrl) {
  // Assumes your backend supports deleting by imageUrl via POST request
  const res = await fetch('http://localhost:3001/api/upload/delete', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageUrl }),
  });
  if (!res.ok) throw new Error('Failed to delete uploaded image');
  return res.json();
}
