import React, { createContext, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShoppingBag, X, Trash2, ArrowRight } from 'lucide-react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Modal Premium de conflit fournisseur
const VendorConflictModal = ({ isOpen, currentSupplier, newSupplier, onKeepCurrent, onSwitchNew, onCancel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-900 p-6 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-100 mb-1 font-playfair">
                  Créateur différent détecté
                </h3>
                <p className="text-sm text-slate-400">
                  Votre panier contient déjà des produits d'un autre créateur
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info règle */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="font-bold text-blue-400">Règle de fraîcheur :</span> Pour garantir 
                la qualité et la traçabilité, une commande ne peut contenir que des produits 
                d'un seul créateur à la fois.
              </p>
            </div>

            {/* Comparaison créateurs */}
            <div className="space-y-3">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Panier actuel</p>
                <p className="text-lg font-bold text-purple-400">{currentSupplier}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full h-px bg-slate-800"></div>
                <span className="px-4 text-xs text-slate-600 font-bold">VS</span>
                <div className="w-full h-px bg-slate-800"></div>
              </div>

              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Nouveau produit</p>
                <p className="text-lg font-bold text-pink-400">{newSupplier}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Garder actuel */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onKeepCurrent}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 py-4 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Garder mon panier actuel
              </motion.button>

              {/* Vider et ajouter nouveau */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSwitchNew}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Vider et ajouter le nouveau
              </motion.button>
            </div>

            <p className="text-xs text-center text-slate-600">
              Vous pourrez commander chez les autres créateurs séparément
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Gestion promo
  const [promo, setPromo] = useState({
    code: null, 
    discountAmount: 0, 
    partnerId: null, 
    partnerLevel: null,
    partnerCommission: 0,
    platformGain: 0
  });

  // Gestion conflit vendeur
  const [vendorConflict, setVendorConflict] = useState({
    isOpen: false,
    pendingProduct: null,
    currentSupplier: null,
    newSupplier: null
  });

  const applyPromo = (promoData) => {
    setPromo({
      code: promoData.code,
      discountAmount: promoData.discountAmount,
      partnerId: promoData.partnerId,
      partnerLevel: promoData.partnerLevel,
      partnerCommission: promoData.partnerCommission || 0,
      platformGain: promoData.platformGain || 0
    });
  };

  const removePromo = () => {
    setPromo({ 
      code: null, 
      discountAmount: 0, 
      partnerId: null, 
      partnerLevel: null,
      partnerCommission: 0,
      platformGain: 0
    });
  };

  // Ajout produit avec vérification fournisseur
  const addToCart = (product) => {
    if (cartItems.length > 0) {
      const currentSupplier = cartItems[0].supplierId;
      const currentSupplierName = cartItems[0].supplierName;
      const newSupplier = product.supplierId;
      const newSupplierName = product.supplierName;

      // Vérification conflit fournisseur
      if (currentSupplier && newSupplier && currentSupplier !== newSupplier) {
        setVendorConflict({
          isOpen: true,
          pendingProduct: product,
          currentSupplier: currentSupplierName || 'Créateur actuel',
          newSupplier: newSupplierName || 'Nouveau créateur'
        });
        return;
      }
    }

    // Ajout normal
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { 
        ...product, 
        quantity: 1, 
        cartId: Date.now(),
        supplierId: product.supplierId || null,
        supplierName: product.supplierName || null,
        buyingPrice: product.buyingPrice || 0,
        supplierPrice: product.supplierPrice || 0, // ✅ Ajouté pour cohérence
        price: product.price
      }];
    });
    
    if (promo.code) removePromo();
  };

  // ✅ FIX BUG-10 : Résolution conflit avec copie explicite de supplierPrice
  const resolveConflictNewCart = () => {
    if (vendorConflict.pendingProduct) {
      const product = vendorConflict.pendingProduct;
      setCartItems([{ 
        ...product, 
        quantity: 1, 
        cartId: Date.now(),
        supplierId: product.supplierId || null,
        supplierName: product.supplierName || null,
        buyingPrice: product.buyingPrice || 0,
        supplierPrice: product.supplierPrice || 0, // ✅ FIX BUG-10 : copie explicite
        price: product.price
      }]);
      removePromo();
      setVendorConflict({ 
        isOpen: false, 
        pendingProduct: null,
        currentSupplier: null,
        newSupplier: null
      });
    }
  };

  // Résolution conflit : Garder panier actuel
  const cancelConflict = () => {
    setVendorConflict({ 
      isOpen: false, 
      pendingProduct: null,
      currentSupplier: null,
      newSupplier: null
    });
  };

  // ✅ FIX BUG-4 : updateQuantity filtre maintenant les items à quantité 0
  const updateQuantity = (productId, delta) => {
    setCartItems(prevItems => {
      return prevItems
        .map(item => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            // Si quantité devient 0 ou négative, retourner null pour filtrage
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(item => item !== null); // ✅ Supprime les items null (quantité 0)
    });
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
    vendorConflict, resolveConflictNewCart, cancelConflict
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      
      {/* Modal conflit fournisseur */}
      <VendorConflictModal
        isOpen={vendorConflict.isOpen}
        currentSupplier={vendorConflict.currentSupplier}
        newSupplier={vendorConflict.newSupplier}
        onKeepCurrent={cancelConflict}
        onSwitchNew={resolveConflictNewCart}
        onCancel={cancelConflict}
      />
    </CartContext.Provider>
  );
};