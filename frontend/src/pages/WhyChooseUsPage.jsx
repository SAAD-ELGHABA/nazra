import React from 'react';

import { CheckCircleIcon, TruckIcon, ShieldCheckIcon, HeartIcon} from 'lucide-react'



const features = [
  {
    icon: CheckCircleIcon,
    title: 'Unmatched Quality & Style',
    description: 'We hand-select every pair of sunglasses, ensuring they meet the highest standards for lens clarity, UV protection, and frame durability. Look great and stay protected.',
    color: 'text-indigo-600',
  },
  {
    icon: TruckIcon,
    title: 'Fast Shipping Across Morocco',
    description: 'Based right here in Morocco, we guarantee swift processing and reliable delivery to your door, wherever you are in the kingdom. Get your shades when you need them.',
    color: 'text-teal-600',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Worry-Free Guarantee',
    description: 'We stand by our products with a straightforward returns and exchange policy. If they don\'t fit or aren\'t what you expected, we make it easy to sort out.',
    color: 'text-yellow-600',
  },
  {
    icon: HeartIcon,
    title: 'Dedicated Local Support',
    description: 'Have a question about a style or an order? Our local Moroccan support team is ready to help you quickly and personally. Your satisfaction is our priority.',
    color: 'text-rose-600',
  },
];


const WhyChooseUsPage = () => {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Promise to You</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Why Nazra Store is Your Best Choice for Eyewear
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            We are more than just a sunglasses shop, we are your local partner for style, protection, and value.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-12">
            {features.map((feature) => (
              <div key={feature.title} className="relative">
                <dt>
                  <div className={`absolute flex items-center justify-center h-12 w-12 rounded-md ${feature.color} bg-opacity-10 text-white`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Guarantee/Call to Action Block (Optional) */}
        <div className="mt-20 bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-indigo-600">
            <h3 className="text-2xl font-bold text-gray-900">Ready to Find Your Perfect Pair?</h3>
            <p className="mt-4 text-gray-600">
                Browse our curated collections today and experience the Nazra difference for yourself.
            </p>
            <a 
                href="/store/products" // Link to your main shop page
                className="mt-6 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300"
            >
                Start Shopping Now
            </a>
        </div>

      </div>
    </div>
  );
};

export default WhyChooseUsPage;