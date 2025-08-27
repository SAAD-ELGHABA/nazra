import React, { useEffect } from "react";
import FAQs from "../components/FAQs";

export default function HelpCenter() {
  useEffect(() => {
    document.title = "Help Center - Nazra";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <section className="w-full bg-black text-white py-16 px-6 md:px-12 lg:px-20">
      <div></div>
      <div>
        <FAQs color={`white`}/>
      </div>
    </section>
  );
}
