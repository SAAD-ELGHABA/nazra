export const isNavItemActive = (pathname, item) => {
  if (!item?.href) return false;

  const href = item.href;
  const patterns = item.activeMatchPatterns?.length
    ? item.activeMatchPatterns
    : [href];

  if (item.exactMatch) {
    return patterns.some((pattern) => pathname === pattern);
  }

  return patterns.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
};

export const filterNavigationByCapabilities = (navigation, capabilities = []) => {
  const capabilitySet = new Set(capabilities);

  return navigation
    .map((entry) => {
      if (entry.href) {
        if (entry.requiredCapability && !capabilitySet.has(entry.requiredCapability)) {
          return null;
        }
        return entry;
      }

      if (!Array.isArray(entry.items)) return null;

      const visibleItems = entry.items.filter(
        (item) => !item.requiredCapability || capabilitySet.has(item.requiredCapability),
      );

      if (visibleItems.length === 0) return null;

      return { ...entry, items: visibleItems };
    })
    .filter(Boolean);
};

export const findActiveNavigationItem = (pathname, navigation) => {
  const items = [];

  navigation.forEach((entry) => {
    if (entry.href) items.push(entry);
    if (entry.items) items.push(...entry.items);
  });

  return items.find((item) => isNavItemActive(pathname, item)) ?? null;
};
