import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import searchAnalytics from '../utils/searchAnalytics';

export default function SearchComponent() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load popular and recent searches on component mount
  useEffect(() => {
    loadPopularSearches();
    loadRecentSearches();
  }, []);

  const loadPopularSearches = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/search/popular');
      if (response.ok) {
        const data = await response.json();
        setPopularSearches(data.popular || []);
      }
    } catch (error) {
      console.error('Failed to fetch popular searches:', error);
      // Fallback to local analytics
      const localPopular = searchAnalytics.getPopularSearches(8);
      setPopularSearches(localPopular.map(item => ({ name: item.query, type: 'search' })));
    }
  };

  const loadRecentSearches = () => {
    const recent = searchAnalytics.getRecentSearches(5);
    setRecentSearches(recent);
  };

  // Enhanced search function
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`);
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.suggestions || [];
        
        const formattedResults = suggestions.map(suggestion => {
          // Handle different API response formats
          const itemName = suggestion.name || suggestion.suggestion;
          const itemId = suggestion.id || suggestion._id;
          
          return {
            id: itemId,
            name: itemName,
            type: suggestion.type,
            searchType: suggestion.type === 'product' ? 'products' : 
                       suggestion.type === 'brand' ? 'brands' :
                       suggestion.type === 'disease' ? 'diseases' : 'categories',
            // Preserve original data
            ...suggestion,
            // Override with cleaned data
            displayName: itemName
          };
        });

        setSearchResults(formattedResults);
      } else {
        // Fallback search
        await performFallbackSearch(searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
      await performFallbackSearch(searchQuery);
    } finally {
      setIsLoading(false);
    }
  };

  const performFallbackSearch = async (searchQuery) => {
    try {
      const searchPromises = [
        fetch(`http://localhost:3001/api/product?search=${encodeURIComponent(searchQuery)}`).then(res => 
          res.ok ? res.json().then(data => ({ type: 'products', data: Array.isArray(data) ? data.slice(0, 3) : [] })) : { type: 'products', data: [] }
        ),
        fetch(`http://localhost:3001/api/brand`).then(res => 
          res.ok ? res.json().then(data => ({ 
            type: 'brands', 
            data: Array.isArray(data) ? data.filter(brand => 
              brand.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 3) : [] 
          })) : { type: 'brands', data: [] }
        ),
        // Add category search
        fetch(`http://localhost:3001/api/category`).then(res => 
          res.ok ? res.json().then(data => ({ 
            type: 'categories', 
            data: Array.isArray(data) ? data.filter(category => 
              category.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 3) : [] 
          })) : { type: 'categories', data: [] }
        ),
      ];

      const results = await Promise.all(searchPromises);
      const combinedResults = [];

      results.forEach(result => {
        if (result.data.length > 0) {
          combinedResults.push(...result.data.map(item => ({
            ...item,
            id: item.id || item._id,
            name: item.name || item.title,
            searchType: result.type,
            type: result.type.slice(0, -1) // Remove 's' from 'products' -> 'product'
          })));
        }
      });

      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Fallback search error:', error);
    }
  };

  // Debounced search handler
  const debouncedSearch = useRef(
    debounce((text) => {
      performSearch(text);
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper functions
  const getSearchIcon = (type) => {
    switch (type) {
      case 'products': case 'product': return '💊';
      case 'brands': case 'brand': return '🏢';
      case 'diseases': case 'disease': return '🩺';
      case 'categories': case 'category': return '📂';
      default: return '🔍';
    }
  };

  const getSearchLabel = (type) => {
    switch (type) {
      case 'products': case 'product': return 'Product';
      case 'brands': case 'brand': return 'Brand';
      case 'diseases': case 'disease': return 'Disease';
      case 'categories': case 'category': return 'Category';
      default: return 'Result';
    }
  };

  const handleSearchSelect = async (item) => {
    console.log('🖱️ Search result clicked:', item);
    
    const searchQuery = item.name || item.displayName;
    setQuery(searchQuery);
    setShowDropdown(false);
    setIsFocused(false);
    
    // Track the search
    searchAnalytics.trackSearch(searchQuery);
    
    const itemType = item.searchType || item.type;
    console.log('📊 Item details:', { type: itemType, id: item.id, name: searchQuery });
    
    // Handle navigation based on item type and availability of ID
    if (itemType === 'products' || itemType === 'product') {
      if (item.id) {
        console.log('🚀 Navigating to product:', item.id);
        navigate(`/product/${item.id}`);
      } else {
        // No ID available, try to find the product by searching
        console.log('🔍 No product ID found, searching for:', searchQuery);
        try {
          const response = await fetch(`http://localhost:3001/api/product?search=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const products = await response.json();
            if (products && products.length > 0) {
              console.log('✅ Found product, navigating to:', products[0].id);
              navigate(`/product/${products[0].id}`);
              return;
            }
          }
        } catch (error) {
          console.error('❌ Error searching for product:', error);
        }
        // Fallback to search page
        console.log('⚠️ Fallback: Navigating to search with product filter');
        navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=products`);
      }
    } else if (itemType === 'brands' || itemType === 'brand') {
      if (item.id) {
        console.log('🚀 Navigating to brand:', item.id);
        navigate(`/brand/${item.id}`);
      } else {
        // Try brand slug approach
        console.log('🔍 No brand ID found, using slug approach for:', searchQuery);
        const brandSlug = searchQuery.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        navigate(`/brand/${brandSlug}`);
      }
    } else if (itemType === 'diseases' || itemType === 'disease') {
      console.log('🚀 Navigating to disease/health concern:', searchQuery);
      const diseaseSlug = searchQuery.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      navigate(`/health-concern/${diseaseSlug}`);
    } else if (itemType === 'categories' || itemType === 'category') {
      console.log('🚀 Navigating to category:', searchQuery);
      const categorySlug = searchQuery.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      navigate(`/category/${categorySlug}`);
    } else {
      console.log('🚀 Default navigation to search');
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Track the search
    searchAnalytics.trackSearch(query);
    
    // Check if there are any search results or if it matches popular categories
    const popularCategories = ['Ayurvedic', 'Homeopathic', 'Diabetes', 'Blood Pressure', 'Pain Relief', 'Vitamins'];
    const isPopularCategory = popularCategories.some(cat => 
      cat.toLowerCase() === query.toLowerCase()
    );
    
    if (searchResults.length === 0 && !isPopularCategory) {
      // Redirect to request product page if no results found and not a popular category
      navigate(`/request-product?query=${encodeURIComponent(query)}`);
    } else {
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    
    setShowDropdown(false);
    setIsFocused(false);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
    loadRecentSearches(); // Refresh recent searches
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-[120px] py-12"
      ref={dropdownRef}
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 text-gray-700 drop-shadow-sm">
        Search your medicine here
      </h1>
      <div className={`relative w-full max-w-xl transition-all duration-300 ease-in-out z-50`}>  
        <form onSubmit={handleSearchSubmit} className="relative">
          <FiSearch
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-300 ${
              isFocused ? 'text-blue-500 scale-110' : 'scale-100'
            }`}
            size={22}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Search medicines, brands, diseases, categories..."
            className="w-full pl-10 pr-12 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-md focus:shadow-xl bg-white text-lg"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </form>

        {/* Enhanced Search Dropdown */}
        {showDropdown && isFocused && (
          <div className="absolute w-full bg-white rounded-lg shadow-xl mt-2 z-[9999] overflow-hidden border border-gray-200 max-h-96 overflow-y-auto">
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                  Search Results
                </div>
                {searchResults.map((item, index) => (
                  <div
                    key={`result-${index}`}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Click detected on item:', item);
                      handleSearchSelect(item);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getSearchIcon(item.searchType || item.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                            {getSearchLabel(item.searchType || item.type)}
                          </span>
                          {item.strength && (
                            <span className="text-gray-400">• {item.strength}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {query.trim() === '' && recentSearches.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 flex items-center justify-between">
                  Recent Searches
                  <button
                    onClick={() => {
                      searchAnalytics.clearHistory();
                      setRecentSearches([]);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((item, index) => (
                  <div
                    key={`recent-${index}`}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                    onClick={() => {
                      setQuery(item.query);
                      navigate(`/search?q=${encodeURIComponent(item.query)}`);
                      setShowDropdown(false);
                      setIsFocused(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">🕒</span>
                      <div className="flex-1">
                        <div className="text-gray-700">{item.query}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {query.trim() === '' && popularSearches.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                  Popular Searches
                </div>
                {popularSearches.slice(0, 6).map((item, index) => (
                  <div
                    key={`popular-${index}`}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                    onClick={() => {
                      setQuery(item.name);
                      navigate(`/search?q=${encodeURIComponent(item.name)}`);
                      setShowDropdown(false);
                      setIsFocused(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getSearchIcon(item.type + 's')}</span>
                      <div className="flex-1">
                        <div className="text-gray-700">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {getSearchLabel(item.type + 's')}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">🔥</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {query.trim() !== '' && searchResults.length === 0 && !isLoading && (
              <div className="px-4 py-6 text-center text-gray-500">
                <div className="text-lg mb-2">No results found for "{query}"</div>
                <button
                  onClick={handleSearchSubmit}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Request this product →
                </button>
              </div>
            )}

            {/* Search Action */}
            {query.trim() !== '' && (
              <div className="px-4 py-3 border-t bg-gray-50">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {searchResults.length === 0 
                    ? `Request "${query}" - Product not found?`
                    : `View all results for "${query}"`
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Search Categories */}
      {!isFocused && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <div className="text-sm text-gray-500 mb-2 w-full text-center">Popular categories:</div>
          {['Ayurvedic', 'Homeopathic', 'Diabetes', 'Blood Pressure', 'Pain Relief', 'Vitamins'].map(category => (
            <button
              key={category}
              onClick={() => {
                setQuery(category);
                navigate(`/search?q=${encodeURIComponent(category)}`);
              }}
              className="bg-gray-100 hover:bg-blue-100 hover:text-blue-700 px-3 py-1 rounded-full text-sm transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
