import React, { useState, useEffect } from 'react'
import BrandFilterAside, { DiseaseFilterAside } from '../components/BrandFilterAside'
import ProductCard from '../components/ProductCard'

function Homeopathic() {
  const [products, setProducts] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedDiseases, setSelectedDiseases] = useState([])
  const [sortBy, setSortBy] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [filtering, setFiltering] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetch('http://localhost:3001/api/product?category=Homeopathic')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then(data => {
        if (isMounted) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (isMobileFilterOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileFilterOpen])

  useEffect(() => {
    if (products.length === 0) return
    setFiltering(true)
    const timeout = setTimeout(() => setFiltering(false), 300)
    return () => clearTimeout(timeout)
  }, [selectedBrands, selectedDiseases, sortBy, products])

  const handleBrandChange = (brands) => {
    setSelectedBrands(brands)
    setIsMobileFilterOpen(false)
  }
  const handleDiseaseChange = (diseases) => {
    setSelectedDiseases(diseases)
    setIsMobileFilterOpen(false)
  }
  const handleSortChange = (e) => setSortBy(e.target.value)

  const filteredProducts = products
    .filter(p =>
      (selectedBrands.length === 0 || selectedBrands.includes(p.brand_id)) &&
      (selectedDiseases.length === 0 || selectedDiseases.includes(p.disease_id))
    )
    .sort((a, b) => {
      const discountA = a.actual_price > 0 ? (a.actual_price - a.selling_price) / a.actual_price : 0
      const discountB = b.actual_price > 0 ? (b.actual_price - b.selling_price) / b.actual_price : 0
      if (sortBy === 'price-asc') return a.selling_price - b.selling_price
      if (sortBy === 'price-desc') return b.selling_price - a.selling_price
      if (sortBy === 'discount-asc') return discountA - discountB
      if (sortBy === 'discount-desc') return discountB - discountA
      return 0
    })

  return (
    // <div className="p-4 max-w-7xl mx-auto">
    //   {/* MOBILE filter button + sort */}
    //   <div className="flex flex-col gap-3 mb-4 md:hidden">
    //     <button
    //       onClick={() => setIsMobileFilterOpen(true)}
    //       className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded"
    //     >
    //       Filters
    //     </button>
    //     <select
    //       value={sortBy}
    //       onChange={handleSortChange}
    //       className="w-full border border-gray-300 rounded px-3 py-2"
    //     >
    //       <option value="">Sort by</option>
    //       <option value="price-asc">Price: Low to High</option>
    //       <option value="price-desc">Price: High to Low</option>
    //       <option value="discount-asc">Discount: Low to High</option>
    //       <option value="discount-desc">Discount: High to Low</option>
    //     </select>
    //   </div>

    //   <div className="flex gap-6">
    //     {/* TABLET+ sidebar filters */}
    //     <div className="hidden md:block w-64 flex-shrink-0 space-y-6">
    //       <BrandFilterAside selectedBrands={selectedBrands} onBrandChange={handleBrandChange} />
    //       <DiseaseFilterAside selectedDiseases={selectedDiseases} onDiseaseChange={handleDiseaseChange} />
    //     </div>

    //     {/* Products + sort dropdown */}
    //     <div className="flex-1">
    //       {/* Sort dropdown for md+ */}
    //       <div className="hidden md:flex justify-end mb-4">
    //         <select
    //           value={sortBy}
    //           onChange={handleSortChange}
    //           className="border border-gray-300 rounded px-3 py-2 w-60"
    //         >
    //           <option value="">Sort by</option>
    //           <option value="price-asc">Price: Low to High</option>
    //           <option value="price-desc">Price: High to Low</option>
    //           <option value="discount-asc">Discount: Low to High</option>
    //           <option value="discount-desc">Discount: High to Low</option>
    //         </select>
    //       </div>

    //       {loading && (
    //         <div className="flex justify-center items-center py-10">
    //           <img src="/logo.png" alt="Loading" className="w-16 h-16 animate-spin" />
    //         </div>
    //       )}
    //       {error && <div className="text-center text-red-500">{error}</div>}

    //       {!loading && !error && (
    //         filtering ? (
    //           <div className="flex justify-center items-center py-10">
    //             <img src="/logo.png" alt="Loading" className="w-16 h-16 animate-spin" />
    //           </div>
    //         ) : (
    //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    //             {filteredProducts.length > 0 ? (
    //               filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
    //             ) : (
    //               <div className="col-span-full text-center text-gray-400">No products found in this category.</div>
    //             )}
    //           </div>
    //         )
    //       )}
    //     </div>
    //   </div>

    //   {/* Mobile filter drawer */}
    //   <div
    //     className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-300 ease-in-out
    //       ${isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    //     onClick={() => setIsMobileFilterOpen(false)}
    //   />
    //   <div
    //     className={`fixed top-0 left-0 h-full w-3/4 max-w-sm bg-white z-50 shadow-lg p-4 space-y-6 overflow-y-auto
    //       transform transition-transform duration-300 ease-in-out
    //       ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
    //   >
    //     <div className="flex justify-between items-center mb-4">
    //       <h2 className="text-xl font-semibold">Filters</h2>
    //       <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500 text-lg">✕</button>
    //     </div>
    //     <BrandFilterAside selectedBrands={selectedBrands} onBrandChange={handleBrandChange} />
    //     <DiseaseFilterAside selectedDiseases={selectedDiseases} onDiseaseChange={handleDiseaseChange} />
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

export default Homeopathic
