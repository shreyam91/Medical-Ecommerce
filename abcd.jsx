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









//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-3xl font-bold text-green-700 mb-8">Your Cart</h1>

//       <div className="grid md:grid-cols-3 gap-8">
//         {/* Cart Items */}
//         <div className="md:col-span-2 space-y-4">
//           {cartItems.map((item) => (
//             <div
//               key={item.id}
//               className="flex items-center gap-4 p-4 border rounded-lg"
//             >
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-24 h-24 object-cover rounded"
//               />
//               <div className="flex-grow">
//                 <h3 className="font-semibold">{item.name}</h3>
//                 <p className="text-gray-600">₹{item.price}</p>
//                 <div className="flex items-center gap-2 mt-2">
//                   <button
//                     onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                     className="px-2 py-1 border rounded"
//                   >
//                     -
//                   </button>
//                   <span>{item.quantity}</span>
//                   <button
//                     onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                     className="px-2 py-1 border rounded"
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>
//               <button
//                 onClick={() => removeFromCart(item.id)}
//                 className="text-red-600 hover:text-red-700"
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Order Summary */}
//         <div className="md:col-span-1">
//           <div className="border rounded-lg p-6 space-y-4">
//             <h2 className="text-xl font-semibold">Order Summary</h2>
            
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <span>Subtotal ({getTotalItems()} items)</span>
//                 <span>₹{getSubtotal()}</span>
//               </div>
              
//               {appliedPromo && (
//                 <div className="flex justify-between text-green-600">
//   <span>Discount ({appliedPromo.code})</span>
//   <span>-₹{Math.round(getDiscount())}</span>
// </div>

//               )}
              
//               <div className="border-t pt-2">
//                 <div className="flex justify-between font-semibold">
//                   <span>Total</span>
//                   <span>₹{getTotal()}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Promo Code Section */}
//             <div className="border-t pt-4">
//               <form onSubmit={handlePromoSubmit} className="space-y-2">
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={promoInput}
//                     onChange={(e) => setPromoInput(e.target.value)}
//                     placeholder="Enter promo code"
//                     className="flex-grow px-3 py-2 border rounded"
//                   />
//                   <button
//                     type="submit"
//                     className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                   >
//                     Apply
//                   </button>
//                 </div>
//                 {promoError && (
//                   <p className="text-red-600 text-sm">{promoError}</p>
//                 )}
//                 {appliedPromo && (
//                   <div className="flex items-center justify-between text-sm text-green-600">
//                     <span>Applied: {appliedPromo.code}</span>
//                     <button
//                       onClick={removePromoCode}
//                       className="text-red-600 hover:text-red-700"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 )}
//               </form>
//             </div>

//             <Link
//               to="/checkout"
//               className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Proceed to Checkout
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>



 {/* Promo Code Section */}
        {/* <div className="border-t pt-4">
          <form onSubmit={handlePromoSubmit} className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code"
                className="flex-grow px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Apply
              </button>
            </div>
            {promoError && (
              <p className="text-red-600 text-sm">{promoError}</p>
            )}
            {appliedPromo && (
              <div className="flex items-center justify-between text-sm text-green-600">
                <span>Applied: {appliedPromo.code}</span>
                <button
                  onClick={removePromoCode}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </form>
        </div> */}