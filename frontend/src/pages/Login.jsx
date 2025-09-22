import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {toast} from 'sonner'

export default function LoginPage() {
  const [dataUser, setDataUser] = useState({
    // name:'',
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        dataUser,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // Include credentials (cookies) with the request
        }
      );
      
      if (response.status === 200) {
        toast.success("Welcome back to your dashboard account.");
        localStorage.setItem("User_Data", JSON.stringify(response.data));
        localStorage.setItem("User_Data_token", response.data.token);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setError("Invalid email or password");
          toast.error("Invalid email or password");
        } else {
          setError("An error occurred. Please try again later.");
          console.error('Login error:', error.response.data);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please check your connection.");
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An error occurred. Please try again.");
        console.error('Error:', error.message);
      }
    }
  };

  useEffect(() => {
    if(error){
      toast.error(error)
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg border border-black/10">
        {/* Title */}
        <h2 className="text-3xl font-bold text-black text-center mb-6">
          Login
        </h2>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          {/* <div>
            <label className="block text-sm font-medium text-black mb-1">
              Name
            </label>
            <input
              type="text"
              value={dataUser.name}
              onChange={e => setData({...data,name:e.target.value})}
              placeholder="Enter your Name"
              className="w-full px-4 py-2 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              value={dataUser.email}
              onChange={(e) =>
                setDataUser({ ...dataUser, email: e.target.value })
              }
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
              value={dataUser.password}
              onChange={(e) =>
                setDataUser({ ...dataUser, password: e.target.value })
              }
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
