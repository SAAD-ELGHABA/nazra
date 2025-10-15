import React, { useEffect, useState } from "react";
import { createAdmin, getAdmins } from "../api/api";
import { UserPlus } from "lucide-react";
import CreateAdminModal from "../components/CreateAdminModal";
import { toast } from 'sonner'

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { 
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await getAdmins();
        // Ensure we're working with an array
        const adminsData = Array.isArray(res?.data?.users)
          ? res.data?.users
          : [];
        setAdmins(adminsData);
      } catch (err) {
        setError("Failed to fetch admins");
        console.error("Error fetching admins:", err);
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gold-200 text-lg font-light">
            Loading Administrators...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-red-200 text-xl font-light">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 relative">
      <button 
        onClick={()=>setIsModalOpen(true)}
        className="absolute top-2 right-2 p-2 bg-slate-800 rounded-xl shadow-md hover:bg-slate-950 hover:scale-105">
        <UserPlus size={20} className="text-slate-100" />
      </button>

      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-800 to-gold-500 mb-4">
          Administrators
        </h1>
        <p className="text-gray-800 text-lg font-light max-w-2xl mx-auto">
          Meet our distinguished team of administrators who ensure seamless
          operations and excellence across all platforms.
        </p>
      </div>

      {/* Admins Grid */}
      {admins.length > 0 ? (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-content-center">
            {admins.map((admin) => (
              <AdminCard key={admin._id} admin={admin} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-slate-800/30 border border-gold-500/30 rounded-2xl p-12 backdrop-blur-sm max-w-md mx-auto">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-gold-200 text-2xl font-light mb-2">
              No Administrators Found
            </h3>
            <p className="text-purple-200 font-light">
              There are currently no administrators to display.
            </p>
          </div>
        </div>
      )}

       <CreateAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateAdmin={handleCreateAdmin}
      />
    </div>
  );
};

export const AdminCard = ({ admin }) => {
  return (
    <div className="group relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-purple-600/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

      {/* Card */}
      <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-gold-500/30 rounded-2xl p-8 backdrop-blur-sm transform transition-all duration-500 group-hover:scale-105 group-hover:border-gold-400/50 group-hover:shadow-2xl group-hover:shadow-gold-500/10 overflow-hidden">
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Avatar Placeholder with Crown */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-2xl shadow-gold-500/30">
              <span className="text-2xl font-bold text-slate-100">
                {admin.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-3xl">
              👑
            </div>
          </div>

          {/* Admin Info */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gold-300 mb-2 font-serif text-slate-100 uppercase">
              {admin.name || "Administrator"}
            </h2>

            {/* Role Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 mb-4">
              <div className="w-2 h-2 bg-gold-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-gold-200 text-sm font-medium tracking-wide">
                ADMINISTRATOR
              </span>
            </div>

            {/* Additional Info */}
            {admin.email && (
              <p className="text-purple-200 text-sm font-light mb-2 truncate">
                {admin.email}
              </p>
            )}

            {admin.role && (
              <p className="text-gold-800/80 text-xs font-light italic">
                {admin.role}
              </p>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 opacity-30">
            <div className="w-8 h-8 border-2 border-gold-400 rounded-full"></div>
          </div>
          <div className="absolute bottom-4 left-4 opacity-30">
            <div className="w-6 h-6 border border-gold-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminsPage;
