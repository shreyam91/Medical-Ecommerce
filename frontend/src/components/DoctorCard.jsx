import React from "react";
import { FaPhoneAlt, FaClock, FaUserMd } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";

function formatTimeWithSeconds(timeStr) {
  // Parse time string to Date
  const date = new Date(`1970-01-01T${timeStr}`);
  if (!isNaN(date)) {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // fallback to original string
  return timeStr;
}

export default function DoctorCard({ doctor, onSelect }) {
  const fullAddress = `${doctor.address}${
    doctor.city ? `, ${doctor.city.trim()}` : ""
  }${doctor.state ? `, ${doctor.state.trim()}` : ""}${
    doctor.pincode ? `, ${doctor.pincode}` : ""
  }`;

  return (
    <div
      onClick={() => onSelect(doctor)}
      className="bg-white shadow hover:shadow-md transition rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer"
    >
      {/* Image */}
      <img
        src={doctor.image_url}
        alt={doctor.name}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
      />

      {/* Details */}
      <div className="flex-1 w-full text-center sm:text-left min-w-0">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
          {doctor.name}
        </h3>

        {doctor.degree && (
          <div className="text-sm text-gray-500 mb-1 break-words">
            {doctor.degree}
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600 mt-1 gap-1 min-w-0">
          <HiLocationMarker className="text-blue-500 flex-shrink-0" />
          <span className="line-clamp-2" title={fullAddress}>
            {fullAddress}
          </span>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-700">
          <div className="flex items-center whitespace-nowrap leading-none">
            <FaPhoneAlt className="text-green-500 mr-1 inline-block align-middle" />
            {doctor.phone_number}
          </div>
          <div className="flex items-center whitespace-nowrap leading-none">
            <FaClock className="text-purple-500 mr-1 inline-block align-middle" />
            {formatTimeWithSeconds(doctor.start_time)} -{" "}
            {formatTimeWithSeconds(doctor.end_time)}
          </div>
          {doctor.specialization && (
            <div className="flex items-center whitespace-nowrap leading-none">
              <FaUserMd className="text-indigo-500 mr-1 inline-block align-middle" />
              {doctor.specialization}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
