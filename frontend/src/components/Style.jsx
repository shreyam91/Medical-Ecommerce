import React from 'react'

import affordable from '/assets/affordable.svg';
import relaible from '/assets/reliable.svg';
import secure from '/assets/secure.svg';


const Style = () => {
  return (
    <>
      <div className="border-b my-4"></div>

      <div className="w-full bg-white">
        {/* Top Heading */}
        <div className="text-center py-4 sm:py-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold uppercase">
            India’s Largest Ayurvedic Healthcare Platform
          </h2>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-4 sm:gap-8 md:gap-12 text-center py-4">
          <div>
            <div className="text-xl font-bold text-blue-700 sm:text-2xl md:text-3xl">260m+</div>
            <div className="text-sm text-gray-600 sm:text-base">Visitors</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-700 sm:text-2xl md:text-3xl">31m+</div>
            <div className="text-sm text-gray-600 sm:text-base">Orders Delivered</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-700 sm:text-2xl md:text-3xl">1800+</div>
            <div className="text-sm text-gray-600 sm:text-base">Cities</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Style;



export function StyleHome() {
  return (
    <div className="w-full bg-white">
      {/* Stats Bar */}
      <div className="flex justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-20 text-center py-6 sm:py-8">
        <div>
          <img src={relaible} alt="Reliable" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
          <div className="text-base font-bold text-green-600 sm:text-xl md:text-2xl lg:text-3xl">Reliable</div>
        </div>
        <div>
          <img src={secure} alt="Secure" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
          <div className="text-base font-bold text-green-600 sm:text-xl md:text-2xl lg:text-3xl">Secure</div>
        </div>
        <div>
          <img src={affordable} alt="Affordable" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
          <div className="text-base font-bold text-green-600 sm:text-xl md:text-2xl lg:text-3xl">Affordable</div>
        </div>
      </div>
    </div>
  );
}
