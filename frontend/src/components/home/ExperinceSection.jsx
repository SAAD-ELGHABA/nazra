import { Kanban } from "lucide-react";
import React from "react";

function ExperinceSection() {
  const list = [
    "Elevate your style with our chic sunglasses.",
    "Durable craftsmanship for everyday elegance and comfort.",
    "Protect your eyes without compromising on style.",
  ];
  return (
    <div className="grid md:grid-cols-2 items-center md:flex-row md:p-10 p-4  w-full min-h-screen overflow-hidden gap-4">
      <div className="flex flex-col md:gap-12 gap-4 ">
        <h1
          className="font-bold text-[24px] md:text-[40px] w-full max-w-3xl"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          Experience Unmatched Style and Protection with Our Premium Sunglasses
          Collection
        </h1>
        <h5>
          Our sunglasses are designed to elevate your fashion game while
          ensuring your eyes are protected from harmful UV rays. Crafted from
          durable materials, they combine luxury with long-lasting wear.
        </h5>
        <ul>
          {list?.map((l, index) => (
            <li key={index} className="flex items-center gap-4">
              <Kanban />
              <p>{l}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <img src="/experience-section.png" alt="exp-section-img" className="w-full  object-cover " />
      </div>
    </div>
  );
}

export default ExperinceSection;
