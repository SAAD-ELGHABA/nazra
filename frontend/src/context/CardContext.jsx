import React, { createContext, useState, useContext, useEffect } from "react";
const CardContext = createContext();

const getProductId = (item) => String(item?._id || item?.id || "");
const getColorId = (item) => String(item?.colors?.[0]?._id || item?.colors?.[0]?.id || item?.colors?.[0]?.name || "");
const getLensId = (item) => String(item?.lensOptionId || item?.lensOption?._id || item?.lensOption?.id || item?.selectedVariant?.lensOptionId || "");
const sameCartVariant = (left, right) => getProductId(left) === getProductId(right) && getColorId(left) === getColorId(right) && getLensId(left) === getLensId(right);

export const CardProvider = ({ children }) => {
  const [cardItems, setCardItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cardItems");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load card items from localStorage:", error);
      return [];
    }
  });
  const [hasProductAddedToCard, setHasProductAddedToCard] = useState(false);
  useEffect(() => {
    localStorage.setItem("cardItems", JSON.stringify(cardItems));
  }, [cardItems]);

  const addToCard = (sunglass, { showConfirmation = true } = {}) => {
    if (showConfirmation) setHasProductAddedToCard(true);
    setCardItems((prev) => {
      const existingItem = prev.find((item) => sameCartVariant(item, sunglass));
      const amount = Math.max(1, Number(sunglass?.quantity ?? sunglass?.quantiy) || 1);
      const stockValue = sunglass?.selectedVariant?.stock;
      const stock = stockValue !== null && stockValue !== undefined && stockValue !== "" && Number.isFinite(Number(stockValue))
        ? Number(stockValue)
        : null;
      const max = stock === null ? Number.MAX_SAFE_INTEGER : Math.max(1, stock);
      if (existingItem) {
        return prev.map((item) =>
          sameCartVariant(item, sunglass)
            ? { ...item, quantity: Math.min(max, (Number(item?.quantity) || 1) + amount) }
            : item
        );
      }
      return [...prev, { ...sunglass, quantity: Math.min(max, amount) }];
    });
  };
  const isInCard = (id, colorId, lensOptionId) => {
    return cardItems.some((item) => getProductId(item) === String(id) && (colorId === undefined || getColorId(item) === String(colorId)) && (lensOptionId === undefined || getLensId(item) === String(lensOptionId || "")));
  };
  const removeFromCard = (id, colorId, lensOptionId) => {
    setCardItems((prev) =>
      prev.filter(
        (item) => !(getProductId(item) === String(id) && getColorId(item) === String(colorId || "") && (lensOptionId === undefined || getLensId(item) === String(lensOptionId || "")))
      )
    );
  };
  const setHasProductAddedToCardEvent = () => {
    setHasProductAddedToCard(false);
  };

  const updateQuantity = (id, quantity, colorId, lensOptionId) => {
    setCardItems((prev) =>
      prev.map((item) =>
        getProductId(item) === String(id) && getColorId(item) === String(colorId || "") && (lensOptionId === undefined || getLensId(item) === String(lensOptionId || ""))
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  return (
    <CardContext.Provider
      value={{ cardItems, addToCard, removeFromCard, updateQuantity, isInCard ,setHasProductAddedToCardEvent,hasProductAddedToCard}}
    >
      {children}
    </CardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCard = () => useContext(CardContext);
