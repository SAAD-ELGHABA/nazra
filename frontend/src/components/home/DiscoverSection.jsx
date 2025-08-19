import React from "react";

function DiscoverSection() {
  return (
    <div className="grid md:grid-cols-2 items-center md:p-10 p-4 w-full min-h-screen overflow-hidden gap-8">
      <div className="flex flex-col md:gap-12 gap-4 ">
        <h1
          className="font-bold text-[24px] md:text-[40px] w-full max-w-3xl"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          Discover Our Exclusive Collection of Best-Selling Sunglasses for Every
          Occasion
        </h1>
        <h5>
          Elevate your style with our premium sunglasses that blend luxury and
          functionality. Each pair is crafted to provide exceptional UV
          protection while making a bold fashion statement.
        </h5>
        <div className="flex items-center justify-center gap-4">
          <div>
            <h3
              className="font-medium text-[16px] md:text-[25px] w-full"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              Trending Styles
            </h3>
            <p>
              Explore our top picks that redefine elegance and sophistication in
              eyewear.
            </p>
          </div>
          <div>
            <h3
              className="font-medium text-[16px] md:text-[25px] w-full"
              style={{ lineHeight: "1.2", letterSpacing: "4px" }}
            >
              Quality Craftsmanship
            </h3>
            <p>
              Experience unparalleled quality with sunglasses designed for
              durability and style.
            </p>
          </div>
        </div>
      </div>
      <div>
        <img
          src="/discover-section.png"
          alt="exp-section-img"
          className="w-full  object-cover "
        />
      </div>
    </div>
  );
}

export default DiscoverSection;
