import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

// Hook personnalisé pour l'utiliser facilement
export const useCart = () => useContext(CartContext);

// Fournisseur de Contexte
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // Tableau des produits dans le panier
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fonction pour ajouter un produit
  const addToCart = (product) => {
    // Dans ce prototype, on ajoute un produit simple (on n'implémente pas l'incrémentation pour aller vite)
    setCartItems(prevItems => [...prevItems, { 
      ...product, 
      quantity: 1, 
      cartId: Date.now() // ID unique pour chaque ajout dans le proto
    }]);
    setIsCartOpen(true); // Ouvre le panier visuel après ajout
  };

  // Fonction pour calculer le total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Nombre d'articles (dans le badge du Header)
  const cartCount = cartItems.length;

  const value = {
    cartItems,
    addToCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    // (Ajouter remove, updateQuantity plus tard si besoin)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};