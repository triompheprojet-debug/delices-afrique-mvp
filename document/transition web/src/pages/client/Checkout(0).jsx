import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../../components/client/LocationPicker';
import { 
  User, Truck, ShoppingBag, Calendar, CreditCard, CheckCircle, Clock, Tag, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  // --- CONTEXTES ---
  const { cartItems, cartTotal, clearCart, applyPromo, promo, finalTotal } = useCart();
  const { config, isOpenNow, calculatePartnerBenefits } = useConfig();
  const navigate = useNavigate();

  // --- ÉTATS LOCAUX ---
  const [loading, setLoading] = useState(false);
  
  // États Livraison
  const [gpsLocation, setGpsLocation] = useState(null);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [deliveryAddressName, setDeliveryAddressName] = useState('');

  // États Code Promo
  const [promoInput, setPromoInput] = useState('');
  const [verifyingPromo, setVerifyingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Stockage local des calculs (Invisibles pour le client)
  const [calculatedCommission, setCalculatedCommission] = useState(0);
  const [calculatedPlatformGain, setCalculatedPlatformGain] = useState(0); // ✅ AJOUT

  // Formulaire
  const [formData, setFormData] = useState({
    name: '', phone: '', date: '', time: '',
    method: 'Livraison', payment: 'Espèces', 
    addressDetails: '', notes: ''
  });

  // Calcul Frais Livraison
  const deliveryCost = formData.method === 'Livraison' 
    ? Math.max(500, Math.round(deliveryDistance * config.deliveryRatePerKm)) 
    : 0;

  const totalToPay = finalTotal + deliveryCost;

  // --- LOGIQUE CODE PROMO (LE CŒUR DU SYSTÈME) ---
  const handleVerifyCode = async () => {
    if (!promoInput.trim()) return;
    setVerifyingPromo(true);
    setPromoError('');
    setPromoSuccess('');
    setCalculatedCommission(0); // Reset
    setCalculatedPlatformGain(0); // ✅ AJOUT Reset

    try {
      // 1. Chercher le code dans Firebase
      const q = query(collection(db, "partners"), where("promoCode", "==", promoInput.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setPromoError("Ce code partenaire n'existe pas.");
        setVerifyingPromo(false);
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      const partnerData = partnerDoc.data();

      // Vérifier si le partenaire est actif (Sécurité)
      if (partnerData.isActive === false) {
          setPromoError("Ce code partenaire est suspendu.");
          setVerifyingPromo(false);
          return;
      }

      // 2. Calculer les avantages (Réduction Client ET Commission Partenaire)
      let totalDiscountAmount = 0;
      let totalCommissionAmount = 0;
      let totalPlatformGainAmount = 0; // ✅ AJOUT
      
      cartItems.forEach(item => {
        // ✅ CORRECTION: Utiliser supplierPrice (nom réel dans votre DB) au lieu de buyingPrice
        const benefits = calculatePartnerBenefits(
          item.price, 
          item.supplierPrice || 0, // ✅ CORRECTION: supplierPrice = prix fournisseur
          partnerData.totalSales || 0
        );

        // On accumule les montants * quantité
        totalDiscountAmount += benefits.discountClient * item.quantity;
        totalCommissionAmount += benefits.commissionPartner * item.quantity;
        totalPlatformGainAmount += benefits.platformGain * item.quantity; // ✅ AJOUT
      });

      if (totalDiscountAmount > 0) {
        // 3. Appliquer la réduction (Visible Client)
        applyPromo({
          code: partnerData.promoCode,
          discountAmount: totalDiscountAmount,
          partnerId: partnerDoc.id,
          partnerLevel: partnerData.level || 'Standard',
          partnerCommission: totalCommissionAmount, // ✅ AJOUT
          platformGain: totalPlatformGainAmount // ✅ AJOUT
        });

        // 4. Stocker les montants calculés (Invisibles Client, pour l'Admin)
        setCalculatedCommission(totalCommissionAmount);
        setCalculatedPlatformGain(totalPlatformGainAmount); // ✅ AJOUT

        setPromoSuccess(`Code validé ! -${totalDiscountAmount.toLocaleString()} FCFA sur votre commande.`);
      } else {
        setPromoError("Ce code ne s'applique pas aux produits de votre panier.");
      }

    } catch (error) {
      console.error("Erreur verif code", error);
      setPromoError("Impossible de vérifier le code.");
    } finally {
      setVerifyingPromo(false);
    }
  };

  // --- SOUMISSION COMMANDE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.method === 'Livraison' && !gpsLocation) {
        alert("Veuillez valider votre position sur la carte.");
        return;
    }

    setLoading(true);

    try {
      let finalAddressString = "Retrait Boutique";
      if (formData.method === 'Livraison') {
        finalAddressString = deliveryAddressName 
          ? `${deliveryAddressName} ${formData.addressDetails ? '(' + formData.addressDetails + ')' : ''}`
          : `Position GPS Carte ${formData.addressDetails ? '(' + formData.addressDetails + ')' : ''}`;
      }

      // --- LOGIQUE FOURNISSEUR (CRITIQUE) ---
      // On récupère l'ID du fournisseur depuis le premier article (car panier mono-vendeur)
      // Si l'article n'a pas de supplierId, c'est un produit plateforme (interne)
      const primarySupplierId = cartItems.length > 0 ? (cartItems[0].supplierId || null) : null;
      const primarySupplierName = cartItems.length > 0 ? (cartItems[0].supplierName || null) : null;

      // Préparation de l'objet Commande
      const orderData = {
        code: 'CMD-' + Math.floor(100000 + Math.random() * 900000),
        
        // Liaison Fournisseur (Permet au fournisseur de voir SA commande)
        supplierId: primarySupplierId, 
        supplierName: primarySupplierName,

        customer: {
          name: formData.name,
          phone: formData.phone,
          location: formData.method === 'Livraison' ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : null,
          address: finalAddressString 
        },
        items: cartItems,
        
        // --- BLOC PARTENARIAT COMPLET (CONFORME AUX RÈGLES) ---
        promo: promo.code ? {
          code: promo.code,
          discountAmount: promo.discountAmount, // Visible client
          partnerId: promo.partnerId,
          partnerLevel: promo.partnerLevel,
          partnerCommission: calculatedCommission, // ✅ Commission partenaire (calculée selon règles)
          platformGain: calculatedPlatformGain, // ✅ AJOUT: Gain plateforme (calculé selon règles)
          status: 'pending' // La commission est en attente de livraison
        } : null,
        
        details: {
          subTotal: cartTotal,
          discount: promo.discountAmount || 0,
          deliveryFee: deliveryCost,
          deliveryDistance: formData.method === 'Livraison' ? deliveryDistance.toFixed(2) : 0,
          finalTotal: totalToPay,
          method: formData.method,
          paymentMethod: formData.payment,
          scheduledDate: formData.method === 'Retrait' ? formData.date : null,
          scheduledTime: formData.method === 'Retrait' ? formData.time : null, 
          notes: formData.notes
        },
        status: 'En attente', // Statut global de la commande
        
        // Historique des statuts (Pour tracer les délais fournisseur)
        statusHistory: {
            'En attente': serverTimestamp()
        },
        
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      
      // Nettoyage
      clearCart(); 
      setCalculatedCommission(0);
      setCalculatedPlatformGain(0); // ✅ AJOUT Reset
      
      navigate('/confirmation', { state: { order: orderData } });

    } catch (error) {
      console.error(error);
      alert("Une erreur technique est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI FERMETURE ---
  if (!isOpenNow && !config.maintenanceMode) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600"><Clock size={40} /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">La boutique est fermée</h2>
        <p className="text-gray-600 mb-6">Ouverture de {config.openingTime} à {config.closingTime}.</p>
        <button onClick={() => navigate('/menu')} className="bg-brand-brown text-white px-8 py-3 rounded-xl font-bold">Retour au menu</button>
      </div>
    );
  }

  if (!cartItems.length) return <div className="min-h-screen flex items-center justify-center">Votre panier est vide.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-8 flex items-center gap-2">
          <CheckCircle className="text-brand-brown"/> Finaliser la commande
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- GAUCHE : FORMULAIRES --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Identité */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><User size={20} className="text-brand-brown"/> Vos Coordonnées</h2>
              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-bold text-gray-600">Nom complet</label>
                   <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-lg mt-1"/>
                 </div>
                 <div>
                   <label className="text-sm font-bold text-gray-600">Téléphone</label>
                   <input required type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border p-3 rounded-lg mt-1"/>
                 </div>
              </div>
            </div>

            {/* 2. Livraison / Retrait */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Truck size={20} className="text-brand-brown"/> Mode de réception</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <button type="button" onClick={() => setFormData({...formData, method: 'Livraison'})} className={`w-full sm:flex-1 py-3 px-4 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 ${formData.method === 'Livraison' ? 'border-brand-brown bg-brand-brown/10 text-brand-brown' : 'border-gray-100 text-gray-500'}`}><Truck size={18}/> Livraison</button>
                  <button type="button" onClick={() => setFormData({...formData, method: 'Retrait'})} className={`w-full sm:flex-1 py-3 px-4 rounded-xl border-2 font-bold transition flex items-center justify-center gap-2 ${formData.method === 'Retrait' ? 'border-brand-brown bg-brand-brown/10 text-brand-brown' : 'border-gray-100 text-gray-500'}`}><ShoppingBag size={18}/> Retrait Boutique</button>
                </div>

              <AnimatePresence>
              {formData.method === 'Livraison' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <LocationPicker 
                    bakeryLocation={config.bakeryLocation}
                    onLocationSelect={(locData) => {
                        setGpsLocation({ lat: locData.lat, lng: locData.lng });
                        setDeliveryDistance(locData.distance);
                        setDeliveryAddressName(locData.addressName);
                    }}
                  />
                  <input type="text" placeholder="Précisions (Numéro de porte, couleur maison...)" value={formData.addressDetails} onChange={e=>setFormData({...formData, addressDetails: e.target.value})} className="w-full border p-3 rounded-lg"/>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* 3. Date Retrait */}
            {formData.method === 'Retrait' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar size={18}/> Quand souhaitez-vous passer ?</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-xs font-bold text-gray-500 mb-1 block">Date</label><input required type="date" className="w-full border p-3 rounded-lg" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})}/></div>
                   <div><label className="text-xs font-bold text-gray-500 mb-1 block">Heure</label><input required type="time" className="w-full border p-3 rounded-lg" value={formData.time} onChange={e=>setFormData({...formData, time: e.target.value})}/></div>
                </div>
              </div>
            )}
            
            {/* 4. Paiement */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
               <div className="mb-4">
                 <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={18}/> Paiement</h3>
                 <select className="w-full border p-3 rounded-lg bg-white" value={formData.payment} onChange={e=>setFormData({...formData, payment: e.target.value})}>
                   <option value="Espèces">Espèces à la livraison/réception</option>
                   <option value="Mobile Money">Airtel Money / MTN MoMo</option>
                 </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Message optionnel</label>
                  <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-3 outline-none" placeholder="Allergies, anniversaire..."/>
               </div>
            </div>
          </div>

          {/* --- DROITE : RÉSUMÉ & CODE PARTENAIRE --- */}
          <div className="h-fit space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-gray-800 mb-6 pb-4 border-b">Résumé de commande</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div><span className="font-bold text-gray-700">{item.quantity}x</span> {item.name}</div>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* SECTION CODE PROMO */}
              <div className="bg-brand-brown/5 p-4 rounded-xl border border-brand-brown/10 mb-6">
                 <h3 className="text-xs font-bold text-brand-brown uppercase mb-2 flex items-center gap-2"><Tag size={14}/> Code Partenaire</h3>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="DA-CODE..." 
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase font-bold focus:outline-none focus:ring-2 focus:ring-brand-brown/20"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      disabled={promo.code} 
                    />
                    {promo.code ? (
                      <button type="button" onClick={() => {applyPromo({code: null, discountAmount:0, partnerCommission:0, platformGain:0}); setPromoInput(''); setPromoSuccess(''); setCalculatedCommission(0); setCalculatedPlatformGain(0);}} className="bg-red-100 text-red-600 px-3 rounded-lg font-bold text-xs hover:bg-red-200">X</button>
                    ) : (
                      <button type="button" onClick={handleVerifyCode} disabled={verifyingPromo || !promoInput} className="bg-brand-brown text-white px-4 rounded-lg font-bold text-sm hover:bg-gray-800 disabled:opacity-50">
                        {verifyingPromo ? <Loader2 className="animate-spin" size={16}/> : 'OK'}
                      </button>
                    )}
                 </div>
                 {promoError && <p className="text-xs text-red-500 mt-2 font-medium">{promoError}</p>}
                 {promoSuccess && <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1"><CheckCircle size={12}/> {promoSuccess}</p>}
              </div>

              {/* TOTAUX */}
              <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600"><span>Sous-total</span><span>{cartTotal.toLocaleString()} FCFA</span></div>
                
                {/* LIGNE RÉDUCTION */}
                {promo.discountAmount > 0 && (
                   <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                      <span className="flex items-center gap-1"><Tag size={14}/> Code {promo.code}</span>
                      <span>-{promo.discountAmount.toLocaleString()} FCFA</span>
                   </div>
                )}

                {formData.method === 'Livraison' ? (
                  <div className="flex justify-between text-brand-brown font-medium">
                    <span className="flex items-center gap-1"><Truck size={14}/> Livraison ({deliveryDistance.toFixed(1)} km)</span>
                    <span>+{deliveryCost.toLocaleString()} FCFA</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-gray-400 italic"><span>Retrait en boutique</span><span>0 FCFA</span></div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total à payer</span>
                  <span className="text-2xl font-serif font-bold text-brand-brown">{totalToPay.toLocaleString()} <span className="text-sm text-gray-500">FCFA</span></span>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full mt-8 bg-brand-red text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition transform disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Validation...' : 'Confirmer la commande'}
              </motion.button>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default Checkout;