// src/components/LogoCircles.jsx
import React, { useRef } from 'react'

const brands = [
  { name: 'Dhootapapeshwar', url: 'https://sdlindia.com/wp-content/uploads/2022/06/Artboard-1-1.png' },
  { name: 'Dabur', url: 'https://www.dabur.com/static/images/android-icon-72x72.png' },
  { name: 'Baidyanath', url: 'https://www.baidyanath.co.in/images/logo.webp' },
  { name: 'Himalaya', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Himalaya_Logo.svg/800px-Himalaya_Logo.svg.png' },
  { name: 'Zandu', url: 'https://zanducare.com/cdn/shop/files/zandu_logo_23a4d348-436c-4efa-8b53-9607e4aaf9ad_85x@2x.png?v=1668585144' },
  { name: 'Sharmayu', url: 'https://sharmayu.com/cdn/shop/files/Sharmayu_Logo_2024_transparent_fdfbe20e-5840-41b2-8070-3183b71afc26.png?v=1730703693&width=600' },
  { name: 'Sri Sri', url: 'https://www.srisritattva.com/cdn/shop/files/4927564f1d554246a2d3cc1c7a0343d2_1.png?v=1692352382&width=324' },
  { name: 'Patanjali', url: 'https://patanjaliwellness.com/assets/images/Patanjali-Wellness-logo.png' },
  { name: 'Shri Mohta', url: 'https://www.shrimohta.com/cdn/shop/files/mohta_logo-01-01.png?v=1743326790&width=200' },
  { name: 'Sandu', url: 'https://sandu.in/wp-content/uploads/2024/09/sandu-logo1.png' },
  { name: 'Vitro', url: 'https://vitronaturals.com/cdn/shop/files/Vitro_logo_cd857469-5926-401a-8108-4e47b4fec2a2_180x.png?v=1716897713' },
  { name: 'Kapiva', url: 'https://cdn11.bigcommerce.com/s-5h8rqg02f8/images/stencil/250x100/subtract_1617795361__77099.original.png' },
  { name: 'Krishan Gopal Kaleda', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Krishan_Gopal_Kaleda_logo.svg/800px-Krishan_Gopal_Kaleda_logo.svg.png' },
  { name: 'Aimil', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Aimil_logo.svg/800px-Aimil_logo.svg.png' },
  { name: 'Vasu', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vasu_logo.svg/800px-Vasu_logo.svg.png' },
  { name: 'Charak', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Charak_logo.svg/800px-Charak_logo.svg.png' },
  { name: 'Vyas', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vyas_logo.svg/800px-Vyas_logo.svg.png' },
  { name: 'Vaidratnam', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Vaidratnam_logo.svg/800px-Vaidratnam_logo.svg.png' },
  { name: 'Kottakal', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Kottakal_logo.svg/800px-Kottakal_logo.svg.png' },
  { name: 'AVP', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/AVP_logo.svg/800px-AVP_logo.svg.png' },
  { name: 'Nagarjuna Kerala', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Nagarjuna_Kerala_logo.svg/800px-Nagarjuna_Kerala_logo.svg.png' },
  { name: 'Multani', url: 'https://www.multani.org/cdn/shop/files/logo-min.png?v=1726386561&width=300' }
]

const LogoCircles = () => {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return

    const scrollAmount = 200 // adjust this to control how far to scroll on button click
    if (direction === 'left') {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="text-center p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Ayurvedic Brands</h1>
      <div className="relative">
        {/* Scroll buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-green-600 text-white rounded-full p-2 shadow hover:bg-green-700 z-10"
          aria-label="Scroll Left"
        >
          &#8592;
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-10"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex-shrink-0 w-24 h-24 rounded-full bg-white border shadow flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              title={brand.name}
              style={{ scrollSnapAlign: 'center' }}
            >
              <img src={brand.url} alt={brand.name} className="w-14 h-14 object-contain" />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-green-600 text-white rounded-full p-2 shadow hover:bg-green-700 z-10"
          aria-label="Scroll Right"
        >
          &#8594;
        </button>
      </div>
    </div>
  )
}

export default LogoCircles
