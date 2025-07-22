import React, { useState, useEffect } from 'react'
import BrandFilterAside, { DiseaseFilterAside } from '../components/BrandFilterAside'
import ProductCard from '../components/ProductCard'

function HomeoPathic() {
  const [products, setProducts] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedDiseases, setSelectedDiseases] = useState([])
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('http://localhost:3001/api/product?category=Homeopathic')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products
    .filter(p =>
      (selectedBrands.length === 0 || selectedBrands.includes(p.brand_id)) &&
      (selectedDiseases.length === 0 || selectedDiseases.includes(p.disease_id))
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.selling_price - b.selling_price
      if (sortBy === 'price-desc') return b.selling_price - a.selling_price
      if (sortBy === 'discount-asc') return ((a.actual_price - a.selling_price) / a.actual_price) - ((b.actual_price - b.selling_price) / b.actual_price)
      if (sortBy === 'discount-desc') return ((b.actual_price - b.selling_price) / b.actual_price) - ((a.actual_price - a.selling_price) / a.actual_price)
      return 0
    })

  return (
    // <div className="p-4 max-w-7xl mx-auto">
    //   <div className="flex gap-6">
    //     {/* Left Sidebar Filters */}
    //     <div className="w-64 flex-shrink-0 space-y-6">
    //       <BrandFilterAside
    //         selectedBrands={selectedBrands}
    //         onBrandChange={setSelectedBrands}
    //       />
    //       <DiseaseFilterAside
    //         selectedDiseases={selectedDiseases}
    //         onDiseaseChange={setSelectedDiseases}
    //       />
    //     </div>

    //     {/* Right Product List */}
    //     <div className="flex-1">
    //       <h1 className="text-2xl font-bold mb-6">Homeopathic</h1>
    //       {/* Sort By Dropdown */}
    //       <div className="flex items-center gap-2 mb-4">
    //         <label className="font-medium ">Sort by:</label>
    //         <select
    //           value={sortBy}
    //           onChange={(e) => setSortBy(e.target.value)}
    //           className="border border-gray-300 rounded px-3 py-1"
    //         >
    //           <option value="">Default</option>
    //           <option value="price-asc">Price: Low to High</option>
    //           <option value="price-desc">Price: High to Low</option>
    //           <option value="discount-asc">Discount: Low to High</option>
    //           <option value="discount-desc">Discount: High to Low</option>
    //         </select>
    //       </div>
    //       {/* Loading/Error States */}
    //       {loading && <div className="text-center text-gray-500">Loading products...</div>}
    //       {error && <div className="text-center text-red-500">{error}</div>}
    //       {/* Product Grid */}
    //       {!loading && !error && (
    //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    //           {filteredProducts.length > 0 ? (
    //             filteredProducts.map(product => (
    //               <ProductCard key={product.id} product={product} />
    //             ))
    //           ) : (
    //             <div className="col-span-full text-center text-gray-400">No products found in this category.</div>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>

    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <img
        src="https://via.placeholder.com/300x200?text=Coming+Soon"
        alt="Coming Soon Illustration"
        className="mb-6 w-64 h-auto"
      />
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 mb-4">
        Coming Soon
      </h1>
      <p className="text-gray-600 text-lg max-w-xl">
        We're working hard to bring these medicine as soon as possible. Stay tuned for updates!
      </p>
    </div>
  )
}

export default HomeoPathic