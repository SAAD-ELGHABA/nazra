import React, { createContext, useContext } from "react";

const AdminAuthContext = createContext({
  currentUser: null,
  capabilities: [],
  hasCapability: () => false,
  refreshCurrentUser: async () => {},
});

export const AdminAuthProvider = ({ children, value }) => {
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => useContext(AdminAuthContext);
