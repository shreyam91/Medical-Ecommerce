const API_URL = 'http://localhost:3001/api/reference_book';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function getReferenceBooks() {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch reference books');
  return res.json();
}

export async function getReferenceBook(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch reference book');
  return res.json();
}

export async function createReferenceBook(book) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error('Failed to create reference book');
  return res.json();
}

export async function updateReferenceBook(id, book) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error('Failed to update reference book');
  return res.json();
}

export async function deleteReferenceBook(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete reference book');
  return res.json();
} 