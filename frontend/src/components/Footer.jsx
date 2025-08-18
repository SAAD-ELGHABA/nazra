import React from 'react'

const LINKS = [
  { name: 'Quick Links', links: [
    {lienName:'about us' ,path:'/about'},
    {lienName:'contact us' ,path:'/contact'},
    {lienName:'shop now' ,path:'/shop'},
    {lienName:'returns policy' ,path:'/returns-policy'},
  ] },
  { name: 'Customer Service', links: [
    {lienName:'help center' ,path:'/help-center'},
    {lienName:'shipping info' ,path:'/shipping-info'},
    {lienName:'gift card' ,path:'/gift-card'},
    {lienName:'terms of use' ,path:'/terms-of-use'},
  ] },
  { name: 'Follow Us', links: [
    {lienName:'instagram' ,path:'https://www.instagram.com/nazra.sunglasses/'},
    {lienName:'facebook' ,path:'https://www.facebook.com/nazra.sunglasses/'},
    {lienName:'twitter' ,path:'https://twitter.com/nazra_sunglasses'},
    {lienName:'Pinterest' ,path:'https://pinterest.com/nazra_sunglasses'},
  ] },
  { name: 'Legal', links: [
    {lienName:'privacy policy' ,path:'/privacy-policy'},
    {lienName:'terms and conditions' ,path:'/terms-and-conditions'},
    {lienName:'accessibility statement' ,path:'/accessibility-statement'},
  ] },
  { name: 'Stay Connected', links: [
    {lienName:'subscribe to newsletter' ,path:'/subscribe'},
    {lienName:'Exclusive Offers' ,path:'/offers'},
    {lienName:'join our community' ,path:'/community'},
    {lienName:'feedback' ,path:'/feedback'},
  ] },
  { name: 'Contact Us', links: [
    {lienName:'email us' ,path:'/email-us'},
    {lienName:'call us' ,path:'/call-us'},
    {lienName:'live chat' ,path:'/live-chat'},
  ] },
]




const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <div className='min-h-[50vh] mt-6 flex flex-col items-center justify-center' >
      <div className='w-11/12  grid grid-cols-6 gap-2 place-items-center  border-black border-y py-10'>
       {
        LINKS.map((link, index) => (
          <div key={index} className='flex flex-col gap-2 h-full'>
            <h3 className='font-bold text-lg'>{link.name}</h3>
            <ul className='flex flex-col gap-1'>
              {link.links.map((l, i) => (
                <li key={i} className='text-sm hover:underline cursor-pointer'>
                  <a href={l.path} className='capitalize'>{l.lienName}</a>
                </li>
              ))}
            </ul>
          </div>
        ))
       }
      </div>
      <div className='flex flex-row-reverse justify-between items-center w-11/12 mt-6'>
        <p className='text-center text-sm mt-4'>© {year} Nazra Sunglasses. All rights reserved.</p>
        <img src="/Main-logo.jpeg" className='w-[100px] object-cover' alt="NAZRA" />
      </div>
    </div>
  )
}

export default Footer



