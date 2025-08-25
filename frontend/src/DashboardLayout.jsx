import React from 'react'
import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const DashboardLayout = () => {
    const navigate = useNavigate()

    const year = new Date().getFullYear()
    const currentPath = (url) => {
        return useLocation().pathname === url ? 'border-b-2 ' : 'text-black';
    }

    const handleLogOut = () => {
        localStorage.removeItem('token');
        console.log('Logged out successfully');
        navigate('/login'); // Redirect to login page after logout
    }

  return (
    <div className='flex flex-col items-center justify-between'>
        <nav className='h-14 bg-white shadow-md text-black px-4 flex items-center w-full'>
            <h2 className='font-semibold text-xl'>NAZRA Dashboard</h2>
            <ul className='flex-1 flex justify-center  space-x-4 h-full'>
                <li className={`h-full flex items-center ${currentPath('/dashboard')}`}>
                    <Link to="/dashboard"  >Dashboard</Link>
                </li>
                <li className={`h-full flex items-center ${currentPath('/dashboard/products')}`}>
                    <Link to="/dashboard/products">Products</Link>
                </li>
                <li className={`h-full flex items-center ${currentPath('/dashboard/orders')}`}>
                    <Link to="/dashboard/orders" >Orders</Link>
                </li>
            </ul>
                <button className='bg-black shadow-md text-white px-4 py-2 rounded' onClick={handleLogOut}>Logout</button>
        </nav>
        <main className='my-6 min-h-screen w-full'>
            <Outlet />
        </main>
        <footer className='flex w-full items-center justify-between px-10 border-t-2'>
        <img src="/Main-logo.jpeg" className='h-[150px] object-cover' alt="" />
        <p>© {year} Nazra Sunglasses.</p>
        </footer>
    </div>
  )
}

export default DashboardLayout