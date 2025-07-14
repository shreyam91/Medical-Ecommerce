import React, { useEffect, useState } from "react";

// Static data can be memoized to avoid recreation on each render
const data = [
  { id: 1, title: "Ayurvedic Medicine", imageUrl: "/assets/med.svg", bgcolor: "bg-red-100",link: "/categories/diabetes" },
  { id: 2, title: "Homeopathic Medicine", imageUrl: "/assets/medicine.svg", bgcolor: "bg-yellow-100",link: "/categories/derma-care" },
  { id: 3, title: "Unani Medicine", imageUrl: "/assets/medi.svg", bgcolor: "bg-green-100", link: "/categories/eye-care" },
  { id: 4, title: "Prescription", imageUrl: "/assets/prescription.svg", bgcolor: "bg-blue-100", link: "/categories/joint-care" },
  { id: 5, title: "Near by Doctor", imageUrl: "/assets/doctor.svg", bgcolor: "bg-purple-100", link: "/doctors" },
];

export default function Type() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-4 md:px-10 py-8 max-w-7xl mx-auto">

      {/* Mobile Horizontal Scroll View */}
      <div className="block sm:hidden overflow-x-auto">
        <div className="flex space-x-4 snap-x snap-mandatory scroll-pl-4">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse bg-gray-200 rounded-md shadow-md min-w-[200px] h-20 flex items-center px-4 snap-start"
                >
                  <div className="w-16 h-16 bg-gray-300 rounded-full mr-4" />
                  <div className="h-4 w-24 bg-gray-300 rounded" />
                </div>
              ))
            : data.map(({ id, title, imageUrl, link, bgcolor }) => (
                <a
                  href={link}
                  key={id}
                  className={`flex items-center ${bgcolor} rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 hover:bg-opacity-80 snap-start`}
                >
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-16 h-16 object-cover mr-4"
                    loading="lazy"
                  />
                  <p className="text-md font-medium text-gray-800">{title}</p>
                </a>
              ))}
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse rounded-md shadow-md h-16 flex items-center px-4"
              >
                <div className="w-14 h-14 bg-gray-300 rounded-full mr-4" />
                <div className="h-4 w-20 bg-gray-300 rounded" />
              </div>
            ))
          : data.map(({ id, title, imageUrl, link, bgcolor }) => (
              <a
                href={link}
                key={id}
                className={`flex items-center ${bgcolor} rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 hover:bg-opacity-80 snap-start`}
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-14 h-14 object-cover mr-4"
                  loading="lazy"
                />
                <p className="text-md font-medium text-gray-800">{title}</p>
              </a>
            ))}
      </div>
    </div>
  );
}
