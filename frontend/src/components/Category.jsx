import React, { useRef, useEffect, useState } from "react";
import "./LogoCircles.css"; // optional: hides scrollbar

const data = [
  { id: 1, title: "Diabetes", imageUrl: "https://source.unsplash.com/300x300/?mountain" },
  { id: 2, title: "Stomach Care", imageUrl: "https://source.unsplash.com/300x300/?forest" },
  { id: 3, title: "Derma Care", imageUrl: "https://source.unsplash.com/300x300/?beach" },
  { id: 4, title: "Eye Care", imageUrl: "https://source.unsplash.com/300x300/?city" },
  { id: 5, title: "Joint, Bone & Muscle Care", imageUrl: "https://source.unsplash.com/300x300/?mountain" },
  { id: 6, title: "Kidney Care", imageUrl: "https://source.unsplash.com/300x300/?river" },
  { id: 7, title: "Liver Care", imageUrl: "https://source.unsplash.com/300x300/?lake" },
  { id: 8, title: "Heart Care", imageUrl: "https://source.unsplash.com/300x300/?valley" },
];

export default function Category() {
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading delay for skeletons
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // 1.5s
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll with pause on hover
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        if (isHovered) return;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: 300, behavior: "smooth" });
        }
      }, 4000);
    };

    startAutoScroll();
    return () => clearInterval(autoScrollRef.current);
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-green-700">
        Shop by Health Concern
      </h1>

      {/* Scrollable Categories */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-10"
        style={{ scrollSnapType: "x mandatory" }}
        aria-label="Carousel of health categories"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-40 sm:w-44 animate-pulse"
                style={{ scrollSnapAlign: "center" }}
              >
                <div className="w-full h-44 bg-gray-200 rounded-md shadow" />
                <div className="h-4 w-24 bg-gray-200 mt-2 mx-auto rounded" />
              </div>
            ))
          : data.map(({ id, title, imageUrl }) => (
              <div
                key={id}
                className="flex-shrink-0 w-40 sm:w-44"
                style={{ scrollSnapAlign: "center" }}
                title={title}
                role="img"
                aria-label={`Category: ${title}`}
              >
                <div className="w-full h-44 bg-gray-200 overflow-hidden rounded-md shadow">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-center text-md font-medium">{title}</p>
              </div>
            ))}
      </div>
    </div>
  );
}
