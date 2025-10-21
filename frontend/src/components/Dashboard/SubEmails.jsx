import React, { useEffect, useState } from "react";
import { getSubEmails } from "../../api/api";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Mail,
  Phone,
  Calendar,
  Search,
  Download,
  Users,
  AlertCircle,
  Clock,
} from "lucide-react";

function SubEmails() {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getEmails = async () => {
    try {
      const res = await getSubEmails();
      setEmails(res?.data?.emails || []);
      setFilteredEmails(res?.data?.emails || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmails();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = emails.filter(
        (item) =>
          item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails(emails);
    }
  }, [searchTerm, emails]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const exportToCSV = () => {
    const headers = ["Email", "Phone", "Created At", "Updated At"];
    const csvContent = [
      headers.join(","),
      ...filteredEmails.map(item => [
        item.email,
        item.phone || "",
        item.createdAt,
        item.updatedAt
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subscribed-emails.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedEmails = filteredEmails?.sort(
    (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Email Subscriptions
            </CardTitle>
            <CardDescription>
              Manage and view all newsletter subscribers
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              {emails.length} Total
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search emails or phone numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            Found {filteredEmails.length} of {emails.length} subscribers
          </div>
        )}

        {/* Empty State */}
        {emails?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No subscribed emails found</p>
            <p className="text-xs text-center">
              There are no email subscribers in your database yet.
            </p>
          </div>
        ) : filteredEmails?.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No subscribers found matching your search criteria.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Subscribed
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Updated
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmails?.map((item) => (
                  <TableRow key={item._id} className="group hover:bg-muted/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.email}</span>
                        <Badge 
                          variant="secondary" 
                          className="w-fit text-xs mt-1"
                        >
                          Active
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item?.phone ? (
                          <>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{item.phone}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not provided</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(item.createdAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(item.updatedAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(item.updatedAt)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Stats Summary */}
        {emails?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700">
                {emails.length}
              </p>
              <p className="text-xs text-blue-600 font-medium">Total Subscribers</p>
            </div>
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <Phone className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-700">
                {emails.filter(e => e.phone).length}
              </p>
              <p className="text-xs text-green-600 font-medium">With Phone</p>
            </div>
            <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-700">
                {emails.filter(e => new Date(e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-xs text-purple-600 font-medium">This Week</p>
            </div>
            <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Users className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-orange-700">
                {emails.filter(e => new Date(e.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-xs text-orange-600 font-medium">Today</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SubEmails;