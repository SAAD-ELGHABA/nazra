import React from "react";

function StorySection() {
  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 gap-6 items-center justify-center">
      <div className="md:w-1/2 md:h-100 overflow-hidden flex items-center">
        <img src="/About/about-story-img.png" alt="luxury-img" />
      </div>
      <div className="flex flex-col gap-4 md:w-1/2">
        <h1
          className="font-bold text-[28px] md:text-left md:text-[46px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          About Our Story
        </h1>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book
        </p>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book
        </p>
      </div>
    </div>
  );
}

export default StorySection;
