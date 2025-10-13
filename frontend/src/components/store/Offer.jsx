import React, { useEffect, useState } from "react";

function Offer() {
  // Set your offer end time (example: 24 hours from now)
  const offerEndTime = new Date().getTime() + 24 * 60 * 60 * 1000;

  const [timeLeft, setTimeLeft] = useState(offerEndTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(offerEndTime - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [offerEndTime]);

  // Calculate hours, minutes, seconds
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const isExpired = timeLeft <= 0;

  return (
    <div className="h-[20vh] bg-gradient-to-r from-black/10 via-black to-black/10 text-white flex flex-col items-center justify-center  mb-8 shadow-lg">
      {!isExpired ? (
        <>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">
            🔥 Limited-Time Offer!
          </h2>
          <p className="text-lg md:text-2xl font-mono">
            Ends in{" "}
            <span className="text-red-500 font-semibold">
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </span>
          </p>
          <span className="text-yellow-500">comming soon</span>
        </>
      ) : (
        <h2 className="text-2xl md:text-3xl font-bold text-red-400">
          Offer expired 😢
        </h2>
      )}
    </div>
  );
}

export default Offer;
