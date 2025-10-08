import React, { useEffect, useState } from "react";
import { getVisitors } from "../../api/api";

const VisitorAnalyticsTable = () => {
  const [byBrowser, setByBrowser] = useState([]);
  const [byReferrer, setByReferrer] = useState([]);
  const [loading, setLoading] = useState(true);

  const allBrowsers = ["Chrome", "Firefox", "Safari", "Edge", "Other"];
  const allReferrers = ["direct", "facebook.com", "instagram.com", "tiktok.com", "twitter.com", "linkedin.com", "youtube.com", "other"];

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        const res = await getVisitors();
        const visits = res?.data?.views || [];

        const getBrowser = (ua) => {
          if (!ua) return "Other";
          if (ua.includes("Chrome")) return "Chrome";
          if (ua.includes("Firefox")) return "Firefox";
          if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
          if (ua.includes("Edge")) return "Edge";
          return "Other";
        };

        const browserGrouped = {};
        visits.forEach((v) => {
          const browser = getBrowser(v.userAgent);
          const id = v.visitorId || v.ipAddress;
          if (!browserGrouped[browser]) browserGrouped[browser] = new Set();
          browserGrouped[browser].add(id);
        });

        const browserData = allBrowsers.map((browser) => ({
          browser,
          visitors: browserGrouped[browser]?.size || 0,
        }));

        const referrerGrouped = {};
        visits.forEach((v) => {
          let ref = "direct";
          if (v.referrer && v.referrer !== "") {
            try {
              const url = new URL(v.referrer);
              ref = url.hostname.replace("www.", "");
            } catch {
              ref = v.referrer;
            }
          }
          if (!allReferrers.includes(ref)) ref = "other";
          const id = v.visitorId || v.ipAddress;
          if (!referrerGrouped[ref]) referrerGrouped[ref] = new Set();
          referrerGrouped[ref].add(id);
        });

        const referrerData = allReferrers.map((ref) => ({
          referrer: ref,
          visitors: referrerGrouped[ref]?.size || 0,
        }));

        setByBrowser(browserData);
        setByReferrer(referrerData);
      } catch (err) {
        console.error("Error fetching visitor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);


  if (loading) return <div>Loading visitor analytics...</div>;

  const iconStyle = "w-5 h-5 text-gray-400";

  const getBrowserIcon = (browser) => {
    switch (browser) {
      case "Chrome": return <img src="https://img.icons8.com/ios-filled/50/808080/chrome.png" className={iconStyle} alt="Chrome" />;
      case "Firefox": return <img src="https://img.icons8.com/ios-filled/50/808080/firefox.png" className={iconStyle} alt="Firefox" />;
      case "Safari": return <img src="https://img.icons8.com/ios-filled/50/808080/safari.png" className={iconStyle} alt="Safari" />;
      case "Edge": return <img src="https://img.icons8.com/ios-filled/50/808080/edge.png" className={iconStyle} alt="Edge" />;
      default: return <img src="https://img.icons8.com/ios-filled/50/808080/laptop.png" className={iconStyle} alt="Other" />;
    }
  };

  const getReferrerIcon = (ref) => {
    const domain = ref.toLowerCase();
    if (domain.includes("facebook")) return <img src="https://img.icons8.com/ios-filled/50/808080/facebook-new.png" className={iconStyle} alt="Facebook" />;
    if (domain.includes("instagram")) return <img src="https://img.icons8.com/ios-filled/50/808080/instagram-new.png" className={iconStyle} alt="Instagram" />;
    if (domain.includes("tiktok")) return <img src="https://img.icons8.com/ios-filled/50/808080/tiktok.png" className={iconStyle} alt="TikTok" />;
    if (domain.includes("twitter")) return <img src="https://img.icons8.com/ios-filled/50/808080/twitter.png" className={iconStyle} alt="Twitter" />;
    if (domain.includes("linkedin")) return <img src="https://img.icons8.com/ios-filled/50/808080/linkedin.png" className={iconStyle} alt="LinkedIn" />;
    if (domain.includes("youtube")) return <img src="https://img.icons8.com/ios-filled/50/808080/youtube-play.png" className={iconStyle} alt="YouTube" />;
    if (domain === "direct") return <img src="https://img.icons8.com/ios-filled/50/808080/laptop.png" className={iconStyle} alt="Direct" />;
    return <img src="https://img.icons8.com/ios-filled/50/808080/domain.png" className={iconStyle} alt={ref} />;
  };

  return (
    <div className="flex flex-col items-start justify-center gap-6">
    {/* <SectionCard title="" > */}
    <h1>
Visitors by Referrer / Source
    </h1>
  <table className="w-full border border-gray-200 text-center ">
    <thead className="bg-gray-100">
      <tr>
        {byReferrer.map((r) => (
          <th key={r.referrer} className="p-2">{r.referrer}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr>
        {byReferrer.map((r) => (
          <td key={r.referrer} className="p-2 ">
            <div className="flex items-center justify-center gap-2">
              
            {getReferrerIcon(r.referrer)}

            <span>{r.visitors}
            </span>
            </div>
            </td>
        ))}
      </tr>
    </tbody>
  </table>
    <h1>
Visitors by Browser / Device
    </h1>
  <table className="w-full border border-gray-200 text-center ">
    <thead className="bg-gray-100">
      <tr>
        {byBrowser.map((b) => (
          <th key={b.browser} className="p-2">{b.browser}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr>
        {byBrowser.map((b) => (
          <td key={b.browser} className="p-2">            
          <div className="flex items-center justify-center gap-2">
              
            {getBrowserIcon(b.browser)}

            <span>{b.visitors}
            </span>
            </div></td>
        ))}
      </tr>
    </tbody>
  </table>




    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="bg-white shadow rounded p-4 md:p-6">
    <h2 className="text-lg md:text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default VisitorAnalyticsTable;
