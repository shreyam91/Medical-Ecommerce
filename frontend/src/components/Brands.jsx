import { useRef, useState, useEffect } from "react";
import "./LogoCircles.css"; 

const Brands = () => {
  const scrollRef = useRef(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const scrollAmount = 250;
  let autoScrollInterval = useRef(null);

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

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft === 0);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Auto-scroll setup
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        if (!scrollRef.current) return;
        const el = scrollRef.current;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" }); // loop back
        } else {
          scroll("right");
        }
      }, 4000); // auto-scroll interval in ms
    };

    startAutoScroll();

    return () => clearInterval(autoScrollInterval.current);
  }, []);

  // Track scroll position
  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

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

  if (loading)
    return (
      <div className="p-10 max-w-6xl mx-auto text-center">
        Loading brands...
      </div>
    );
  if (error)
    return (
      <div className="p-10 max-w-6xl mx-auto text-center text-red-500">
        {error}
      </div>
    );
  if (!brands.length)
    return (
      <div className="p-10 max-w-6xl mx-auto text-center text-gray-400">
        No brands available
      </div>
    );

  return (
    <div className="relative px-4 md:px-10 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700 text-center md:text-left">
        Shop by Brands
      </h1>

      {/* Left Button */}
      <div className="hidden lg:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-20">
        <button
          onClick={() => scroll("left")}
          disabled={atStart}
          className={`bg-green-600 text-white rounded-full p-3 shadow hover:bg-green-700 transition-opacity ${
            atStart ? "opacity-30 cursor-not-allowed" : ""
          }`}
          aria-label="Scroll Left"
        >
          &#8592;
        </button>
      </div>

      {/* Logos Scroll Wrapper */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto px-2 sm:px-10 no-scrollbar scroll-smooth"
        style={{ scrollSnapType: "x mandatory" }}
        aria-label="Carousel of Ayurvedic Brand Logos"
      >
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white border shadow flex items-center justify-center cursor-pointer hover:scale-105 sm:hover:scale-110 transition-transform duration-300"
            style={{ scrollSnapAlign: "center" }}
            role="img"
            aria-label={`Brand logo of ${brand.name}`}
            title={brand.name}
          >
            <img
              src={brand.image_url}
              alt={brand.name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Right Button */}
      <div className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
        <button
          onClick={() => scroll("right")}
          disabled={atEnd}
          className={`bg-green-600 text-white rounded-full p-3 shadow hover:bg-green-700 transition-opacity ${
            atEnd ? "opacity-30 cursor-not-allowed" : ""
          }`}
          aria-label="Scroll Right"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
};

export default Brands;
