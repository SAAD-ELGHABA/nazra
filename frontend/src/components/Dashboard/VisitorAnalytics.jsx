import React, { useEffect, useState } from "react";
import { getVisitors } from "../../api/api";

const VisitorAnalyticsTable = () => {
  const [byBrowser, setByBrowser] = useState([]);
  const [byReferrer, setByReferrer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        const res = await getVisitors();
        const visits = res?.data?.views || [];

        // Browser grouping
        const getBrowser = (ua) => {
          if (!ua) return "Unknown";
          if (ua.includes("Chrome")) return "Chrome";
          if (ua.includes("Firefox")) return "Firefox";
          if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
          if (ua.includes("Edge")) return "Edge";
          return "Other";
        };

        const browserGrouped = {};
        visits.forEach((v) => {
          const browser = getBrowser(v.userAgent);
          const id = v.visitorId || v.ipAddress; // unique user identifier
          if (!browserGrouped[browser]) browserGrouped[browser] = new Set();
          browserGrouped[browser].add(id);
        });

        const browserData = Object.keys(browserGrouped).map((browser) => ({
          browser,
          visitors: browserGrouped[browser].size,
        }));

        // Referrer grouping
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
          const id = v.visitorId || v.ipAddress; // unique user identifier
          if (!referrerGrouped[ref]) referrerGrouped[ref] = new Set();
          referrerGrouped[ref].add(id);
        });

        const referrerData = Object.keys(referrerGrouped).map((ref) => ({
          referrer: ref,
          visitors: referrerGrouped[ref].size,
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

  // Gray icons
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Browser table */}
      <SectionCard title="Visitors by Browser / Device">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Browser</th>
              <th className="p-2 text-left">Unique Visitors</th>
            </tr>
          </thead>
          <tbody>
            {byBrowser.map((b) => (
              <tr key={b.browser} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-2 flex items-center gap-2">{getBrowserIcon(b.browser)}{b.browser || "Unknown"}</td>
                <td className="p-2">{b.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Referrer table */}
      <SectionCard title="Visitors by Referrer / Source">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Unique Visitors</th>
            </tr>
          </thead>
          <tbody>
            {byReferrer.map((r) => (
              <tr key={r.referrer} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-2 flex items-center gap-2">{getReferrerIcon(r.referrer)}{r.referrer || "direct"}</td>
                <td className="p-2">{r.visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
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
