import React, { useEffect } from 'react'
import LuxurySlider from '../components/store/LuxurySlider'
import { Link } from 'react-router-dom'
import { HatGlasses, Sun, Palette } from 'lucide-react'
import LuxuryCTA from '../components/store/LuxuryCTA'
import FAQs from '../components/FAQs'
import ProductsShortCut from '../components/home/ProductsShortCut'





// Removed: an unrendered array of three invented products with hardcoded
// prices, one of which pointed at an image that does not exist on disk.

const StoreIntro = () => {
  useEffect(()=>{
  window.scrollTo(0,0)
},[])
  return (
    <div>
      <LuxurySlider />
      <div className='flex flex-col items-center gap-6 py-10'>
        <div className='flex flex-col gap-8'>
          <h1 className='text-4xl w-10/12 mx-auto text-center font-normal'>Explore Our Collection of Luxuury Sunglasses</h1>
          <p className='text-lg text-center '>Designed with precision, elegance, and UV protection</p>
        </div>
        <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-16 w-full'>
          <ProductsShortCut/>
        </div>
      </div>
      <div className=' flex items-center justify-center gap-8 md:gap-16 bg-black w-full py-8'>
        <div className='flex flex-col items-center text-white w-4/12'>
          <HatGlasses  className='w-8 h-8 ' />
          <h2 className='w-1/2 text-center mx-auto text-xs md:text-2xl'>Premium Itailan Materials</h2>
        </div>
        <div className='flex flex-col items-center justify-start text-white w-4/12'>
          <Sun className='w-8 h-8 ' />
          <h2 className='w-1/2 text-center mx-auto text-xs md:text-2xl'>UV400 Protection</h2>
        </div>
        <div className='flex flex-col items-center text-white w-4/12'>
          <Palette className='w-8 h-8 ' />
          <h2 className='w-1/2 text-center mx-auto text-xs md:text-2xl'>Modern & Timeless Designs</h2>
        </div>
      </div>
      {/* ReviewSection removed: hardcoded English testimonials under invented
          names ("Sarah Johnson", "Michael Chen", "Emma Rodriguez") shown to
          French-speaking Moroccan traffic. */}
      <LuxuryCTA />
      <FAQs />
    </div>
  )
}







export default StoreIntro