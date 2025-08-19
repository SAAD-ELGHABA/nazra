import { Webhook } from "lucide-react";
import React from "react";

function WebflowSection() {
  return (
    <div className="md:p-10 p-4 w-full flex flex-col items-center gap-8">
      <div className="flex items-center gap-3">
        <Webhook />
        <h3 className="font-semibold">Webflow</h3>
      </div>
      <div className="md:w-2/5">
        <p className="text-center font-semibold">
          "These sunglasses not only elevate my style but also provide
          exceptional UV protection. I can't imagine my summer without them!"
        </p>
      </div>
      <img src="/Avatar Image.png" alt="" className="w-12 h-12 rounded-full" />
      <div className="text-sm">
        <h5 className="font-medium">Emily Johnson</h5>
        <h5>Fashion Blogger</h5>
      </div>
    </div>
  );
}

export default WebflowSection;
