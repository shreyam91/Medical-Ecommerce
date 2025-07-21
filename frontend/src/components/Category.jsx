import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const data = [
  { id: 1, title: "Diabetes", imageUrl: "/assets/diabetes.svg", link: "/categories/diabetes" },
  { id: 2, title: "Skin Care", imageUrl: "/assets/skin.svg", link: "/categories/skin-care" },
  { id: 3, title: "Hair Care", imageUrl: "/assets/hair.svg", link: "/categories/hair-care" },
  { id: 4, title: "Joint, Bone & Muscle Care", imageUrl: "/assets/joint.svg", link: "/categories/joint-care" },
  { id: 5, title: "Kidney Care", imageUrl: "/assets/Kidney.svg", link: "/categories/kidney-care" },
  { id: 6, title: "Liver Care", imageUrl: "/assets/liver.svg", link: "/categories/liver-care" },
  { id: 7, title: "Heart Care", imageUrl: "/assets/heart.svg", link: "/categories/heart-care" },
  { id: 8, title: "Men Wellness", imageUrl: "/assets/men.svg", link: "/categories/men-care" },
  { id: 9, title: "Women Wellness", imageUrl: "/assets/women.svg", link: "/categories/women-care" },
  { id: 10, title: "Digestive Care", imageUrl: "/assets/digestive.svg", link: "/categories/digestive-care" },
];

export default function Category() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black">
        Shop by Health Concern
      </h1>

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
            : data.map(({ id, title, imageUrl, link }) => (
                <Link
                  to={link}
                  key={id}
                  className="flex items-center min-w-[200px] bg-white rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 hover:bg-gray-50 snap-start"
                >
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-16 h-16 object-cover mr-4"
                    loading="lazy"
                  />
                  <p className="text-md font-medium text-gray-800">{title}</p>
                </Link>
              ))}
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-gray-200 rounded-md shadow-md h-20 flex items-center px-4"
              >
                <div className="w-16 h-16 bg-gray-300 rounded-full mr-4" />
                <div className="h-4 w-24 bg-gray-300 rounded" />
              </div>
            ))
          : data.map(({ id, title, imageUrl, link }) => (
              <Link
                to={link}
                key={id}
                className="flex items-center bg-white rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 hover:bg-gray-50"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-16 h-16 object-cover mr-4"
                  loading="lazy"
                />
                <p className="text-md font-semibold text-gray-800">{title}</p>
              </Link>
            ))}
      </div>
    </div>
  );
}
