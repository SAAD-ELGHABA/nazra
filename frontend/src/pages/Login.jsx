import React, { useState } from 'react'


export default function LoginPage() {
    const [data,setData] = useState({
        email:'',
        password:''
    })
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(data)
    }


  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
        {
            error && (
                <p className='text-red-600 py-2 px-6  border border-red-600 bg-red-600/50 text-center capitalize text-sm'>{error}</p>
            )
        }
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-black/10">
        {/* Title */}
        <h2 className="text-3xl font-bold text-black text-center mb-6">
          Login
        </h2>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              onChange={e => setData({...data,email:e.target.value})}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password
            </label>
            <input
              type="password"
              onChange={e => setData({...data,password:e.target.value})}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-2 bg-black text-white rounded-lg font-semibold hover:bg-white hover:text-black border border-black transition duration-300"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
