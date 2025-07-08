const API_URL = 'http://localhost:3001/api/reference_book';

export async function getReferenceBooks() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch reference books');
  return res.json();
}

export async function getReferenceBook(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch reference book');
  return res.json();
}

export async function createReferenceBook(book) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error('Failed to create reference book');
  return res.json();
}

export async function updateReferenceBook(id, book) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error('Failed to update reference book');
  return res.json();
}

export async function deleteReferenceBook(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete reference book');
  return res.json();
} 