import { Hand, InspectionPanel, Sun } from "lucide-react";
import React from "react";

function FeaturesSection() {
  return (
    <div className="flex flex-col p-4 md:p-10 gap-6 items-center justify-center">
      <div>
        <h1
          className="font-bold text-[28px] md:text-left md:text-[56px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" }}
        >
          FEATURES
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4 w-full  mt-6">
        <div className="flex flex-col items-center gap-4 ">
          <InspectionPanel className="h-10 w-10" />
          <h3
            className="font-bold text-[20px] text-center md:text-left md:text-[36px]"
            style={{ lineHeight: "1.2", letterSpacing: "4px" }}
          >
            Premium Materials
          </h3>
          <h4 className="text-center">
            Crafted with the filiest nalenista for outability and diagance.
          </h4>
        </div>
        <div className="flex flex-col items-center gap-4 ">
          <Hand className="h-10 w-10" />
          <h3
            className="font-bold text-[20px] text-center md:text-left md:text-[36px]"
            style={{ lineHeight: "1.2", letterSpacing: "4px" }}
          >
            Handcrafed Quality
          </h3>
          <h4>Experity crafted with attention to detail</h4>
        </div>
        <div className="flex flex-col items-center gap-4 ">
          <Sun className="h-10 w-10" />
          <h3
            className="font-bold text-[20px] text-center md:text-left md:text-[36px]"
            style={{ lineHeight: "1.2", letterSpacing: "4px" }}
          >
            UV Protection
          </h3>
          <h4>Advanced UV protection</h4>
        </div>
      </div>
    </div>
  );
}

export default FeaturesSection;
