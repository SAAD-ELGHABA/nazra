import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AdminPageContext = createContext(null);

const defaultPageState = {
  breadcrumbs: [],
  contextActions: null,
  lastUpdated: null,
  isRefreshing: false,
};

export function AdminPageProvider({ children }) {
  const [pageState, setPageState] = useState(defaultPageState);

  const setPageContext = useCallback((next) => {
    setPageState((previous) => ({ ...previous, ...next }));
  }, []);

  const resetPageContext = useCallback(() => {
    setPageState(defaultPageState);
  }, []);

  const value = useMemo(
    () => ({
      ...pageState,
      setPageContext,
      resetPageContext,
    }),
    [pageState, setPageContext, resetPageContext],
  );

  return (
    <AdminPageContext.Provider value={value}>
      {children}
    </AdminPageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminPageContext = () => useContext(AdminPageContext);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminPageMeta(meta = {}) {
  const context = useAdminPageContext();
  const latestMeta = React.useRef(meta);
  latestMeta.current = meta;

  const breadcrumbsKey = JSON.stringify(
    (meta.breadcrumbs ?? []).map(({ label, href }) => ({ label, href })),
  );
  const setPageContext = context?.setPageContext;
  const resetPageContext = context?.resetPageContext;

  React.useEffect(() => {
    if (!setPageContext || !resetPageContext) return undefined;
    const currentMeta = latestMeta.current;

    setPageContext({
      breadcrumbs: currentMeta.breadcrumbs ?? [],
      contextActions: currentMeta.contextActions ?? null,
      lastUpdated: currentMeta.lastUpdated ?? null,
      isRefreshing: currentMeta.isRefreshing ?? false,
    });

    const baseTitle = currentMeta.documentTitle || currentMeta.title;
    document.title = baseTitle ? `${baseTitle} | NAZRA Admin` : "NAZRA Admin";

    return () => {
      resetPageContext();
      document.title = "NAZRA Admin";
    };
  }, [
    setPageContext,
    resetPageContext,
    breadcrumbsKey,
    meta.contextActions,
    meta.documentTitle,
    meta.title,
    meta.lastUpdated,
    meta.isRefreshing,
  ]);
}
