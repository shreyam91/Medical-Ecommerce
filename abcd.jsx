//  {/* Filters Sidebar */}
//         <div className="lg:w-1/4">
//           <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
//               <button
//                 onClick={clearFilters}
//                 className="text-sm text-blue-600 hover:text-blue-800"
//               >
//                 Clear All
//               </button>
//             </div>

//             {/* Category Filter */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Category
//               </label>
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Categories</option>
//                 {categories.map((category) => (
//                   <option key={category.id} value={category.id}>
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Disease Filter */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Disease/Condition
//               </label>
//               <select
//                 value={selectedDisease}
//                 onChange={(e) => setSelectedDisease(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">All Conditions</option>
//                 {diseases.map((disease) => (
//                   <option key={disease} value={disease}>
//                     {disease}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Price Range Filter */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Price Range
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={priceRange.min}
//                   onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
//                   className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={priceRange.max}
//                   onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
//                   className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             {/* Discount Filter */}
//             <div className="mb-6">
//               <label className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={showOnlyDiscounted}
//                   onChange={(e) => setShowOnlyDiscounted(e.target.checked)}
//                   className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <span className="text-sm text-gray-700">Show only discounted products</span>
//               </label>
//             </div>
//           </div>
//         </div>



