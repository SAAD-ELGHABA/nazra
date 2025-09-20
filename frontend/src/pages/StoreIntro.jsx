import React, { useEffect } from 'react'
import LuxurySlider from '../components/store/LuxurySlider'
import { Link } from 'react-router-dom'
import { HatGlasses, Sun, Palette } from 'lucide-react'
import ReviewSection from '../components/store/ClientReview'
import LuxuryCTA from '../components/store/LuxuryCTA'
import FAQs from '../components/FAQs'





const items = [
  {
    name: "wayfar black",
    image: "/Classic-Black-Sunglasses.png",
    price: 49.99
  },
  {
    name: "master class",
    image: "/Modern-Stylish-Sunglasses.png",
    price: 119.89
  },
  {
    name: "tiger round",
    image: "/Stylish-Tortoiseshell-Glasses.png",
    price: 149.99
  }
]

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
        <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-16'>
          {
            items.map((item,index) => (
              <div className='flex flex-col w-[250px] ' key={index}>
                <img src={item.image} alt={item.name} className='w-full object-cover h-[200px] md:h-[300px] shadow-md' />
                <div className='flex flex-col items-center gap-1 pt-4'>
                  <h3 className='text-xl md:text-2xl font-bold text-black text-center capitalize'>{item.name}</h3>
                  <h6 className='text-lg md:text-xl font-bold text-center'>MAD {item.price}</h6>
                  <Link to={'/store/products'} className='px-4 w-full text-center py-2 mt-2  border border-black hover:bg-black shadow-md shadow-black hover:shadow-none hover:text-white  transition-all duration-300 ease'>
                    Discover more
                  </Link>
                </div>
              </div>
            ))
          }
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
      <ReviewSection />
      <LuxuryCTA />
      <FAQs />
    </div>
  )
}


const itemCard = ({ item }) => (
  <div className='flex flex-col '>
    <img src={item.image} alt={item.name} />
  </div>
)







export default StoreIntro