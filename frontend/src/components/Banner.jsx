import React, { useEffect, useRef, useState } from "react";

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:3001/api/banner")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch banners");
        return res.json();
      })
      .then((data) => {
        setBanners(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length > 1) startAutoSlide();
    return () => stopAutoSlide();
    // eslint-disable-next-line
  }, [banners.length]);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalRef.current);
  };

  // Touch swipe
  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    let startX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (diff > 50) nextSlide();
      if (diff < -50) prevSlide();
    };

    el.addEventListener("touchstart", handleTouchStart);
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [banners.length]);

  if (loading) return <div className="h-[300px] md:h-[500px] flex items-center justify-center bg-gray-100">Loading banners...</div>;
  if (error) return <div className="h-[300px] md:h-[500px] flex items-center justify-center text-red-500">{error}</div>;
  if (!banners.length) return <div className="h-[300px] md:h-[500px] flex items-center justify-center text-gray-400">No banners available</div>;

  return (
    <div className="relative w-full overflow-hidden" ref={bannerRef}>
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <img
            key={banner.id}
            src={banner.image_url}
            alt={banner.alt || "Banner"}
            className="w-full flex-shrink-0 object-cover h-[300px] md:h-[500px]"
          />
        ))}
      </div>

      {/* Left Button */}
      {banners.length > 1 && (
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-3 rounded-full hover:bg-opacity-70"
        >
          &#8592;
        </button>
      )}

      {/* Right Button */}
      {banners.length > 1 && (
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-3 rounded-full hover:bg-opacity-70"
        >
          &#8594;
        </button>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                current === index ? "bg-white" : "bg-gray-400"
              }`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
