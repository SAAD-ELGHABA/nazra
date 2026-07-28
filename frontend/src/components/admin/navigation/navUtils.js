const hasRequiredCapability = (requiredCapability, capabilitySet) => {
  if (!requiredCapability) return true;
  const required = Array.isArray(requiredCapability)
    ? requiredCapability
    : [requiredCapability];
  return required.every((capability) => capabilitySet.has(capability));
};

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
        if (!hasRequiredCapability(entry.requiredCapability, capabilitySet)) {
          return null;
        }
        return entry;
      }

      if (!Array.isArray(entry.items)) return null;

      const visibleItems = entry.items.filter(
        (item) => hasRequiredCapability(item.requiredCapability, capabilitySet),
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
