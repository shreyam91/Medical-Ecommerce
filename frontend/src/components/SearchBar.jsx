import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-80">
      <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search doctors..."
        className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
