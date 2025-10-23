import React, { useEffect, useState } from "react";
import { getVisitors } from "../../api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaGlobe,
  FaUsers,
  FaChrome,
  FaSafari,
  FaFirefox,
  FaEdge,
  FaLaptop,
  FaLink,
  FaFacebook,
  FaInstagram,
 FaYoutube,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

const VisitorAnalyticsTable = () => {
  const [byBrowser, setByBrowser] = useState([]);
  const [byReferrer, setByReferrer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("referrers");

  const allBrowsers = ["Chrome", "Firefox", "Safari", "Edge", "Other"];
  const allReferrers = [
    "direct", 
    "facebook.com", 
    "instagram.com", 
    "tiktok.com", 
    "twitter.com", 
    "linkedin.com", 
    "youtube.com", 
    "other"
  ];

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

  const getBrowserIcon = (browser) => {
    const iconClass = "h-4 w-4";
    switch (browser) {
      case "Chrome":
        return <FaChrome className={iconClass} />;
      case "Firefox":
        return <FaFirefox className={iconClass} />;
      case "Safari":
        return <FaSafari className={iconClass} />;
      // case "Edge":
      //   return <Edge className={iconClass} />;
      default:
        return <FaLaptop className={iconClass} />;
    }
  };

  const getReferrerIcon = (ref) => {
    const iconClass = "h-4 w-4";
    const domain = ref.toLowerCase();
    if (domain.includes("facebook")) return <FaFacebook className={iconClass} />;
    if (domain.includes("instagram")) return <FaInstagram className={iconClass} />;
    if (domain.includes("tiktok")) return <FaYoutube className={iconClass} />; // Using Youtube as TikTok alternative
    if (domain.includes("twitter")) return <FaTwitter className={iconClass} />;
    if (domain.includes("linkedin")) return <FaLinkedin className={iconClass} />;
    if (domain.includes("youtube")) return <FaYoutube className={iconClass} />;
    if (domain === "direct") return <FaLink className={iconClass} />;
    return <FaGlobe className={iconClass} />;
  };

  const formatReferrerName = (referrer) => {
    if (referrer === "direct") return "Direct Traffic";
    if (referrer === "other") return "Other Sources";
    return referrer.replace(".com", "");
  };

  const getTotalVisitors = (data) => {
    return data.reduce((sum, item) => sum + item.visitors, 0);
  };

  const getPercentage = (visitors, total) => {
    return total > 0 ? (visitors / total) * 100 : 0;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalReferrerVisitors = getTotalVisitors(byReferrer);
  const totalBrowserVisitors = getTotalVisitors(byBrowser);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <FaUsers className="h-5 w-5 text-purple-500" />
              Visitor Analytics
            </CardTitle>
            <CardDescription>
              Traffic sources and browser distribution
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            <FaUsers className="h-3 w-3 mr-1" />
            {totalReferrerVisitors} Total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="referrers" className="flex items-center gap-2">
              <FaGlobe className="h-4 w-4" />
              Traffic Sources
            </TabsTrigger>
            <TabsTrigger value="browsers" className="flex items-center gap-2">
              <FaLaptop className="h-4 w-4" />
              Browser Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrers" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Source</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byReferrer
                    .filter(item => item.visitors > 0)
                    .sort((a, b) => b.visitors - a.visitors)
                    .map((item, index) => (
                      <TableRow key={item.referrer}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getReferrerIcon(item.referrer)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-medium capitalize">
                              {formatReferrerName(item.referrer)}
                            </span>
                            {item.referrer !== "direct" && item.referrer !== "other" && (
                              <Badge variant="outline" className="text-xs">
                                {item.referrer}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.visitors}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-secondary rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${getPercentage(item.visitors, totalReferrerVisitors)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12">
                              {getPercentage(item.visitors, totalReferrerVisitors).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {byReferrer.filter(item => item.visitors > 0).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FaGlobe className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">No referral data</p>
                <p className="text-xs text-center">
                  No visitor data available for the selected period.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browsers" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Browser</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Visitors</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byBrowser
                    .filter(item => item.visitors > 0)
                    .sort((a, b) => b.visitors - a.visitors)
                    .map((item, index) => (
                      <TableRow key={item.browser}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getBrowserIcon(item.browser)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.browser}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.visitors}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-secondary rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${getPercentage(item.visitors, totalBrowserVisitors)}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12">
                              {getPercentage(item.visitors, totalBrowserVisitors).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {byBrowser.filter(item => item.visitors > 0).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FaLaptop className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm font-medium mb-1">No browser data</p>
                <p className="text-xs text-center">
                  No browser data available for the selected period.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {(byReferrer.filter(item => item.visitors > 0).length > 0 || 
         byBrowser.filter(item => item.visitors > 0).length > 0) && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
            <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <FaGlobe className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-700">
                {totalReferrerVisitors}
              </p>
              <p className="text-xs text-purple-600 font-medium">Total Visitors</p>
            </div>
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FaLaptop className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {byBrowser.filter(item => item.visitors > 0).length}
              </p>
              <p className="text-xs text-blue-600 font-medium">Browsers Used</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitorAnalyticsTable;