import React, { useEffect, useState } from 'react';

import Breadcrumb from '../components/Breadcrumb'
import Brands from '../components/Brands'
import Category from '../components/Category'
import Banner, { BannerAd, BannerEndOne, BannerEndThree, BannerEndTwo } from '../components/Banner'
import DealsOfTheDay from '../components/DealsOfTheDay'
import Trending from '../components/Trending'
import Type from '../components/Type'
import BlogCard from '../components/BlogCard'
import { Link } from 'react-router-dom';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:3001/api/blog')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blogs');
        return res.json();
      })
      .then(data => {
        setBlogs(data.slice(0, 3)); // Show only the latest 3 blogs
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Type/>
      <Banner/>
      {/* <Breadcrumb/> */}
      <Category/>
      <BannerAd/>
      {/* <div className="min-h-screen flex items-center justify-center">
      </div> */}
      <Trending/>
      <DealsOfTheDay />
      <BannerEndThree/>
            <Brands />

                  <DealsOfTheDay />


      {/* Blog Section */}
      <div className="my-10">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-green-700">Discover Ayurveda</h2>
    <Link to="/blog" className='text-md font-semibold text-blue-600 cursor-pointer hover:underline'> See all</Link>
    {/* <h2 className="text-md font-semibold text-blue-600 cursor-pointer hover:underline">See all</h2> */}
  </div>

  {loading && <div className="text-gray-500">Loading blogs...</div>}
  {error && <div className="text-red-500">{error}</div>}

  {!loading && !error && blogs.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {blogs.map(blog => (
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

<BannerEndOne/>
<BannerEndTwo/>

    </>
  );
}

export default Home