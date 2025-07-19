import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogoCircles.css";

const data = [
  {
    id: 1,
    title: "Ayurvedic Medicine",
    imageUrl: "/assets/med.svg",
    bgcolor: "bg-red-100",
    link: "/ayurvedic",
  },
  {
    id: 2,
    title: "Homeopathic Medicine",
    imageUrl: "/assets/medicine.svg",
    bgcolor: "bg-yellow-100",
    link: "/homeopathic",
  },
  {
    id: 3,
    title: "Unani Medicine",
    imageUrl: "/assets/medi.svg",
    bgcolor: "bg-green-100",
    link: "/unani",
  },
  {
    id: 4,
    title: "Prescription",
    imageUrl: "/assets/prescription.svg",
    bgcolor: "bg-blue-100",
    link: "https://wa.me/9118325458", 
  },
  {
    id: 5,
    title: "Near by Doctor",
    imageUrl: "/assets/doctor.svg",
    bgcolor: "bg-purple-100",
    link: "/doctors",
  },
];



function CardItem({ id, title, imageUrl, bgcolor, link }) {
  
  const navigate = useNavigate();

  const handleClick = () => {
    if (id === 4) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer flex items-center ${bgcolor} rounded-md shadow-md px-4 py-3 hover:shadow-lg transition duration-300 min-w-[180px] snap-start`}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-12 h-12 object-contain mr-4"
        loading="lazy"
      />
      <p className="text-sm sm:text-base font-medium text-gray-800">{title}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-md shadow-md h-20 flex items-center px-4 min-w-[180px] snap-start">
      <div className="w-14 h-14 bg-gray-300 rounded-full mr-4" />
      <div className="h-4 w-24 bg-gray-300 rounded" />
    </div>
  );
}

export default function Type() {
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-4 max-w-7xl mx-auto">
      {/* Mobile: Horizontal Scroll */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 snap-x snap-mandatory scroll-pl-4">
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => <LoadingSkeleton key={idx} />)
            : data.map((item) => <CardItem key={item.id} {...item} />)}
        </div>
      </div>

      {/* Tablet/Desktop: Grid Layout */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-6 sm:mt-0">
        {loading
          ? Array.from({ length: 5 }).map((_, idx) => <LoadingSkeleton key={idx} />)
          : data.map((item) => <CardItem key={item.id} {...item} />)}
      </div>
    </div>
  );
}
