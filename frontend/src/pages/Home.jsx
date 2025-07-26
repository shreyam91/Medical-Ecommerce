import React, { useEffect, useRef, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import Brands, { PopularBrand } from "../components/Brands";
import Category from "../components/Category";
import BannerTop, { Banners } from "../components/Banner";
import Type from "../components/Type";
import BlogCard from "../components/BlogCard";
import { Link } from "react-router-dom";
import ProductCard, { ProductCardScrollable } from "../components/ProductCard";
import { StyleHome } from "../components/Style";
import SearchComponent from "../components/SearchComponent";

import leftImage from "/assets/left.svg";
import rightImage from "/assets/right.svg";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topBanners, setTopBanners] = useState([]);
  const [allBanners, setAllBanners] = useState([]);
  const [seasonalProducts, setSeasonalProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [peoplePreferredProducts, setPeoplePreferredProducts] = useState([]);
  const [maxDiscountProducts, setMaxDiscountProducts] = useState([]);

  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scrollInterval = setInterval(() => {
      if (!scrollContainer) return;
      scrollContainer.scrollBy({ left: 1, behavior: "smooth" });
      scrollAmount += 1;

      if (
        scrollAmount >=
        scrollContainer.scrollWidth - scrollContainer.clientWidth
      ) {
        scrollAmount = 0;
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 20); // Adjust speed (lower = faster)

    return () => clearInterval(scrollInterval);
  }, []);

  useEffect(() => {
    // Fetch blogs
    setLoading(true);
    setError(null);
    fetch("http://localhost:3001/api/blog")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch blogs");
        return res.json();
      })
      .then((data) => {
        setBlogs(data.slice(0, 3)); // Show only the latest 3 blogs
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch banners
    fetch("http://localhost:3001/api/banner")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch banners");
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter((b) => b.type === "top");
        setTopBanners(filtered);
        setAllBanners(data);
      })
      .catch(() => setTopBanners([]))
      .catch(() => setAllBanners([]));

    // Fetch seasonal products
    fetch("http://localhost:3001/api/product?seasonal_medicine=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSeasonalProducts(data);
        } else {
          setSeasonalProducts([]);
          console.error("API error (seasonal):", data.error || data);
        }
      })
      .catch((err) => {
        setSeasonalProducts([]);
        console.error("Network error (seasonal):", err);
      });

    // Fetch top products
    fetch("http://localhost:3001/api/product?top_products=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopProducts(data);
        } else {
          setTopProducts([]);
          console.error("API error (top):", data.error || data);
        }
      })
      .catch((err) => {
        setTopProducts([]);
        console.error("Network error (top):", err);
      });

    // Fetch people preferred products
    fetch("http://localhost:3001/api/product?people_preferred=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPeoplePreferredProducts(data);
        } else {
          setPeoplePreferredProducts([]);
          console.error("API error (people preferred):", data.error || data);
        }
      })
      .catch((err) => {
        setPeoplePreferredProducts([]);
        console.error("Network error (people preferred):", err);
      });

    // Fetch maximum discount products (>20% discount)
    fetch("http://localhost:3001/api/product?discount_percent=20")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMaxDiscountProducts(data);
        } else {
          setMaxDiscountProducts([]);
          console.error("API error (max discount):", data.error || data);
        }
      })
      .catch((err) => {
        setMaxDiscountProducts([]);
        console.error("Network error (max discount):", err);
      });
  }, []);

  const getBannerByType = (type) => allBanners.find((b) => b.type === type);

  return (
    <>
      <div className="hidden sm:relative sm:bg-gradient-to-tr sm:from-orange-50 sm:via-green-100 sm:to-blue-50 sm:overflow-hidden sm:flex sm:flex-col sm:items-center sm:rounded-2xl">

        {/* Images on Left & Right */}
        <img
          src={leftImage}
          alt="Left Decoration"
          className="absolute top-10 left-4 w-32 opacity-80"
        />
        <img
          src={rightImage}
          alt="Right Decoration"
          className="absolute top-10 right-4 w-32 opacity-80"
        />
        <SearchComponent />
      </div>
      <Type />
      {/* top banner for product display  */}
      <BannerTop banners={topBanners} />
      <Category />
      {/* banner for ad  */}
      {getBannerByType("ad") && <Banners banners={[getBannerByType("ad")]} />}
      {/* ----------  */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
            Seasonal Products
          </h1>
          <Link
            to="/products?seasonal_medicine=true"
            className="text-md font-semibold text-blue-600 cursor-pointer hover:underline"
          >
            View All
          </Link>
        </div>
        <div 
          className="flex overflow-x-auto gap-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Safari and Chrome */
            }
          `}</style>
          {seasonalProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{ textDecoration: "none" }}
            >
              {/* <div className="min-w-[200px]"> */}
              <ProductCardScrollable
                id={product.id}
                image={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : undefined
                }
                name={product.name}
                actualPrice={product.actual_price}
                sellingPrice={product.selling_price}
              />
              {/* </div> */}
            </Link>
          ))}
        </div>
      </div>
      {/* ---------------  */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
            Top Products
          </h1>
          <Link
            to="/products?top_products=true"
            className="text-md font-semibold text-blue-600 cursor-pointer hover:underline"
          >
            View All
          </Link>
        </div>
        <div 
          className="flex overflow-x-auto gap-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Safari and Chrome */
            }
          `}</style>
          {topProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{ textDecoration: "none" }}
            >
              <ProductCardScrollable
                key={product.id}
                id={product.id}
                image={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : undefined
                }
                name={product.name}
                actualPrice={product.actual_price}
                sellingPrice={product.selling_price}
              />
            </Link>
          ))}
        </div>
      </div>
      {/* ---------------  */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
            People Preferred Products
          </h1>
          <Link
            to="/products?people_preferred=true"
            className="text-md font-semibold text-blue-600 cursor-pointer hover:underline"
          >
            View All
          </Link>
        </div>
        <div 
          className="flex overflow-x-auto gap-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Safari and Chrome */
            }
          `}</style>
          {peoplePreferredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{ textDecoration: "none" }}
            >
              <ProductCardScrollable
                key={product.id}
                id={product.id}
                image={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : undefined
                }
                name={product.name}
                actualPrice={product.actual_price}
                sellingPrice={product.selling_price}
              />
            </Link>
          ))}
        </div>
      </div>
      {/* info banner  */}
      {getBannerByType("info") && (
        <Banners banners={[getBannerByType("info")]} />
      )}{" "}
      <Brands />
      {/* ----------  */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
            Maximum Discount Products
          </h1>
          <Link
            to="/products?discount_percent=20"
            className="text-md font-semibold text-blue-600 cursor-pointer hover:underline"
          >
            View All
          </Link>
        </div>
        <div 
          className="flex overflow-x-auto gap-4 scrollbar-hide"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* Internet Explorer 10+ */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Safari and Chrome */
            }
          `}</style>
          {maxDiscountProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{ textDecoration: "none" }}
            >
              <ProductCardScrollable
                key={product.id}
                id={product.id}
                image={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : undefined
                }
                name={product.name}
                actualPrice={product.actual_price}
                sellingPrice={product.selling_price}
              />
            </Link>
          ))}
        </div>
      </div>
      {/* ---------------  */}
      <PopularBrand />
      {/* Blog Section */}
      <div className="my-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black">
            Discover Ayurveda
          </h2>
          <Link
            to="/blog"
            className="text-md font-semibold text-blue-600 cursor-pointer hover:underline"
          >
            {" "}
            Read all
          </Link>
          {/* <h2 className="text-md font-semibold text-blue-600 cursor-pointer hover:underline">See all</h2> */}
        </div>

        {loading && <div className="text-gray-500">Loading blogs...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {!loading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                image={blog.image_url}
                title={blog.title}
                description={blog.short_description}
                tags={blog.tags || []}
                link={`/blog/${blog.id}`}
              />
            ))}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="text-gray-400">No blogs available.</div>
        )}
      </div>
      {/* Company banner  */}
      {getBannerByType("company") && (
        <Banners banners={[getBannerByType("company")]} />
      )}
      {/* whatsapp banner  */}
      {getBannerByType("whatsapp") && (
        <Banners banners={[getBannerByType("whatsapp")]} />
      )}
      <StyleHome />
    </>
  );
};

export default Home;
