import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, ChevronDown } from 'lucide-react'


const NavBar = () => {


    const handleClickCart = ()=>{
        console.log('i clicked')
    }
    const handleClikHeart = ()=> {
        console.log('handle click')
    }

    return (
        <header className='h-[60px] flex items-center overflow-hidden justify-between px-6 bg-white shadow-md'>
            <img src="/Main-logo.jpeg" alt="Nazra" className='object-cover w-[180px] mt-5'/>
            {/* <h1 className='font-bold text-2xl h-full flex items-center'>NAZRA</h1> */}
            <nav className='flex items-center h-full gap-16'>
                <ul className='flex items-center gap-6'>
                    <li><Link to={'#'}>Home Page</Link></li>
                    <li><Link to={'#'}>Shop Now</Link></li>
                    <li><Link to={'#'}>About Us</Link></li>
                    <li><Link to={'#'} className='flex items-center gap-1'>Collection <ChevronDown size={16} /></Link></li>
                </ul>
                <div className='flex items-center gap-2'>
                    <Heart className='cursor-pointer hover:scale-105' color='black' onClick={handleClikHeart} />
                    <button className='bg-black text-white px-4 py-2 shadow-sm hover:text-black border boreder-black hover:bg-transparent transition-colors duration-300' onClick={handleClickCart}>Cart</button>
                </div>
            </nav>
        </header>
    )
}

export default NavBar