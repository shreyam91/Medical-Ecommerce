import React, { useEffect, useState } from "react";

import Breadcrumb from "../components/Breadcrumb";
import Brands, { PopularBrand } from "../components/Brands";
import Category from "../components/Category";
import BannerTop, { Banners } from "../components/Banner";
import DealsOfTheDay from "../components/DealsOfTheDay";
import Trending from "../components/Trending";
import Type from "../components/Type";
import BlogCard from "../components/BlogCard";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { StyleHome } from "../components/Style";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topBanners, setTopBanners] = useState([]);
  const [adBanner, setAdBanner] = useState(null);
  const [infoBanner, setInfoBanner] = useState(null);
  const [companyBanner, setCompanyBanner] = useState(null);
  const [whatsappBanner, setWhatsappBanner] = useState(null);

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
        setAdBanner(data.find((b) => b.type === "ad") || null);
        setInfoBanner(data.find((b) => b.type === "info") || null);
        setCompanyBanner(data.find((b) => b.type === "company") || null);
        setWhatsappBanner(data.find((b) => b.type === "whatsapp") || null);
        console.log("Top banners:", filtered);
      })
      .catch(() => setTopBanners([]));
  }, []);

  const dummyProduct = {
    id: 1,
    name: "Ashwagandha Tablets",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    ],
    actual_price: 499,
    selling_price: 349,
  };

  return (
    <>
      <Type />
      <BannerTop banners={topBanners} />
      {/* <Breadcrumb/> */}
      <Category />

      {/* Ad banner  */}
      {adBanner && <Banners banners={[adBanner]} />}

      {/* <div className="min-h-screen flex items-center justify-center">
      </div> */}
      <Trending />
      <DealsOfTheDay />
      {/* info banner        */}
      {infoBanner && <Banners banners={[infoBanner]} />}

      <Brands />

      <DealsOfTheDay />
      {/* <ProductCard product={dummyProduct} /> */}

      <PopularBrand/>

            <DealsOfTheDay />



      {/* Blog Section */}
      <div className="my-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">
            Discover Ayurveda
          </h2>
          <Link
            to="/blog"
            className="text-md font-semibold text-blue-600 cursor-pointer hover:underline"
          >
            {" "}
            See all
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

      {/* Company Banner  */}
      {companyBanner && <Banners banners={[companyBanner]} />}

      {/* whatsapp banner  */}
      {whatsappBanner && <Banners banners={[whatsappBanner]} />}

      <StyleHome/>
    </>
  );
};

export default Home;
