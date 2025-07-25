"use client";
import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../components/ui/resizable-navbar";
import { useState, useEffect, useRef } from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { NavigationMenuDemo } from "./ui/NavigationMenuDemo";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaLocationDot } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";



export default function NavbarMain() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    isLoggedIn: true,
    name: "John Doe",
  });

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pincodeDropdownRef = useRef(null);
  const inputRef = useRef(null);

  const [locations, setLocations] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [isPincodeDropdownOpen, setIsPincodeDropdownOpen] = useState(false);

  const detectUserLocation = async () => {
  console.log("Manually triggering location detection...");

  if (!("geolocation" in navigator)) {
    setSearchError("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Geolocation coords:", latitude, longitude);

      try {
        const res = await fetch("http://localhost:3001/api/detect-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lon: longitude }),
        });

        console.log("Detect location response status:", res.status);
        if (!res.ok) throw new Error("Detect location failed");

        const data = await res.json();

        if (data.pincode) {
          localStorage.setItem("userPincode", data.pincode);
          setSelectedPincode(data.pincode);
          setSearchQuery(data.pincode);
          fetchPincodes(data.pincode);
          setSearchError("");
        } else {
          setSearchError("No pincode returned from location detection");
        }
      } catch (err) {
        console.error("Error during detect-location fetch:", err);
        setSearchError("Failed to detect location");
      }
    },
    (error) => {
      console.warn("Geolocation error callback fired:", error);
      setSearchError("Location permission denied or unavailable");
    }
  );
};


  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const navigationLinks = [
    { name: "Home", link: "/" },
    { name: "Orders", link: "/order-history" },
    { name: "Cart", link: "/cart" },
    // { name: "Contact", link: "#contact" },
  ];

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load cached or detected pincode
  useEffect(() => {
  const cachedPincode = localStorage.getItem("userPincode");
  console.log("Requesting user location...");

  if (cachedPincode) {
    setSelectedPincode(cachedPincode);
    setSearchQuery(cachedPincode);
    fetchPincodes(cachedPincode);
  } else {
    detectUserLocation(); // <-- Use the reusable function here
  }
}, []);



