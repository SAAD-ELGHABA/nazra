import React, { useState } from 'react';

const CreateAdminModal = ({ isOpen, onClose, onCreateAdmin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' // Default and disabled value
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onCreateAdmin(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform transition-all">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-white rounded-3xl blur-xl opacity-50"></div>
        
        <div className="relative bg-white border border-gold-500/30 rounded-2xl shadow-2xl shadow-gold-500/10 backdrop-blur-sm overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-gold-500/20 bg-white px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/30">
                  <span className="text-lg">👑</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gold-300 font-serif">
                    Create Admin
                  </h2>
                  <p className="text-black text-sm font-light">
                    Add a new administrator to the system
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-gold-200 hover:text-gold-100 hover:bg-gold-500/20 rounded-full transition-all duration-200"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-2">
            {errors.submit && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-200 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-gold-200 text-sm font-medium mb-2 font-serif">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-gray-100 border ${
                    errors.name ? 'border-red-500/50' : 'border-gold-500/30'
                  } rounded-xl px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200 backdrop-blur-sm`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-red-400 text-sm">⚠</span>
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs mt-2">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gold-200 text-sm font-medium mb-2 font-serif">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-gray-100 border ${
                    errors.email ? 'border-red-500/50' : 'border-gold-500/30'
                  } rounded-xl px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200 backdrop-blur-sm`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-red-400 text-sm">⚠</span>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gold-200 text-sm font-medium mb-2 font-serif">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-gray-100 border ${
                    errors.password ? 'border-red-500/50' : 'border-gold-500/30'
                  } rounded-xl px-4 py-3 text-black placeholder-slate-400 focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200 backdrop-blur-sm`}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-red-400 text-sm">⚠</span>
                  </div>
                )}
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-2">{errors.password}</p>
              )}
              <p className="text-slate-400 text-xs mt-2">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Role Field (Disabled) */}
            <div>
              <label className="block text-gold-200 text-sm font-medium mb-2 font-serif">
                Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                  className="w-full bg-gray-100 border border-gold-500/20 rounded-xl px-4 py-3 text-black cursor-not-allowed backdrop-blur-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-gold-400 text-sm">👑</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Administrator role is automatically assigned
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-red-700/80 hover:bg-red-800/80 border border-slate-500/30 text-slate-200 py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-800 hover:from-gold-400 hover:bg-slate-950 text-slate-100 py-3 px-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-gold-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminModal;