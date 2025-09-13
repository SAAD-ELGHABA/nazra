import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [dataUser, setDataUser] = useState({
    // name:'',
    email: "adil.nmili19@gmail.com",
    password: "password123456",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      dataUser
    );
    if (response.status === 200) {
      localStorage.setItem("User_Data", JSON.stringify(response.data));
      // localStorage.setItem('User_Data_token',JSON.stringify(response.data.token))
      localStorage.setItem("User_Data_token", response.data.token);
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      {error && (
        <p className="text-red-600 py-2 px-6  border border-red-600 bg-red-600/50 text-center capitalize text-sm">
          {error}
        </p>
      )}
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
