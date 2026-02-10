import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Plus, Minus, Trash2, ArrowRight, 
  Tag, AlertCircle, X, CheckCircle, Gift, ChevronRight, Store
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext'; // ✅ FIX : pour calculer partnerCommission
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Cart = () => {
  const navigate = useNavigate();
  const { calculatePartnerBenefits } = useConfig(); // ✅ FIX : calcul commission
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    cartTotal,
    cartCount,
    promo,
    applyPromo,
    removePromo,
    finalTotal
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Vérifier et appliquer le code promo
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const q = query(
        collection(db, 'partners'),
        where('promoCode', '==', promoCode.toUpperCase()),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setPromoError('Code invalide ou expiré');
        setPromoLoading(false);
        return;
      }

      const partnerData = snapshot.docs[0].data();
      const partnerId = snapshot.docs[0].id;

      // ✅ FIX : Calcul correct de la commission ET de la réduction via calculatePartnerBenefits
      // Cette fonction (ConfigContext) applique les règles métier complètes :
      // base + surplus 50/30/20, selon le niveau du partenaire
      let totalDiscountAmount = 0;
      let totalCommissionAmount = 0;
      let totalPlatformGainAmount = 0;

      cartItems.forEach(item => {
        const benefits = calculatePartnerBenefits(
          item.price,
          item.supplierPrice || item.buyingPrice || 0, // prix fournisseur confidentiel
          partnerData.totalSales || 0                  // niveau du partenaire
        );
        totalDiscountAmount    += benefits.discountClient    * item.quantity;
        totalCommissionAmount  += benefits.commissionPartner * item.quantity;
        totalPlatformGainAmount+= benefits.platformGain      * item.quantity;
      });

      applyPromo({
        code: promoCode.toUpperCase(),
        discountAmount:    totalDiscountAmount,    // ✅ réduction visible client
        partnerId:         partnerId,
        partnerLevel:      partnerData.level,
        partnerCommission: totalCommissionAmount,  // ✅ commission sauvegardée en Firebase
        platformGain:      totalPlatformGainAmount // ✅ gain plateforme sauvegardé en Firebase
      });

      setPromoCode('');
      setPromoLoading(false);
    } catch (error) {
      console.error('Erreur promo:', error);
      setPromoError('Erreur lors de la vérification');
      setPromoLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  // Panier vide
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-slate-800/50 border-2 border-slate-700/50 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-slate-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-3">
            Votre panier est vide
          </h2>
          <p className="text-slate-400 mb-8">
            Découvrez nos créations et ajoutez vos préférées
          </p>
          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              Explorer le menu
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24 md:pb-8">
      
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            Mon Panier
          </h1>
          <p className="text-slate-400">
            {cartCount} {cartCount > 1 ? 'articles' : 'article'}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Liste produits - 2/3 desktop */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Info un seul créateur */}
            {cartItems[0]?.supplierName && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <Store size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-300 font-medium">
                    Commande chez <span className="text-blue-400 font-bold">{cartItems[0].supplierName}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pour garantir la fraîcheur, une seule commande par créateur à la fois
                  </p>
                </div>
              </div>
            )}

            {/* Articles */}
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.cartId || item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-5 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700/30">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={32} className="text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-2">
                          <h3 className="font-bold text-slate-100 text-base sm:text-lg mb-1">
                            {item.name}
                          </h3>
                          {item.category && (
                            <p className="text-xs text-purple-400 font-medium">
                              {item.category}
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Prix */}
                        <div>
                          <p className="text-lg sm:text-xl font-bold text-slate-100">
                            {item.price.toLocaleString()} F
                          </p>
                          <p className="text-xs text-slate-500">Prix unitaire</p>
                        </div>

                        {/* Quantité */}
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                              item.quantity <= 1
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-slate-700 text-slate-200 hover:bg-purple-600 hover:text-white'
                            }`}
                          >
                            <Minus size={16} strokeWidth={3} />
                          </motion.button>

                          <span className="font-bold text-slate-100 w-8 text-center text-lg">
                            {item.quantity}
                          </span>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Sous-total ligne */}
                      <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">Sous-total</span>
                        <span className="font-bold text-slate-100 text-lg">
                          {(item.price * item.quantity).toLocaleString()} F
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Vider panier */}
            <button
              onClick={() => {
                if (window.confirm('Vider complètement le panier ?')) {
                  clearCart();
                }
              }}
              className="text-slate-500 hover:text-red-400 text-sm font-medium transition-colors flex items-center gap-2 mt-4"
            >
              <Trash2 size={16} />
              Vider le panier
            </button>
          </div>

          {/* Récapitulatif - 1/3 desktop, sticky */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 sm:p-6 sticky top-24 space-y-6">
              
              <h2 className="text-xl font-bold text-slate-100">Récapitulatif</h2>

              {/* Code promo */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Code promo
                </label>
                
                {promo.code ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="text-sm font-bold text-green-400">
                        {promo.code}
                      </span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        placeholder="PROMO2024"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="bg-purple-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {promoLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Tag size={18} />
                        )}
                      </motion.button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {promoError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Détails */}
              <div className="space-y-3 py-4 border-y border-slate-700/50">
                <div className="flex justify-between text-slate-300">
                  <span>Sous-total</span>
                  <span className="font-medium">{cartTotal.toLocaleString()} F</span>
                </div>

                {promo.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center gap-1">
                      <Gift size={14} />
                      Réduction
                    </span>
                    <span className="font-bold">-{promo.discountAmount.toLocaleString()} F</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400 text-sm">
                  <span>Frais de livraison</span>
                  <span>Calculés au checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-100">Total</span>
                <span className="text-3xl font-bold text-purple-400">
                  {finalTotal.toLocaleString()}
                  <span className="text-sm text-slate-500 ml-1">F</span>
                </span>
              </div>

              {/* Bouton Commander */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                Continuer vers le paiement
                <ChevronRight size={20} />
              </motion.button>

              <p className="text-xs text-center text-slate-500">
                🔒 Paiement sécurisé • 📦 Livraison rapide
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;