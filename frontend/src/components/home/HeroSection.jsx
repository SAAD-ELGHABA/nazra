import React from "react"


const HeroSection = () => {
  return (
    <div className="grid grid-cols-2 h-screen w-full">
        <div className="flex flex-col  items-center justify-center px-10 gap-10" >
            <h1 className="font-bold text-[56px]" style={{lineHeight: "1.2",letterSpacing:"4px"}}>Elevate Your Style with Our Luxurious Sunglasses</h1>
            <p className="text-[18px] ">Discover the perfect blend of elegance and protection with our premium sunglasses. Crafted with meticulous attention to detail, each pair offers unparalleled style and UV defense.</p>
            <div className="flex gap-4 self-start">
                <button className="bg-black border border-white p-4 text-white capitalize cursor-pointer hover:bg-transparent hover:text-black hover:font-medium hover:border-black transition-all duration-300 ease-in" style={{letterSpacing:"2px"}}>shop</button>
                <button className="bg-transparent border border-black p-4 text-black capitalize cursor-pointer hover:bg-black hover:text-white hover:font-medium transition-all duration-300 ease-in" style={{letterSpacing:"2px"}}>learn more</button>
            </div>
        </div>
        <img src="/hero-section-img.png" alt="Hero-Section" className="w-full h-screen object-cover " />
    </div>
  )
}

export default HeroSection