import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, MapPin, Calendar, Clock, CreditCard,
  User, Phone, ChevronRight, AlertCircle,
  Package, Truck, FileText, Edit2, ChevronLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import { APP_CONFIG, VALIDATION_RULES } from '../../utils/constants';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, query, where, getDocs } from 'firebase/firestore';
import LocationPicker from '../../components/client/LocationPicker';
import OrderSummary from '../../components/client/OrderSummary';

// Import des nouveaux composants
import {
  CheckoutStepIndicator,
  CustomerInfoForm,
  DeliveryMethodSelector,
  DeliveryAddressForm,
  PickupScheduler,
  PaymentMethodSelector,
  OrderNotesForm,
  OrderReviewCard
} from '../../components/client/checkout';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, promo, finalTotal, clearCart } = useCart();
  const { config, isOpenNow, calculatePartnerBenefits } = useConfig(); 

  // Mobile: Étapes progressives
  const [mobileStep, setMobileStep] = useState(1);
  
  // Desktop: Étape classique (1 = Infos, 2 = Récap)
  const [desktopStep, setDesktopStep] = useState(1);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États locaux pour les calculs partenaire
  const [calculatedCommission, setCalculatedCommission] = useState(0);
  const [calculatedPlatformGain, setCalculatedPlatformGain] = useState(0);

  // Synchronisation depuis le contexte promo
  useEffect(() => {
    if (promo.code && promo.partnerCommission !== undefined) {
      setCalculatedCommission(promo.partnerCommission ?? 0);
      setCalculatedPlatformGain(promo.platformGain ?? 0);
    } else if (!promo.code) {
      setCalculatedCommission(0);
      setCalculatedPlatformGain(0);
    }
  }, [promo.code, promo.partnerCommission, promo.platformGain]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    method: '',
    address: '',
    location: null,
    deliveryDistance: 0,
    deliveryFee: 0,
    scheduledDate: '',
    scheduledTime: '',
    paymentMethod: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    if (formData.method === 'Livraison' && formData.location) {
      const distance = formData.location.distance || 0;
      const rate = config.deliveryRatePerKm || APP_CONFIG.DEFAULT_DELIVERY_RATE;
      const fee = Math.round(distance * rate);
      
      setFormData(prev => ({ 
        ...prev, 
        deliveryDistance: distance.toFixed(2),
        deliveryFee: fee 
      }));
    } else {
      setFormData(prev => ({ ...prev, deliveryFee: 0, deliveryDistance: 0 }));
    }
  }, [formData.method, formData.location, config.deliveryRatePerKm]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation desktop
  const validateDesktopForm = () => {
    const newErrors = {};

    
    // Validation NOM
    if (!formData.name.trim()) {
      newErrors.name = 'Nom requis';
    } else if (formData.name.length < VALIDATION_RULES.NAME.MIN_LENGTH || 
              formData.name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
      newErrors.name = `Le nom doit contenir entre ${VALIDATION_RULES.NAME.MIN_LENGTH} et ${VALIDATION_RULES.NAME.MAX_LENGTH} caractères`;
    } else if (!VALIDATION_RULES.NAME.REGEX.test(formData.name)) {
      newErrors.name = VALIDATION_RULES.NAME.ERROR_MSG;
    }

    // Validation TÉLÉPHONE
    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else if (!VALIDATION_RULES.PHONE.REGEX.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = VALIDATION_RULES.PHONE.ERROR_MSG;
    }

    if (!formData.method) newErrors.method = 'Choisissez un mode';
    
    if (formData.method === 'Livraison') {
      if (!formData.address.trim()) newErrors.address = 'Adresse requise';
      if (!formData.location) newErrors.location = 'Sélectionnez votre position';
    }

    if (formData.method === 'Retrait') {
      if (!formData.scheduledDate) newErrors.scheduledDate = 'Date requise';
      if (!formData.scheduledTime) newErrors.scheduledTime = 'Heure requise';
    }

    if (!formData.paymentMethod) newErrors.paymentMethod = 'Choisissez un mode de paiement';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation mobile par étape
  const validateMobileStep = (step) => {
    const newErrors = {};

    switch(step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Nom requis';
        } else if (formData.name.length < VALIDATION_RULES.NAME.MIN_LENGTH || 
                  formData.name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
          newErrors.name = `Le nom doit contenir entre ${VALIDATION_RULES.NAME.MIN_LENGTH} et ${VALIDATION_RULES.NAME.MAX_LENGTH} caractères`;
        } else if (!VALIDATION_RULES.NAME.REGEX.test(formData.name)) {
          newErrors.name = VALIDATION_RULES.NAME.ERROR_MSG;
        }
        break;
      case 2:
        if (!formData.phone.trim()) {
          newErrors.phone = 'Téléphone requis';
        } else if (!VALIDATION_RULES.PHONE.REGEX.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = VALIDATION_RULES.PHONE.ERROR_MSG;
        }
        break;
      case 3:
        if (!formData.method) newErrors.method = 'Choisissez un mode';
        break;
      case 4:
        if (formData.method === 'Livraison' && !formData.address.trim()) {
          newErrors.address = 'Adresse requise';
        }
        break;
      case 5:
        if (formData.method === 'Livraison' && !formData.location) {
          newErrors.location = 'Sélectionnez votre position';
        }
        break;
      case 6:
        if (formData.method === 'Retrait' && !formData.scheduledDate) {
          newErrors.scheduledDate = 'Date requise';
        }
        break;
      case 7:
        if (formData.method === 'Retrait' && !formData.scheduledTime) {
          newErrors.scheduledTime = 'Heure requise';
        }
        break;
      case 8:
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Choisissez un mode de paiement';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDesktopNext = () => {
    if (desktopStep === 1) {
      if (validateDesktopForm()) {
        setDesktopStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleMobileNext = () => {
    if (!validateMobileStep(mobileStep)) return;

    if (mobileStep === 3) {
      if (formData.method === 'Livraison') {
        setMobileStep(4);
      } else {
        setMobileStep(6);
      }
    } else if (mobileStep === 4) {
      setMobileStep(5);
    } else if (mobileStep === 5) {
      setMobileStep(8);
    } else if (mobileStep === 6) {
      setMobileStep(7);
    } else if (mobileStep === 7) {
      setMobileStep(8);
    } else if (mobileStep === 8) {
      setMobileStep(9);
    } else if (mobileStep === 9) {
      setMobileStep(10);
    } else {
      setMobileStep(prev => prev + 1);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileSkip = () => {
    if (mobileStep === 9) {
      setMobileStep(10);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      // Vérification finale code promo
      if (promo.code && promo.partnerId) {
        const q = query(collection(db, "partners"), where("promoCode", "==", promo.code));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          alert("❌ Le code partenaire utilisé n'existe plus. La commande ne peut pas être validée.");
          setIsSubmitting(false);
          return;
        }
        const partnerData = snapshot.docs[0].data();
        if (partnerData.isActive === false) {
          alert("❌ Le code partenaire a été suspendu. La commande ne peut pas être validée avec ce code.");
          setIsSubmitting(false);
          return;
        }
      }

      // ✅ CALCUL DE LA DETTE PLATEFORME (marge sur chaque produit)
      const calculatePlatformDebt = () => {
        let totalDebt = 0;
        
        // Marge sur les produits
        cartItems.forEach(item => {
          const sellingPrice = Number(item.price || 0);
          const buyingPrice = Number(item.supplierPrice || 0);
          const quantity = Number(item.quantity || 0);
          
          const productMargin = (sellingPrice - buyingPrice) * quantity;
          totalDebt += productMargin;
        });
        
        // Marge sur la livraison (10% des frais de livraison)
        const deliveryFee = Number(formData.deliveryFee || 0);
        totalDebt += deliveryFee * 0.1;
        
        return Math.round(totalDebt); // Arrondi pour éviter les centimes
      };

      const platformDebt = calculatePlatformDebt();

      const orderData = {
        code: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: serverTimestamp(),
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.method === 'Livraison' ? formData.address : (config.address || APP_CONFIG.DEFAULT_ADDRESS),
          location: formData.location || null
        },
        details: {
          method: formData.method,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || '',
          deliveryDistance: formData.deliveryDistance || 0,
          deliveryFee: formData.deliveryFee || 0,
          discount: promo.discountAmount || 0,
          subTotal: cartTotal,
          finalTotal: finalTotal + formData.deliveryFee,
          scheduledDate: formData.scheduledDate || null,
          scheduledTime: formData.scheduledTime || null
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || '',
          image: item.image || '',
          supplierId: item.supplierId || '',
          supplierName: item.supplierName || '',
          supplierPrice: item.supplierPrice || 0
        })),
        promo: promo.code ? {
          code: promo.code,
          discountAmount: promo.discountAmount || 0,
          partnerId: promo.partnerId || null,
          partnerName: promo.partnerName || '',
          partnerLevel: promo.partnerLevel || 'Standard',
          partnerCommission: calculatedCommission,
          platformGain: calculatedPlatformGain,
          status: 'pending',
          appliedAt: serverTimestamp()
        } : null,
        supplierId: cartItems[0]?.supplierId || null,
        supplierName: cartItems[0]?.supplierName || 'Délices d\'Afrique',
        
        // ✅ DETTE PLATEFORME CALCULÉE ET STOCKÉE
        platformDebt: platformDebt,
        
        payment: {
          method: formData.paymentMethod,
          status: 'pending',
          isPaid: false,
          paidAt: null
        },
        
        status: 'En attente',
        statusHistory: {
          'En attente': serverTimestamp()
        },
        
        metadata: {
          createdFrom: 'web',
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        },
        
        settlementStatus: 'pending'
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      console.log('✅ Commande créée avec succès:', docRef.id);

      // MISE À JOUR DES STATS PARTENAIRE
      if (promo.partnerId) {
        try {
          const partnerRef = doc(db, 'partners', promo.partnerId);
          const partnerSnap = await getDoc(partnerRef);
          
          if (partnerSnap.exists()) {
            const partnerData = partnerSnap.data();
            const currentSales = partnerData.totalSales || 0;
            const newTotalSales = currentSales + 1;

            let newLevel = partnerData.level || 'Standard';
            if (newTotalSales >= 150) {
              newLevel = 'Premium';
            } else if (newTotalSales >= 30) {
              newLevel = 'Actif';
            } else {
              newLevel = 'Standard';
            }

            const updatePayload = { totalSales: increment(1) };
            if (newLevel !== partnerData.level) {
              updatePayload.level = newLevel;
              console.log(`🎉 ${promo.partnerName || promo.partnerId} → ${newLevel} (${newTotalSales} ventes)`);
            }

            await updateDoc(partnerRef, updatePayload);
            console.log(`✅ Stats partenaire mises à jour: ${promo.partnerName || promo.partnerId} (+1 vente, niveau: ${newLevel})`);
            
          } else {
            console.error(`❌ Partenaire ${promo.partnerId} introuvable`);
          }
        } catch (error) {
          console.error('❌ Erreur mise à jour stats partenaire:', error);
        }
      }
      
      clearCart();
      setCalculatedCommission(0);
      setCalculatedPlatformGain(0);
      
      navigate('/confirmation', { 
        state: { 
          order: { 
            ...orderData, 
            id: docRef.id 
          } 
        } 
      });

    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      alert('Erreur lors de la commande. Réessayez.');
      setIsSubmitting(false);
    }
  };

  // Blocage commandes hors horaires
  if (!isOpenNow && !config.maintenanceMode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <Clock size={40} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">La boutique est fermée</h2>
        <p className="text-slate-400 mb-6">
          Ouverture de {config.openingTime} à {config.closingTime}.
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
        >
          Retour au menu
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) return null;

  const totalWithDelivery = finalTotal + formData.deliveryFee;
  const totalSteps = formData.method === 'Livraison' ? 10 : 9;
  const currentStepForProgress = Math.min(mobileStep, totalSteps);
  const progressPercent = (currentStepForProgress / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-950">
      
      {/* ========================================
          MOBILE: Questions progressives
          ======================================== */}
      <div className="md:hidden">
        {/* Header progression */}
        <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-slate-100">Commande</h1>
            <span className="text-xs text-slate-400">
              Étape {currentStepForProgress}/{totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-purple-600"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="px-4 py-6">
          <AnimatePresence mode="wait">
            
            {/* Étape 1: Nom */}
            {mobileStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Quel est votre nom ?
                  </h2>
                  <p className="text-sm text-slate-400">
                    Pour personnaliser votre commande
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-4 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    placeholder="Jean Dupont"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleMobileNext()}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMobileNext}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Étape 2: Téléphone */}
            {mobileStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Votre numéro de téléphone
                  </h2>
                  <p className="text-sm text-slate-400">
                    Pour vous contacter si besoin
                  </p>
                </div>

                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-4 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    placeholder="+242 06 000 0000"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleMobileNext()}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMobileNext}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Étape 3: Mode */}
            {mobileStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Comment récupérer ?
                  </h2>
                  <p className="text-sm text-slate-400">
                    Choisissez votre mode préféré
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleInputChange('method', 'Livraison');
                      setTimeout(handleMobileNext, 300);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.method === 'Livraison'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700'
                    }`}
                  >
                    <Truck size={28} className="text-purple-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-100 text-sm">Livraison</p>
                    <p className="text-xs text-slate-400 mt-1">À domicile</p>
                  </button>

                  <button
                    onClick={() => {
                      handleInputChange('method', 'Retrait');
                      setTimeout(handleMobileNext, 300);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.method === 'Retrait'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700'
                    }`}
                  >
                    <Package size={28} className="text-purple-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-100 text-sm">Retrait</p>
                    <p className="text-xs text-slate-400 mt-1">En boutique</p>
                  </button>
                </div>

                {errors.method && (
                  <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1">
                    <AlertCircle size={12} />
                    {errors.method}
                  </p>
                )}
              </motion.div>
            )}

            {/* Étape 4: Adresse */}
            {mobileStep === 4 && formData.method === 'Livraison' && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Votre adresse
                  </h2>
                  <p className="text-sm text-slate-400">
                    Quartier, rue, indications...
                  </p>
                </div>

                <div>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.address ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none`}
                    placeholder="Ex: Quartier Mpaka, Rue 12, Immeuble bleu..."
                    rows={4}
                    autoFocus
                  />
                  {errors.address && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.address}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMobileNext}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Étape 5: Carte */}
            {mobileStep === 5 && formData.method === 'Livraison' && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Votre position
                  </h2>
                  <p className="text-sm text-slate-400">
                    Pour calculer les frais
                  </p>
                </div>

                <LocationPicker
                  bakeryLocation={config.bakeryLocation || APP_CONFIG.BAKERY_LOCATION}
                  onLocationSelect={(loc) => handleInputChange('location', loc)}
                />

                {errors.location && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.location}
                  </p>
                )}

                {formData.deliveryFee > 0 && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-sm text-slate-300 mb-1">Frais de livraison</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formData.deliveryFee.toLocaleString()} F
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Distance: {formData.deliveryDistance} km
                    </p>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMobileNext}
                  disabled={!formData.location}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continuer
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Étape 6: Date retrait */}
            {mobileStep === 6 && formData.method === 'Retrait' && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Date de retrait
                  </h2>
                  <p className="text-sm text-slate-400">
                    Quand souhaitez-vous récupérer ?
                  </p>
                </div>

                <div>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-slate-900 border ${errors.scheduledDate ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-4 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  />
                  {errors.scheduledDate && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.scheduledDate}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMobileNext}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Étape 7: Heure retrait */}
            {mobileStep === 7 && formData.method === 'Retrait' && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Heure de retrait
                  </h2>
                  <p className="text-sm text-slate-400">
                    À quelle heure ?
                  </p>
                </div>

                <div>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.scheduledTime ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-4 text-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                  />
                  {errors.scheduledTime && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.scheduledTime}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMobileNext}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight size={20} />
                </motion.button>
              </motion.div>
            )}

            {/* Étape 8: Paiement */}
            {mobileStep === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Mode de paiement
                  </h2>
                  <p className="text-sm text-slate-400">
                    Comment souhaitez-vous payer ?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleInputChange('paymentMethod', 'Espèces');
                      setTimeout(handleMobileNext, 300);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === 'Espèces'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">💵</div>
                    <p className="font-bold text-slate-100 text-sm">Espèces</p>
                    <p className="text-xs text-slate-400 mt-1">À la {formData.method === 'Livraison' ? 'livraison' : 'réception'}</p>
                  </button>

                  <button
                    onClick={() => {
                      handleInputChange('paymentMethod', 'Mobile Money');
                      setTimeout(handleMobileNext, 300);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.paymentMethod === 'Mobile Money'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">📱</div>
                    <p className="font-bold text-slate-100 text-sm">Mobile Money</p>
                    <p className="text-xs text-slate-400 mt-1">Airtel / MTN</p>
                  </button>
                </div>

                {errors.paymentMethod && (
                  <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1">
                    <AlertCircle size={12} />
                    {errors.paymentMethod}
                  </p>
                )}
              </motion.div>
            )}

            {/* Étape 9: Notes */}
            {mobileStep === 9 && (
              <motion.div
                key="step9"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Instructions spéciales ?
                  </h2>
                  <p className="text-sm text-slate-400">
                    Optionnel
                  </p>
                </div>

                <div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    placeholder="Allergies, précisions..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMobileSkip}
                    className="flex-1 bg-slate-800 text-slate-300 py-4 rounded-xl font-bold border border-slate-700"
                  >
                    Passer
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMobileNext}
                    className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    Continuer
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Étape 10: Récap */}
            {mobileStep === 10 && (
              <motion.div
                key="step10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">
                    Vérifiez tout
                  </h2>
                  <p className="text-sm text-slate-400">
                    Avant de confirmer
                  </p>
                </div>

                {/* Résumé */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nom</span>
                    <span className="text-slate-100 font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Téléphone</span>
                    <span className="text-slate-100 font-medium">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mode</span>
                    <span className="text-slate-100 font-medium">{formData.method}</span>
                  </div>
                  {formData.method === 'Livraison' && (
                    <>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400">Adresse</span>
                        <span className="text-slate-100 font-medium text-right max-w-[60%]">{formData.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Livraison</span>
                        <span className="text-purple-400 font-bold">{formData.deliveryFee.toLocaleString()} F</span>
                      </div>
                    </>
                  )}
                  {formData.method === 'Retrait' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Retrait le</span>
                      <span className="text-slate-100 font-medium">
                        {formData.scheduledDate} à {formData.scheduledTime}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paiement</span>
                    <span className="text-slate-100 font-medium">{formData.paymentMethod}</span>
                  </div>
                  {formData.notes && (
                    <div className="pt-2 border-t border-slate-700/30">
                      <p className="text-slate-400 text-xs mb-1">Notes</p>
                      <p className="text-slate-300 italic">"{formData.notes}"</p>
                    </div>
                  )}
                </div>

                <OrderSummary
                  items={cartItems}
                  subtotal={cartTotal}
                  promo={promo}
                  deliveryFee={formData.deliveryFee}
                  total={totalWithDelivery}
                  compact={true}
                />

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirmer la commande
                    </>
                  )}
                </motion.button>

                <button
                  onClick={() => setMobileStep(1)}
                  className="w-full text-purple-400 text-sm font-medium"
                >
                  Modifier les informations
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ========================================
          DESKTOP: Formulaire classique 2 étapes
          ======================================== */}
      <div className="hidden md:block">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-100 mb-6">
              Finaliser ma commande
            </h1>

            {/* Stepper */}
            <div className="flex items-center justify-between max-w-md">
              {[
                { num: 1, label: 'Informations', icon: User },
                { num: 2, label: 'Vérification', icon: CheckCircle }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      desktopStep >= step.num
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      {desktopStep > step.num ? (
                        <CheckCircle size={20} />
                      ) : (
                        <step.icon size={20} />
                      )}
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      desktopStep >= step.num ? 'text-purple-400' : 'text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                      desktopStep > step.num ? 'bg-purple-600' : 'bg-slate-800'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            
            {/* ÉTAPE 1 DESKTOP: Formulaire complet */}
            {desktopStep === 1 && (
              <motion.div
                key="desktop-step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  
                  {/* Formulaire - 2/3 */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Infos client */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                      <CustomerInfoForm
                        formData={formData}
                        errors={errors}
                        onInputChange={handleInputChange}
                      />
                    </div>

                    {/* Méthode de récupération */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                      <DeliveryMethodSelector
                        selectedMethod={formData.method}
                        onMethodChange={(value) => handleInputChange('method', value)}
                        error={errors.method}
                        isOpenNow={isOpenNow}
                      />
                    </div>

                    {/* Livraison */}
                    {formData.method === 'Livraison' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                      >
                        <DeliveryAddressForm
                          address={formData.address}
                          location={formData.location}
                          deliveryFee={formData.deliveryFee}
                          errors={errors}
                          onAddressChange={(value) => handleInputChange('address', value)}
                          onLocationChange={(value) => handleInputChange('location', value)}
                          bakeryLocation={config.bakeryLocation || APP_CONFIG.BAKERY_LOCATION}
                        />
                      </motion.div>
                    )}

                    {/* Retrait */}
                    {formData.method === 'Retrait' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
                      >
                        <PickupScheduler
                          scheduledDate={formData.scheduledDate}
                          scheduledTime={formData.scheduledTime}
                          errors={errors}
                          onDateChange={(value) => handleInputChange('scheduledDate', value)}
                          onTimeChange={(value) => handleInputChange('scheduledTime', value)}
                          shopAddress={config.address}
                        />
                      </motion.div>
                    )}

                    {/* Paiement */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                      <PaymentMethodSelector
                        selectedMethod={formData.paymentMethod}
                        onMethodChange={(value) => handleInputChange('paymentMethod', value)}
                        error={errors.paymentMethod}
                        deliveryMethod={formData.method}
                      />
                    </div>

                    {/* Notes */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                      <OrderNotesForm
                        notes={formData.notes}
                        onNotesChange={(value) => handleInputChange('notes', value)}
                      />
                    </div>

                    {/* Bouton continuer */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDesktopNext}
                      className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Continuer vers la vérification
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>

                  {/* Résumé - 1/3 */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-4">
                      <OrderSummary
                        items={cartItems}
                        subtotal={cartTotal}
                        promo={promo}
                        deliveryFee={formData.deliveryFee}
                        total={totalWithDelivery}
                      />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2 DESKTOP: Récapitulatif */}
            {desktopStep === 2 && (
              <motion.div
                key="desktop-step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-100 mb-2">
                    Vérifiez votre commande
                  </h2>
                  <p className="text-slate-400">
                    Assurez-vous que tout est correct
                  </p>
                </div>

                {/* Cartes de révision */}
                <OrderReviewCard
                  formData={formData}
                  config={config}
                  onEdit={() => setDesktopStep(1)}
                />

                {/* Récap commande */}
                <OrderSummary
                  items={cartItems}
                  subtotal={cartTotal}
                  promo={promo}
                  deliveryFee={formData.deliveryFee}
                  total={totalWithDelivery}
                  showEdit={true}
                  onEdit={() => navigate('/cart')}
                />

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDesktopStep(1)}
                    className="flex-1 bg-slate-800 text-slate-300 py-4 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    Retour
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="flex-[2] bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Confirmer la commande
                      </>
                    )}
                  </motion.button>
                </div>

                <p className="text-xs text-center text-slate-500 pt-2">
                  En confirmant, vous acceptez nos conditions de vente
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default Checkout;