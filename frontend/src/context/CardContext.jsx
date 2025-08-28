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

  useEffect(() => {
    localStorage.setItem("cardItems", JSON.stringify(cardItems));
  }, [cardItems]);

  const addToCard = (sunglass) => {
    setCardItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.id === sunglass.id && item.colors[0] === sunglass.colors[0]
      );
      if (existingItem) {
        return prev.map((item) =>
          item.id === sunglass.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...sunglass, quantity: sunglass.quantiy || 1 }];
    });
  };
  const isInCard = (id) => {
    return cardItems.some((item) => item.id === id);
  };
  const removeFromCard = (id, color) => {

    setCardItems((prev) =>
      prev.filter(
        (item) => !(item.id === id && item?.colors[0]?.name === color)
      )
    );
  };

  const updateQuantity = (id, quantity) => {
    setCardItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  return (
    <CardContext.Provider
      value={{ cardItems, addToCard, removeFromCard, updateQuantity, isInCard }}
    >
      {children}
    </CardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCard = () => useContext(CardContext);
