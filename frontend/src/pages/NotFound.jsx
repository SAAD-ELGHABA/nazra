import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function NotFound() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1
        className="font-bold text-[32px] text-center md:text-left md:text-[56px]"
        style={{ lineHeight: "1.2", letterSpacing: "4px" }}
      >
        404
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="px-6 py-2 border rounded hover:bg-black hover:text-white transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
