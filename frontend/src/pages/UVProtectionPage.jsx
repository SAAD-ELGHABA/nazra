import React from 'react';
import {SunIcon, EyeIcon, ShieldIcon} from 'lucide-react'
import { Link } from 'react-router-dom'



const UVProtectionPage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-white pt-6 pb-10 ">
        {/* Background Overlay */}
        <div 
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" 
          aria-hidden="true"
        >
         
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-black text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-base font-semibold leading-7">Beyond Fashion</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
              Protect Your Eyes in Style
            </p>
            <p className="mt-6 text-lg leading-8">
              Understanding UV protection isn't just about buzzwords; it's about safeguarding your long-term eye health while looking great. Learn why Nazra Store sunglasses are your best defense.
            </p>
            <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6">
              <Link 
                to="/store/products" 
                className="rounded-md bg-black px-6 py-3.5 text-sm text-white font-semibold  shadow-sm hover:bg-white hover:text-black border  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition duration-300"
              >
                Shop UV Protected Sunglasses
              </Link>
              <Link 
                to="#what-is-uv" 
                className="text-sm font-semibold leading-6 text-black hover:text-white hover:bg-black transition duration-300"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* What is UV? */}
        <div id="what-is-uv" className="lg:flex lg:items-center lg:gap-x-10 mb-20">
          <div className="lg:flex-auto">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Exactly is UV Radiation?</h3>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Ultraviolet (UV) radiation is a form of electromagnetic radiation that comes from the sun and artificial sources. While it's invisible to the human eye, its effects are very real. The two types most harmful to your eyes are UVA and UVB.
            </p>
            <ul className="mt-8 space-y-4 text-gray-700">
              <li className="flex items-start">
                <ShieldIcon className="h-6 w-6 flex-shrink-0 text-indigo-600 mr-2 mt-1" />
                <span><strong className="text-gray-900">UVA Rays:</strong> Penetrate deeply into the skin and eyes, contributing to aging and potentially cataracts over time.</span>
              </li>
              <li className="flex items-start">
                <ShieldIcon className="h-6 w-6 flex-shrink-0 text-indigo-600 mr-2 mt-1" />
                <span><strong className="text-gray-900">UVB Rays:</strong> More intense and damaging, these are the primary cause of sunburn and can lead to conditions like photokeratitis (sunburn of the eye), cataracts, and pterygium.</span>
              </li>
            </ul>
          </div>
          <div className="mt-10 lg:mt-0 lg:flex-shrink-0 lg:w-1/2">
            {/* Image illustrating UV rays or sun */}
            <img 
              src="/slider/uv.jpg" 
              alt="Sun emitting UV rays" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* Why 100% UV Protection Matters */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">Why True UV Protection is Non-Negotiable</h3>
          <p className="mt-6 text-xl leading-8 text-gray-600 text-center max-w-3xl mx-auto">
            Wearing sunglasses is about much more than fashion. It's a vital step in protecting your eye health from cumulative sun damage.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-6 lg:gap-x-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <EyeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">Prevents Eye Conditions</h4>
              <p className="mt-4 text-base text-gray-600">
                Regular exposure to UV light can increase the risk of serious conditions like cataracts, macular degeneration, and pinguecula.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <SunIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">Reduces Glare & Enhances Comfort</h4>
              <p className="mt-4 text-base text-gray-600">
                Quality UV protection often comes with anti-glare properties, reducing eye strain and improving visual comfort, especially on bright days.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <ShieldIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">Protects Delicate Skin</h4>
              <p className="mt-4 text-base text-gray-600">
                The skin around your eyes is thin and susceptible to sun damage. Sunglasses add an extra layer of protection against premature aging and skin cancer.
              </p>
            </div>
          </div>
        </div>

        {/* Nazra Store Promise */}
        <div className="mt-20 bg-green-600 text-white rounded-lg p-10 text-center shadow-xl">
          <h3 className="text-3xl font-bold">Nazra Store: Your Assurance of Protection</h3>
          <p className="mt-4 text-sm">
            Every pair of sunglasses at Nazra Store is selected to provide **100% UVA and UVB protection**, ensuring your eyes are safe without ever compromising on the latest styles. Don't settle for less when it comes to your vision.
          </p>
          <Link 
            to="/store/products" 
            className="mt-8 inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-green-600 bg-white hover:bg-gray-100 transition duration-300"
          >
            Find Your Protected Style
          </Link>
        </div>

      </div>
    </div>
  );
};

export default UVProtectionPage;