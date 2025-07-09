const API_URL = 'http://localhost:3001/api/brand';

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
  // Ensure the payload uses logo_url
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

export async function deleteBrand(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete brand');
  return res.json();
} 