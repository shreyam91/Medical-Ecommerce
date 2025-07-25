import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LogoCircles.css";

const data = [
  {
    id: 1,
    title: "Ayurvedic Medicine",
    imageUrl: "/assets/med.svg",
    bgcolor: "bg-gradient-to-tr from-orange-100 via-green-50 to-blue-300",
    link: "/ayurvedic",
  },
  {
    id: 2,
    title: "Homeopathic Medicine",
    imageUrl: "/assets/medicine.svg",
    bgcolor: "bg-gradient-to-tr from-yellow-200 via-green-50 to-green-400",
    link: "/homeopathic",
  },
  {
    id: 3,
    title: "Unani Medicine",
    imageUrl: "/assets/medi.svg",
    bgcolor: "bg-gradient-to-tr from-green-50 via-violet-100 to-orange-50",
    link: "/unani",
  },
  {
    id: 4,
    title: "Prescription",
    imageUrl: "/assets/prescription.svg",
    bgcolor: "bg-gradient-to-tr from-green-50 via-orange-100 to-blue-500",
    link: "https://wa.me/1234567898", 
  },
  {
    id: 5,
    title: "Near by Doctor",
    imageUrl: "/assets/doctor.svg",
    bgcolor: "bg-gradient-to-tr from-red-50 via-green-100 to-orange-200",
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
  const scrollRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || loading) return;

    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        if (isHovered) return;

        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 200, behavior: "smooth" });
        }
      }, 4000);
    };

    startAutoScroll();
    return () => clearInterval(autoScrollInterval.current);
  }, [loading, isHovered]);

  // Touch swipe support
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let startX = 0;
    let isDown = false;

    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDown = true;
    };

    const onTouchMove = (e) => {
      if (!isDown) return;
      const diff = startX - e.touches[0].clientX;
      el.scrollLeft += diff;
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = () => {
      isDown = false;
    };

    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove", onTouchMove);
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className="py-4 max-w-7xl mx-auto">
      {/* Mobile: Horizontal Scroll */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="sm:hidden flex gap-4 overflow-x-auto px-1 no-scrollbar scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
        aria-label="Horizontal scrollable medicine types"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, idx) => <LoadingSkeleton key={idx} />)
          : data.map((item) => <CardItem key={item.id} {...item} />)}
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-6 sm:mt-0">
        {loading
          ? Array.from({ length: 5 }).map((_, idx) => <LoadingSkeleton key={idx} />)
          : data.map((item) => <CardItem key={item.id} {...item} />)}
      </div>
    </div>
  );
}
