import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ALL_GRANTED,
  DENIED_CATEGORIES,
  normalizeCategories,
  readStoredConsent,
  writeStoredConsent,
} from "../utils/consent";
import { syncConsent } from "../utils/tagLoader";

const ConsentContext = createContext({
  categories: DENIED_CATEGORIES,
  hasDecided: false,
  isBannerOpen: false,
  isPanelOpen: false,
  acceptAll: () => {},
  refuseAll: () => {},
  savePreferences: () => {},
  openPreferences: () => {},
  closePreferences: () => {},
});

export const ConsentProvider = ({ children }) => {
  // Read synchronously on first render so the banner never flashes for a
  // visitor who already decided, and so nothing gated ever runs on a frame
  // where consent is still unknown.
  const [stored, setStored] = useState(() => readStoredConsent());
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const categories = stored ? stored.categories : DENIED_CATEGORIES;
  const hasDecided = stored !== null;

  // Applies the stored decision to the tag loader on mount and on every
  // change. Denied is a meaningful state to push, not a no-op: it is what
  // sends the Consent Mode revocation when consent is withdrawn.
  useEffect(() => {
    syncConsent(categories);
  }, [categories]);

  const commit = useCallback((next) => {
    setStored(writeStoredConsent(next));
    setIsPanelOpen(false);
  }, []);

  const acceptAll = useCallback(() => commit(ALL_GRANTED), [commit]);
  const refuseAll = useCallback(() => commit(DENIED_CATEGORIES), [commit]);
  const savePreferences = useCallback(
    (next) => commit(normalizeCategories(next)),
    [commit],
  );

  const openPreferences = useCallback(() => setIsPanelOpen(true), []);
  const closePreferences = useCallback(() => setIsPanelOpen(false), []);

  const value = useMemo(
    () => ({
      categories,
      hasDecided,
      // The banner is the prompt for an undecided visitor; once the panel is
      // open it takes over, so the two are never shown at the same time.
      isBannerOpen: !hasDecided && !isPanelOpen,
      isPanelOpen,
      acceptAll,
      refuseAll,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [categories, hasDecided, isPanelOpen, acceptAll, refuseAll, savePreferences, openPreferences, closePreferences],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useConsent = () => useContext(ConsentContext);
