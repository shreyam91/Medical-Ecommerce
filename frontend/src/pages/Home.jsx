import React from 'react'

import Breadcrumb from '../components/Breadcrumb'
import Brands from '../components/Brands'
import Category from '../components/Category'
import Banner from '../components/Banner'
import DealsOfTheDay from '../components/DealsOfTheDay'
import Trending from '../components/Trending'
const Home = () => {
  return (
    <>
    <Banner/>
    <Breadcrumb/>
    <Category/>
      <Brands />
    {/* <div className="min-h-screen flex items-center justify-center">
    </div> */}
    <Trending/>
    <DealsOfTheDay />
    </>
  )
}

export default Home