import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback data in case API fails
  const fallbackData = [
    { id: 1, title: "Diabetes", imageUrl: "/assets/diabetes.svg", slug: "diabetes" },
    { id: 2, title: "Skin Care", imageUrl: "/assets/skin.svg", slug: "skin-care" },
    { id: 3, title: "Hair Care", imageUrl: "/assets/hair.svg", slug: "hair-care" },
    { id: 4, title: "Joint, Bone & Muscle Care", imageUrl: "/assets/joint.svg", slug: "joint-care" },
    { id: 5, title: "Kidney Care", imageUrl: "/assets/Kidney.svg", slug: "kidney-care" },
    { id: 6, title: "Liver Care", imageUrl: "/assets/liver.svg", slug: "liver-care" },
    { id: 7, title: "Heart Care", imageUrl: "/assets/heart.svg", slug: "heart-care" },
    { id: 8, title: "Men Wellness", imageUrl: "/assets/men.svg", slug: "men-care" },
    { id: 9, title: "Women Wellness", imageUrl: "/assets/women.svg", slug: "women-care" },
    { id: 10, title: "Digestive Care", imageUrl: "/assets/digestive.svg", slug: "digestive-care" },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/category');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Map API data to include proper links
          const categoriesWithLinks = data.map(category => ({
            ...category,
            link: `/categories/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`
          }));
          setCategories(categoriesWithLinks);
        } else {
          setCategories(fallbackData.map(cat => ({ ...cat, link: `/categories/${cat.slug}` })));
        }
      } else {
        setCategories(fallbackData.map(cat => ({ ...cat, link: `/categories/${cat.slug}` })));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(fallbackData.map(cat => ({ ...cat, link: `/categories/${cat.slug}` })));
    } finally {
      setLoading(false);
    }
  };

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
            : categories.map(({ id, title, name, imageUrl, image_url, link }) => (
                <Link
                  to={link}
                  key={id}
                  className="flex items-center min-w-[200px] bg-white rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 hover:bg-gray-50 snap-start"
                >
                  <img
                    src={imageUrl || image_url || "/assets/default-category.svg"}
                    alt={title || name}
                    className="w-16 h-16 object-cover mr-4"
                    loading="lazy"
                  />
                  <p className="text-md font-medium text-gray-800">{title || name}</p>
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
          : categories.map(({ id, title, name, imageUrl, image_url, link }) => (
              <Link
                to={link}
                key={id}
                className="flex items-center bg-white rounded-md shadow-md p-4 hover:shadow-lg transition duration-300 hover:bg-gray-50"
              >
                <img
                  src={imageUrl || image_url || "/assets/default-category.svg"}
                  alt={title || name}
                  className="w-16 h-16 object-cover mr-4"
                  loading="lazy"
                />
                <p className="text-md font-semibold text-gray-800">{title || name}</p>
              </Link>
            ))}
      </div>
    </div>
  );
}
