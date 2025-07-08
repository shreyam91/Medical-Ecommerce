const API_URL = 'http://localhost:3001/api/brand';

export async function getBrands() {
  const res = await fetch(API_URL);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create brand');
  return res.json();
}

export async function deleteBrand(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete brand');
  return res.json();
} 