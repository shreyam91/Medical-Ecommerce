import React, { useState, useEffect } from 'react';
import InfiniteDoctorList from '../components/InfiniteDoctorList';
import SearchBar from '../components/SearchBar';

export default function DoctorPage({ city }) {
  // Default to Jaipur if city is not provided
  const selectedCity = city || "Jaipur";
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:3001/api/doctor')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch doctors');
        return res.json();
      })
      .then(data => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = doctors
    .filter(doc => doc.city && doc.city.trim().toLowerCase() === selectedCity.trim().toLowerCase())
    .filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        Find Doctor's in {selectedCity}
      </h1>
      <div className="flex justify-center mb-6">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading && <div className="text-center text-gray-500">Loading doctors...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && (
        <InfiniteDoctorList doctors={filtered} onSelect={setSelectedDoc} />
      )}
    </div>
  );
}
