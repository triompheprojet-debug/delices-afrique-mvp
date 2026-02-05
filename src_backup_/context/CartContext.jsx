import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- GESTION CODE PROMO (CORRIGÉ) ---
  const [promo, setPromo] = useState({
    code: null, 
    discountAmount: 0, 
    partnerId: null, 
    partnerLevel: null,
    partnerCommission: 0, // ✅ Commission réelle du partenaire (calculée selon les règles)
    platformGain: 0 // ✅ Gain plateforme (calculé selon les règles)
  });

  // --- GESTION CONFLIT VENDEUR (Logique Continental) ---
  const [vendorConflict, setVendorConflict] = useState({
    isOpen: false,      // La modale est-elle ouverte ?
    pendingProduct: null // Le produit que le client essayait d'ajouter
  });

  const applyPromo = (promoData) => {
    setPromo({
        code: promoData.code,
        discountAmount: promoData.discountAmount,
        partnerId: promoData.partnerId,
        partnerLevel: promoData.partnerLevel,
        partnerCommission: promoData.partnerCommission || 0, // ✅ Ajout commission
        platformGain: promoData.platformGain || 0 // ✅ Ajout gain plateforme
    });
  };

  const removePromo = () => {
    setPromo({ 
      code: null, 
      discountAmount: 0, 
      partnerId: null, 
      partnerLevel: null,
      partnerCommission: 0, // ✅ Reset commission
      platformGain: 0 // ✅ Reset gain plateforme
    });
  };

// --- AJOUT PRODUIT (Règle : Un seul fournisseur par commande) ---
  const addToCart = (product) => {
    // 1. Vérification du Fournisseur (Supplier)
    if (cartItems.length > 0) {
      // On récupère l'ID du fournisseur du premier article du panier
      const currentSupplier = cartItems[0].supplierId; 
      // On récupère l'ID du fournisseur du produit qu'on tente d'ajouter
      const newSupplier = product.supplierId; 

      // S'il s'agit de produits de fournisseurs (donc supplierId existe)
      if (currentSupplier && newSupplier && currentSupplier !== newSupplier) {
        setVendorConflict({
          isOpen: true,
          pendingProduct: product
        });
        return; // ON BLOQUE : Interdiction de mélanger les fournisseurs
      }
    }

    // 2. Ajout Normal (Même fournisseur ou panier vide)
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // ✅ CORRECTION IMPORTANTE: On stocke buyingPrice (prix fournisseur) au lieu de supplierPrice
      return [...prevItems, { 
        ...product, 
        quantity: 1, 
        cartId: Date.now(),
        supplierId: product.supplierId || null,
        buyingPrice: product.buyingPrice || 0, // ✅ Prix d'achat (fournisseur) - Nom correct selon la doc
        price: product.price // Prix de vente public (incluant ta marge)
      }];
    });
    
    if (promo.code) removePromo(); 
    setIsCartOpen(true); 
  };

  // --- FONCTIONS DE RÉSOLUTION DE CONFLIT ---
  
  // Option A : Le client veut le nouveau produit -> On vide l'ancien panier et on ajoute le nouveau
  const resolveConflictNewCart = () => {
    if (vendorConflict.pendingProduct) {
      setCartItems([{ ...vendorConflict.pendingProduct, quantity: 1, cartId: Date.now() }]);
      removePromo();
      setVendorConflict({ isOpen: false, pendingProduct: null });
      setIsCartOpen(true);
    }
  };

  // Option B : Le client annule -> On garde l'ancien panier
  const cancelConflict = () => {
    setVendorConflict({ isOpen: false, pendingProduct: null });
  };


  // --- LE RESTE (CRUD Classique) ---
  const updateQuantity = (productId, delta) => {
    setCartItems(prevItems => prevItems.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
    if (promo.code) removePromo();
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    if (promo.code) removePromo();
  };

  const clearCart = () => {
      setCartItems([]);
      removePromo();
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = Math.max(0, cartTotal - promo.discountAmount);

  const value = {
    cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
    cartTotal, cartCount, isCartOpen, setIsCartOpen,
    promo, applyPromo, removePromo, finalTotal,
    // Exports pour la Modale
    vendorConflict, resolveConflictNewCart, cancelConflict
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};