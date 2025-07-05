import { useRef, useState, useEffect } from "react";
import "./LogoCircles.css";
import { useNavigate } from "react-router-dom";

const Brands = () => {
  const scrollRef = useRef(null);
  const autoScrollInterval = useRef(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:3001/api/brand")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch brands");
        return res.json();
      })
      .then((data) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Auto-scroll with pause on hover
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        if (isHovered || !scrollRef.current) return;
        const el = scrollRef.current;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 250, behavior: "smooth" });
        }
      }, 4000);
    };

    startAutoScroll();
    return () => clearInterval(autoScrollInterval.current);
  }, [isHovered]);

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
    <div className="relative px-4 md:px-10 py-8 max-w-full md:max-w-7xl mx-auto">
<h1 className="text-xl text-center sm:text-2xl md:text-3xl font-bold mb-6 text-green-700">
        Shop by Brands
      </h1>

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex gap-4 sm:gap-6 overflow-x-auto px-1 sm:px-4 no-scrollbar scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
        aria-label="Carousel of Ayurvedic Brand Logos"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse"
              style={{ scrollSnapAlign: "center" }}
            />
          ))
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : brands.length ? (
          brands.map((brand) => (
            <div
              key={brand.id}
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white border shadow flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{ scrollSnapAlign: "center" }}
              role="img"
              aria-label={`Brand logo of ${brand.name}`}
              title={brand.name}
              onClick={() => navigate(`/brand/${brand.id}`)}
            >
              <img
                src={brand.image_url}
                alt={brand.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center">No brands available</div>
        )}
      </div>
    </div>
  );
};

export default Brands;
