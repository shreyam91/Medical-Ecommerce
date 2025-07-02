import React from 'react';
import { FaStar, FaPhoneAlt, FaClock, FaUserMd } from 'react-icons/fa';
import { HiLocationMarker } from 'react-icons/hi';

export default function DoctorCard({ doctor, onSelect }) {
  return (
    <div
      onClick={() => onSelect(doctor)}
      className="bg-white shadow hover:shadow-md transition rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
    >
      {/* Circular Image */}
      <img
        src={doctor.image_url}
        alt={doctor.name}
        className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
      />

      {/* Details */}
      <div className="flex-1 w-full">
        <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
        {doctor.degree && (
          <div className="text-sm text-gray-500 mb-1">{doctor.degree}</div>
        )}

        <div className="flex items-center text-sm text-gray-600 mt-1">
          <HiLocationMarker className="mr-1 text-blue-500" />
          <span>
            {doctor.address}
            {doctor.city && `, ${doctor.city.trim()}`}
            {doctor.state && `, ${doctor.state.trim()}`}
            {doctor.pincode && `, ${doctor.pincode}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700">
          {/* <div className="flex items-center">
            <FaStar className="text-yellow-500 mr-1" />
            {doctor.rating}/5
          </div> */}
          <div className="flex items-center">
            <FaPhoneAlt className="text-green-500 mr-1" />
            {doctor.phone_number}
          </div>
          <div className="flex items-center">
            <FaClock className="text-purple-500 mr-1" />
            {doctor.start_time} - {doctor.end_time}
          </div>
          {doctor.specialization && (
            <div className="flex items-center">
              <FaUserMd className="text-indigo-500 mr-1" />
              {doctor.specialization}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
