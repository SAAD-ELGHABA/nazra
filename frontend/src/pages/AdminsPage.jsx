import React, { useEffect, useState } from "react";
import { createAdmin, getAdmins } from "../api/api";
import { UserPlus, Users, Crown, Mail, Shield } from "lucide-react";
import CreateAdminModal from "../components/CreateAdminModal";
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Search } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAdminAuth();

  useEffect(() => { 
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = admins.filter(admin =>
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAdmins(filtered);
    } else {
      setFilteredAdmins(admins);
    }
  }, [searchTerm, admins]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdmins();
      const adminsData = Array.isArray(res?.data?.users)
        ? res.data?.users
        : [];
      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "You do not have permission to manage administrators."
          : err?.response?.data?.message || "Failed to fetch admins"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (adminData) => {
    try {
      const response = await createAdmin(adminData);
      
      if (response.status === 201) {
        toast.success('Admin added successfully!', {
          description: `Welcome ${adminData.name} to the admin team`,
        });
        await fetchUsers();
      } else {
        toast.error('Failed to create admin', {
          description: 'Server returned an unexpected response',
        });
      }
      
      return response;
    } catch (error) {
      toast.error('Failed to create admin', {
        description: error.response?.data?.message || 'Please try again',
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            Administrators
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your team of administrators and their permissions
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search admins by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Team</CardTitle>
              <CardDescription>
                {filteredAdmins.length} of {admins.length} administrators
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAdmins.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Admin</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin._id} className="group">
                      <TableCell>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-white">
                            {admin.name?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {admin.name || "Administrator"}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <Crown className="h-3 w-3 text-amber-500" />
                            <Badge variant="outline" className="text-xs">
                              Administrator
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{admin.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {admin.role || "Administrator"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-xs">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">No administrators found</p>
              <p className="text-xs text-center mb-4">
                {searchTerm 
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first administrator"
                }
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Admin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid View Alternative */}
      {filteredAdmins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <AdminCard key={admin._id} admin={admin} />
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {admins.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-700">{admins.length}</p>
            <p className="text-xs text-blue-600 font-medium">Total Admins</p>
          </div>
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-700">{admins.length}</p>
            <p className="text-xs text-green-600 font-medium">Active</p>
          </div>
          <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Crown className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-amber-700">
              {admins.filter(a => a.role?.toLowerCase().includes('super')).length}
            </p>
            <p className="text-xs text-amber-600 font-medium">Super Admins</p>
          </div>
          <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <Mail className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-purple-700">
              {new Set(admins.map(a => a.email?.split('@')[1])).size}
            </p>
            <p className="text-xs text-purple-600 font-medium">Domains</p>
          </div>
        </div>
      )}

      <CreateAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateAdmin={handleCreateAdmin}
        currentUser={currentUser}
      />
    </div>
  );
};

export const AdminCard = ({ admin }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-300">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-lg font-bold text-white">
                {admin.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                <Crown className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
            {admin.name || "Administrator"}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default" className="text-xs">
              ADMIN
            </Badge>
            <Badge variant="outline" className="text-xs">
              {admin.role || "Administrator"}
            </Badge>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm text-muted-foreground w-full">
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="truncate">{admin.email}</span>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminsPage;
