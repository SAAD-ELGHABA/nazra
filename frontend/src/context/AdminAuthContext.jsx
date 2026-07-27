import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../constant/routerConstants";
import { clearAuthStorage } from "../utils/auth";

const AdminAuthContext = createContext({
  currentUser: null,
  capabilities: [],
  hasCapability: () => false,
  refreshCurrentUser: async () => {},
  logout: async () => {},
});

export const AdminAuthProvider = ({ children, value }) => {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      clearAuthStorage();
    } finally {
      navigate(LOGIN, { replace: true });
    }
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      currentUser: value?.currentUser ?? null,
      capabilities: value?.capabilities ?? [],
      hasCapability: value?.hasCapability ?? (() => false),
      refreshCurrentUser:
        value?.refreshCurrentUser ?? (async () => {}),
      logout,
    }),
    [value, logout],
  );

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => useContext(AdminAuthContext);
