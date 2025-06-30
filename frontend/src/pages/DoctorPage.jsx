import React, { useState } from 'react';
import InfiniteDoctorList from '../components/InfiniteDoctorList';
import SearchBar from '../components/SearchBar';

export default function DoctorPage({ city }) {
  // Default to Karachi if city is not provided
  const selectedCity = city || "Jaipur";
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const doctors = generateDoctors(); // Replace with actual API call

  const filtered = doctors
    .filter(doc => doc.city === selectedCity)
    .filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        Find Doctor's in {selectedCity}
      </h1>
      {/* <div className="flex justify-center mb-6">
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} />
      </div> */}
      <InfiniteDoctorList doctors={filtered} onSelect={setSelectedDoc} />
    </div>
  );
}

// Temporary doctor generator
function generateDoctors() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Dr. Test ${i + 1}`,
    image: "https://via.placeholder.com/150",
    address: `Clinic ${i + 1}, ${i % 2 ? "Jaipur" : "Udaipur"}`,
    city: i % 2 ? "Jaipur" : "Udaipur",
    mobile: `+92 300 000000${i}`,
    timing: "Mon-Fri: 9am - 5pm",
    specialization: "Cardiologist",
    lat: 24.8607 + i * 0.01,
    lng: 67.0011 + i * 0.01,
  }));
}