// Helper function to fetch pincodes and update state
function fetchPincodes(pincode) {
  console.log("Fetching pincodes for:", pincode);
  fetch(`http://localhost:3001/api/pincodes/${pincode}`)
    .then(res => {
      console.log("Fetch pincodes status:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("Fetched pincodes data:", data);
      if (Array.isArray(data) && data.length > 0) {
        setLocations(data);
        setSearchError("");
      } else {
        console.warn("No pincodes found for detected location");
        setLocations([]);
        setSearchError("No pincodes found for detected location");
      }
    })
    .catch(err => {
      console.error("Failed to fetch pincodes:", err);
      setLocations([]);
      setSearchError("Failed to fetch pincodes");
    });
}

// Debounced pincode search
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    if (searchQuery.trim() === "") {
      setLocations([]);
      setIsPincodeDropdownOpen(false);
      return;
    }

    console.log("Searching pincodes for:", searchQuery);

    fetch(
      `http://localhost:3001/api/pincodes/${encodeURIComponent(
        searchQuery.trim()
      )}`
    )
      .then((res) => {
        console.log("Search pincodes fetch status:", res.status);
        if (!res.ok) throw new Error("No pincodes found");
        return res.json();
      })
      .then((pincodes) => {
        console.log("Search pincodes data:", pincodes);
        if (Array.isArray(pincodes) && pincodes.length > 0) {
          setLocations(pincodes);
          setIsPincodeDropdownOpen(true);
          setSearchError("");
        } else {
          console.warn("No results found in search");
          setLocations([]);
          setIsPincodeDropdownOpen(false);
          setSearchError("No results found.");
        }
      })
      .catch((err) => {
        console.error("Search pincodes fetch error:", err);
        setLocations([]);
        setIsPincodeDropdownOpen(false);
        setSearchError("No results found.");
      });
  }, 400);

  return () => clearTimeout(delayDebounce);
}, [searchQuery]);


  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedPincode("");
    setSearchError("");
  };

  const handleSelect = (loc) => {
    setSelectedPincode(loc.Pincode);
    setSearchQuery(loc.Pincode);
    setIsPincodeDropdownOpen(false);
    setSearchError("");
    localStorage.setItem("userPincode", loc.Pincode);
  };

  const handleInputFocus = () => {
    if (locations.length > 0) setIsPincodeDropdownOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsPincodeDropdownOpen(false), 100);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const uniqueLocations = locations.filter(
    (loc, idx, arr) =>
      arr.findIndex((l) => l.Pincode === loc.Pincode) === idx
  );

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody className="hidden md:flex flex-col items-stretch gap-2">
          <div className="flex w-full items-center justify-between">
            <NavbarLogo />
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-4 w-full max-w-2xl relative">
                <div className="flex items-center gap-3 w-full max-w-2xl">
  {/* Use Current Location button with icon */}
  <button
    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
    onClick={() => {
      localStorage.removeItem("userPincode");
      detectUserLocation(); // manually trigger geolocation
    }}
  >
    <FaLocationDot className="w-4 h-4" />
    <span> Location</span>
  </button>

  {/* Pincode Input and Dropdown */}
  <div
    className="relative w-full"
    style={{ maxWidth: 200 }}
    ref={pincodeDropdownRef}
  >
    <input
      ref={inputRef}
      type="text"
      value={searchQuery}
      onChange={handleInputChange}
      onFocus={(e) => {
        handleInputFocus();
        e.stopPropagation();
      }}
      onBlur={handleInputBlur}
      onClick={(e) => e.stopPropagation()}
      placeholder="Search or select pincode..."
      className="border rounded px-4 py-2 text-sm w-full dark:bg-neutral-800 dark:text-white"
    />

    {isPincodeDropdownOpen && uniqueLocations.length > 0 && (
      <ul
        className="absolute z-10 bg-white border rounded w-full max-h-60 overflow-y-auto shadow-lg mt-1"
        style={{ maxWidth: 200 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {uniqueLocations.map((loc, idx) => (
          <li
            key={idx}
            className={`px-4 py-2 cursor-pointer hover:bg-blue-100 text-sm  ${
              selectedPincode === loc.Pincode ? "bg-gray-200" : ""
            }`}
            onMouseDown={() => handleSelect(loc)}
          >
            {loc.Pincode}
          </li>
        ))}
      </ul>
    )}

    {searchError && (
      <div className="text-red-500 text-xs mt-1">{searchError}</div>
    )}
  </div>
</div>

                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  placeholder="Search for medicine and health products..."
                  className="border rounded px-4 py-2 text-sm w-full dark:bg-neutral-800 dark:text-white"
                  style={{ maxWidth: 600 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* <Link to="/order-history">
                <NavbarButton variant="secondary">
                  <div className="flex items-center gap-2 text-l">
                    Orders
                  </div>
                </NavbarButton>
              </Link> */}

              <Link to="/cart">
                <NavbarButton variant="secondary">
                  <div className="flex items-center gap-2 text-l">
                    <MdAddShoppingCart />
                    <span>{cartItemCount}</span>
                  </div>
                </NavbarButton>
              </Link>

              {user.isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 text-l hover:text-blue-600"
                  >
                    {user.name}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      
                      <button
                        onClick={() => {
                          setUser({ isLoggedIn: false });
                          localStorage.removeItem("userPincode");
                          setIsProfileDropdownOpen(false);
                          navigate("/");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <NavbarButton variant="secondary" className="text-l">
                    Login
                  </NavbarButton>
                </Link>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center">
            <NavigationMenuDemo />
          </div>
        </NavBody>

        <div className="block md:hidden">
          <MobileNav>
            <MobileNavHeader>
  <div className="flex flex-col w-full gap-2 p-2">

    {/* Top Row: Location + Login/Profile */}
    <div className="flex items-center justify-between w-full">

      {/* Location Detection + Pincode */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
          onClick={() => {
            localStorage.removeItem("userPincode");
            detectUserLocation();
          }}
        >
          <FaLocationDot className="w-3 h-3" />
          <span>Location</span>
        </button>

        <div className="relative max-w-[100px]" ref={pincodeDropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={(e) => {
              handleInputFocus();
              e.stopPropagation();
            }}
            onBlur={handleInputBlur}
            onClick={(e) => e.stopPropagation()}
            placeholder="Pincode"
            className="border rounded px-2 py-1 text-xs w-full dark:bg-neutral-800 dark:text-white"
          />

          {isPincodeDropdownOpen && uniqueLocations.length > 0 && (
            <ul
              className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-y-auto shadow-lg mt-1"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {uniqueLocations.map((loc, idx) => (
                <li
                  key={idx}
                  className={`px-2 py-1 cursor-pointer hover:bg-blue-100 text-xs ${
                    selectedPincode === loc.Pincode ? "bg-gray-200" : ""
                  }`}
                  onMouseDown={() => handleSelect(loc)}
                >
                  {loc.Pincode}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Login / Profile */}
      <div className="flex items-center gap-2">
        {user.isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              {user.name}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute left-0 mt-1 w-20 bg-white border rounded shadow-md z-50">
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setUser({ isLoggedIn: false });
                    localStorage.removeItem("userPincode");
                    setIsProfileDropdownOpen(false);
                    navigate("/");
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
              Login
            </button>
          </Link>
        )}
      </div>
    </div>

    {/* Second Row: Search + Cart */}
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={medicineSearch}
        onChange={(e) => setMedicineSearch(e.target.value)}
        placeholder="Search medicines..."
        className="border rounded px-2 py-1 text-xs flex-1 dark:bg-neutral-800 dark:text-white"
      />
      
      <Link to="/cart" className="flex items-center">
        <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
          <MdAddShoppingCart className="w-4 h-4" />
          <span>{cartItemCount}</span>
        </div>
      </Link>
    </div>

    {/* Error Message */}
    {searchError && (
      <div className="text-red-500 text-xs">{searchError}</div>
    )}
  </div>
</MobileNavHeader>


            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-col gap-4 px-4 py-4">
                <Link to="/order-history">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Order
                  </NavbarButton>
                </Link>
                <Link to="/cart">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    <div className="flex items-center gap-2">
                      <MdAddShoppingCart />
                      <span>{cartItemCount}</span>
                    </div>
                  </NavbarButton>
                </Link>
                {user.isLoggedIn ? (
                  <>
                    <Link to="/profile">
                      <NavbarButton
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="primary"
                        className="w-full"
                      >
                        Profile
                      </NavbarButton>
                    </Link>
                    <NavbarButton
                      onClick={() => {
                        setUser({ isLoggedIn: false });
                        localStorage.removeItem("userPincode");
                        setIsMobileMenuOpen(false);
                        navigate("/");
                      }}
                      variant="primary"
                      className="w-full"
                    >
                      Logout
                    </NavbarButton>
                  </>
                ) : (
                  <Link to="/login">
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      className="w-full"
                    >
                      Login
                    </NavbarButton>
                  </Link>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </div>
      </Navbar>
      {/* Centered Home Button at Bottom - Mobile Only */}
<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 sm:hidden z-50">
  <Link
    to="/"
    className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm hover:bg-blue-700"
  >
    <FaHome className="w-4 h-4" />
    Home
  </Link>
</div>


    </div>
  );
}
