import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartTotal,
    promo,
    finalTotal
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Animations variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 200 
      }
    },
    exit: { 
      x: '100%',
      transition: { 
        type: "spring", 
        damping: 30, 
        stiffness: 250 
      }
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay avec blur */}
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Panneau latéral */}
          <motion.div 
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 z-50 shadow-2xl flex flex-col border-l border-slate-800"
          >
            
            {/* En-tête élégant */}
            <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 text-white px-5 py-4 sm:px-6 sm:py-5 border-b border-purple-500/20">
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <ShoppingBag size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-serif font-bold">Mon Panier</h2>
                    <p className="text-xs text-purple-200 font-medium">
                      {cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'}
                    </p>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCartOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={24} strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Barre de progression (si promo active) */}
              {promo.code && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-2.5 sm:p-3 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30"
                >
                  <div className="flex items-center gap-2 text-green-100 text-xs sm:text-sm font-bold">
                    <Tag size={14} />
                    <span>Code "{promo.code}" appliqué</span>
                  </div>
                  <p className="text-xs text-green-200/80 mt-1">
                    -{promo.discountAmount.toLocaleString()} F de réduction
                  </p>
                </motion.div>
              )}
            </div>

            {/* Liste des produits (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 sm:px-6 sm:py-6">
              <AnimatePresence mode="popLayout">
                {cartItems.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <ShoppingBag size={36} className="text-slate-600"/>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-200 mb-2">
                      Votre panier est vide
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs">
                      Découvrez nos créations et ajoutez vos préférées
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCartOpen(false)} 
                      className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      Explorer le menu
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map((item, index) => (
                      <motion.div 
                        key={item.cartId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 sm:gap-4 items-center bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 border border-slate-700/50 hover:border-purple-500/30 transition-colors"
                      >
                        {/* Image Produit */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-sm group">
                          {item.image ? (
                            <>
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <ShoppingBag size={20} className="text-slate-600" />
                            </div>
                          )}
                        </div>

                        {/* Infos + Contrôles */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-100 text-sm line-clamp-1 pr-2">
                              {item.name}
                            </h3>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromCart(item.id)} 
                              className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                          
                          <p className="text-sm text-purple-400 font-bold mb-2 sm:mb-3">
                            {item.price.toLocaleString()} F
                          </p>

                          {/* Contrôle Quantité */}
                          <div className="flex items-center gap-2 sm:gap-3">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${
                                item.quantity <= 1 
                                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                  : 'bg-slate-700 text-purple-400 hover:bg-purple-600 hover:text-white shadow-sm'
                              }`}
                            >
                              <Minus size={14} strokeWidth={3} />
                            </motion.button>
                            
                            <span className="font-bold text-slate-100 w-6 text-center text-base sm:text-lg">
                              {item.quantity}
                            </span>
                            
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-sm"
                            >
                              <Plus size={14} strokeWidth={3} />
                            </motion.button>
                            
                            <div className="ml-auto text-right">
                              <p className="text-[10px] text-slate-500 font-medium">Total</p>
                              <p className="font-bold text-slate-100 text-sm">
                                {(item.price * item.quantity).toLocaleString()} F
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer : Récapitulatif + CTA */}
            {cartItems.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border-t border-slate-800 bg-slate-900 px-4 py-4 sm:px-6 sm:py-5 space-y-4"
              >
                {/* Détail des totaux */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Sous-total</span>
                    <span className="font-bold">{cartTotal.toLocaleString()} F</span>
                  </div>
                  
                  {promo.discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        Réduction ({promo.code})
                      </span>
                      <span className="font-bold">-{promo.discountAmount.toLocaleString()} F</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-slate-800"></div>
                  
                  <div className="flex justify-between items-center text-base sm:text-lg">
                    <span className="font-serif font-bold text-slate-100">Total</span>
                    <span className="font-bold text-purple-400 text-xl sm:text-2xl">
                      {finalTotal.toLocaleString()} 
                      <span className="text-sm text-slate-500 ml-1">F</span>
                    </span>
                  </div>
                </div>

                {/* Bouton Commander */}
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  {/* Effet brillance */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                  
                  <span className="relative z-10 text-base sm:text-lg">Commander</span>
                  <ArrowRight 
                    size={20} 
                    className="relative z-10 group-hover:translate-x-1 transition-transform" 
                  />
                </motion.button>

                {/* Info livraison */}
                <p className="text-center text-xs text-slate-500">
                  🚚 Livraison rapide • 💳 Paiement sécurisé
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;