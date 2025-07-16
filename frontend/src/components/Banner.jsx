import React, { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const bannerRef = useRef(null);

  const bannerWidth = 150;
  const visibleCount = 3;

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
    setCurrent((prev) => (prev + 1) % (banners.length - visibleCount + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + (banners.length - visibleCount + 1)) % (banners.length - visibleCount + 1));
  };

  useEffect(() => {
    if (banners.length > visibleCount) startAutoSlide();
    return () => stopAutoSlide();
  }, [banners.length]);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(nextSlide, 5000);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalRef.current);
  };

  // Swipe gesture support
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

  if (loading)
    return (
      <div className="h-[150px] flex items-center justify-center bg-gray-100">
        Loading banners...
      </div>
    );

  if (error)
    return (
      <div className="h-[150px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  if (!banners.length)
    return (
      <div className="h-[150px] flex items-center justify-center text-gray-400">
        No banners available
      </div>
    );

  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{ width: `${bannerWidth * visibleCount}px`, height: "150px" }}
      ref={bannerRef}
    >
      {/* Slides container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * bannerWidth}px)`,
        }}
      >
        {banners.map((banner) => (
          <img
            key={banner.id}
            src={banner.image_url}
            alt={banner.alt || "Banner"}
            className="flex-shrink-0 object-cover"
            style={{ width: `${bannerWidth}px`, height: "150px" }}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      {banners.length > visibleCount && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-70"
          >
            &#8592;
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-70"
          >
            &#8594;
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > visibleCount && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[...Array(banners.length - visibleCount + 1)].map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
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


export function BannerAd() {
  const backgroundImageUrl = 'https://source.unsplash.com/1600x900/?nature,water';

  return (
    <Link
      to="/explore"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Explore the beauty of nature with us"
    >
      <div
        className="relative w-full h-[20vh] md:h-[30vh] bg-cover bg-center mt-2 rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        role="banner"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            here we are showing our Ad
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl">
            Explore the beauty of nature with us
          </p>
        </div>
      </div>
    </Link>
  );
}


export function BannerEndOne() {
  const backgroundImageUrl = 'https://source.unsplash.com/1600x900/?nature,water';

  return (
    <Link
      to="/explore"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Explore the beauty of nature with us"
    >
      <div
        className="relative w-full h-[20vh] md:h-[30vh] bg-cover bg-center mt-2 rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        role="banner"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Here we show some pharmacy details
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl">
            Explore the beauty of nature with us
          </p>
        </div>
      </div>
    </Link>
  );
}



export function BannerEndTwo() {
  const backgroundImageUrl = 'https://source.unsplash.com/1600x900/?nature,water';

  return (
    <Link
      to="/explore"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Explore the beauty of nature with us"
    >
      <div
        className="relative w-full h-[20vh] md:h-[30vh] bg-cover bg-center mt-2 rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        role="banner"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Contact with us using Whatsapp
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl">
            Explore the beauty of nature with us
          </p>
        </div>
      </div>
    </Link>
  );
}
