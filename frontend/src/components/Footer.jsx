import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className=" text-black pt-4 pb-4 mt-16 border-t-2 border-green-700 rounded-2xl">
      {/* Top Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-3xl font-bold text-green-600">HerbalMG</h2>
          <p className="text-m text-gray-900 md:max-w-2xl">
            HerbalMG is your trusted online medical store, offering genuine medicines,
            health supplements, and wellness products — delivered with care and convenience.
          </p>
        </div>
      </div>

      {/* Links Section */}
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Company */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-800">Company</h3>
          <ul className="space-y-2 text-m text-gray-700">
            <li><Link to="/about-us" className="hover:text-orange-600 ">About</Link></li>
            <li><Link to="/contact" className="hover:text-orange-600">Contact</Link></li>
            <li><Link to="/blog" className="hover:text-orange-600">Blogs</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-800">Policies</h3>
          <ul className="space-y-2 text-m text-gray-700">
            <li><Link to="/terms-and-conditions" className="hover:text-orange-600">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-orange-600">Privacy Policy</Link></li>
            <li><Link to="/return-and-refund-policy" className="hover:text-orange-600">Return & Refund Policy</Link></li>
            <li><Link to="/faq" className="hover:text-orange-600">FAQs</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-black">Follow Us</h3>
          <div className="flex space-x-5 text-2xl">
            <a href="#" target="_blank" aria-label="Facebook">
              <FaFacebookF className="text-[#1877F2] hover:text-black transition" />
            </a>
            <a href="#" target="_blank" aria-label="Instagram">
              <FaInstagram className="text-[#E4405F] hover:text-black transition" />
            </a>
            <a href="#" target="_blank" aria-label="YouTube">
              <FaYoutube className="text-[#FF0000] hover:text-black transition" />
            </a>
            <a href="#" target="_blank" aria-label="X (Twitter)">
              <FaXTwitter className="text-black hover:text-[#1DA1F2] transition" />
            </a>
          </div>
        </div>

        {/* Newsletter (optional) */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-black">Stay Updated</h3>
          <p className="text-m text-gray-400 mb-3">
            Subscribe to our newsletter for the latest offers.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 w-full text-black rounded-l-md focus:outline-none"
            />
            <button
              type="submit"
              className="bg-green-500 px-4 py-2 rounded-r-md text-white hover:bg-orange-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom note */}
      <div className="text-center text-gray-900 text-xs pt-6">
        &copy; {new Date().getFullYear()} HerbalMG. All rights reserved.
        Dispensed in accordance with the Drugs and Cosmetics Act, 1940 & Rules, 1945.
        <br />
        Crafted with 🧡  by{" "}
        <a
          href="https://portfolio-shreyam91s-projects.vercel.app/"
          className="text-green-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @Shreyam
        </a>
      </div>
    </footer>
  );
};

export default Footer;
