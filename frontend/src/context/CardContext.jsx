import React, { createContext, useState, useContext, useEffect } from "react";
const CardContext = createContext();

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

  const addToCard = (sunglass) => {
    setHasProductAddedToCard(true);
    setCardItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item?._id === sunglass?._id &&
          item?.colors[0]?._id === sunglass?.colors[0]?._id
      );
      if (existingItem) {
        return prev.map((item) =>
          item?._id === sunglass?._id
            ? { ...item, quantity: item?.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...sunglass, quantity: sunglass?.quantiy || 1 }];
    });
  };
  const isInCard = (id) => {
    return cardItems.some((item) => item._id === id);
  };
  const removeFromCard = (id, colorId) => {
    setCardItems((prev) =>
      prev.filter(
        (item) => !(item?._id === id && item?.colors[0]?._id === colorId)
      )
    );
  };
  const setHasProductAddedToCardEvent = () => {
    setHasProductAddedToCard(false);
  };

  const updateQuantity = (id, quantity, colorId) => {
    setCardItems((prev) =>
      prev.map((item) =>
        item?._id === id && item?.colors[0]?._id === colorId
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
