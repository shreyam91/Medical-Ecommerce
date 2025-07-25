import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import CategoryFilters from '../components/CategoryFilters'
import Breadcrumb from '../components/Breadcrumb'

function CategoryPage() {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState(null)

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('name')
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Available filter options
  const [brands, setBrands] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchCategoryInfo()
    fetchBrands()
  }, [categorySlug])

  useEffect(() => {
    applyFilters()
  }, [products, selectedBrand, priceRange, sortBy, showOnlyDiscounted, searchQuery])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3001/api/product?category=${encodeURIComponent(categorySlug)}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryInfo = async () => {
    try {
      // Try to fetch by slug first
      let response = await fetch(`http://localhost:3001/api/category?slug=${categorySlug}`)
      if (!response.ok) {
        // If slug doesn't work, try by name
        response = await fetch(`http://localhost:3001/api/category?name=${categorySlug.replace(/-/g, ' ')}`)
      }
      if (response.ok) {
        const data = await response.json()
        // Handle both single object and array responses
        if (Array.isArray(data) && data.length > 0) {
          setCategory(data[0])
        } else if (data && !Array.isArray(data)) {
          setCategory(data)
        }
      }
    } catch (err) {
      console.error('Error fetching category info:', err)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/brand')
      if (response.ok) {
        const data = await response.json()
        setBrands(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching brands:', err)
      setBrands([])
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          (product.brand && typeof product.brand === 'object' && product.brand.name?.toLowerCase().includes(query)) ||
          (product.tags && Array.isArray(product.tags) && 
           product.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(query)))
        )
      })
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(product => {
        if (product.brand_id?.toString() === selectedBrand) return true
        if (product.brand && typeof product.brand === 'string') {
          return product.brand.toLowerCase().includes(selectedBrand.toLowerCase())
        }
        if (product.brand && typeof product.brand === 'object' && product.brand.name) {
          return product.brand.name.toLowerCase().includes(selectedBrand.toLowerCase())
        }
        return false
      })
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(product => 
        Number(product.selling_price || 0) >= Number(priceRange.min)
      )
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => 
        Number(product.selling_price || 0) <= Number(priceRange.max)
      )
    }

    // Discount filter
    if (showOnlyDiscounted) {
      filtered = filtered.filter(product => {
        const actualPrice = Number(product.actual_price || 0)
        const sellingPrice = Number(product.selling_price || 0)
        return actualPrice > sellingPrice && sellingPrice > 0
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return Number(a.selling_price || 0) - Number(b.selling_price || 0)
        case 'price_high':
          return Number(b.selling_price || 0) - Number(a.selling_price || 0)
        case 'discount':
          const getDiscount = (product) => {
            const actual = Number(product.actual_price || 0)
            const selling = Number(product.selling_price || 0)
            return actual > selling ? ((actual - selling) / actual) * 100 : 0
          }
          return getDiscount(b) - getDiscount(a)
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '')
      }
    })

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSelectedBrand('')
    setPriceRange({ min: '', max: '' })
    setSortBy('name')
    setShowOnlyDiscounted(false)
    setSearchQuery('')
  }

  const getCategoryTitle = () => {
    if (category && category.name) return category.name
    return categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' },
    { label: getCategoryTitle(), path: `/categories/${categorySlug}` }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading category products...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Category Banner */}
      {category && category.banner_url && (
        <div className="w-full mb-6">
          <img
            src={category.banner_url}
            alt={getCategoryTitle() + ' banner'}
            className="w-full h-48 object-cover rounded-lg shadow-md"
          />
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {getCategoryTitle()}
        </h1>
        {category && category.description && (
          <p className="text-gray-600 mb-2">{category.description}</p>
        )}
        <p className="text-gray-600">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex justify-end mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Filters
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters for Desktop/Tablet */}
        <div className="hidden lg:block lg:w-1/4">
          <CategoryFilters
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showOnlyDiscounted={showOnlyDiscounted}
            setShowOnlyDiscounted={setShowOnlyDiscounted}
            clearFilters={clearFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Products Grid Section */}
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price_low">Price (Low to High)</option>
                <option value="price_high">Price (High to Low)</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No products found in this category</div>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start pt-12">
          <div className="bg-white w-11/12 max-w-md p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl"
              onClick={() => setShowMobileFilters(false)}
            >
              ✕
            </button>
            <CategoryFilters
              brands={brands}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              showOnlyDiscounted={showOnlyDiscounted}
              setShowOnlyDiscounted={setShowOnlyDiscounted}
              clearFilters={() => {
                clearFilters()
                setShowMobileFilters(false)
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryPage
