import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Truck, ShoppingBag, CheckCircle, Calendar, Camera } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isOpenNow, config } = useConfig();
  const navigate = useNavigate();
  
  // --- Config ---
  const DELIVERY_FEE = 1500; 
  const DELIVERY_DELAY_MSG = "45 à 60 minutes";
  // --------------

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    method: 'Livraison',
    pickupDate: '',
    notes: ''
  });

  const finalTotal = formData.method === 'Livraison' ? cartTotal + DELIVERY_FEE : cartTotal;

  // Si pas de panier ou panier vide
  if (!cartItems || (cartItems.length === 0 && !orderComplete)) {
    return (
       <div className="min-h-screen flex items-center justify-center p-4">
          <p>Chargement ou Panier vide...</p>
       </div>
    );
  }

  // --- SOUMISSION DU FORMULAIRE ---
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement, mais la validation HTML a déjà eu lieu
    
    // Double sécurité : Vérifier si le panier n'est pas vide
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      const uniqueCode = 'CMD-' + Math.floor(10000 + Math.random() * 90000);

      const orderData = {
        code: uniqueCode,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.method === 'Livraison' ? formData.address : 'Retrait Boutique',
        },
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        })),
        details: {
          subTotal: cartTotal,
          deliveryFee: formData.method === 'Livraison' ? DELIVERY_FEE : 0,
          finalTotal: finalTotal,
          method: formData.method,
          pickupDate: formData.method === 'Retrait' ? formData.pickupDate : null,
          notes: formData.notes
        },
        status: 'En attente',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      setOrderComplete(orderData);
      clearCart();
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  // --- VUE SUCCÈS (Message de confiance) ---
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-brown p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
          {/* En-tête Vert */}
          <div className="bg-green-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Commande Validée !</h1>
            <p className="text-green-100 text-sm">Merci pour votre confiance.</p>
          </div>

          <div className="p-6">
            {/* Le Code Unique */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Votre Code de Retrait / Livraison</p>
              <h2 className="text-3xl font-mono font-bold text-brand-brown tracking-wider">{orderComplete.code}</h2>
              <div className="flex items-center justify-center gap-1 text-xs text-red-500 mt-2 font-bold">
                <Camera size={12} />
                <span>Capturez cet écran maintenant</span>
              </div>
            </div>

            {/* Message de Délai / Retrait */}
            <div className="mb-6">
              {orderComplete.details.method === 'Livraison' ? (
                <p className="text-center text-gray-700">
                  Votre commande arrivera dans environ <span className="font-bold text-brand-brown">{DELIVERY_DELAY_MSG}</span>. 
                  Notre livreur vous contactera au <span className="font-bold">{orderComplete.customer.phone}</span>.
                </p>
              ) : (
                <p className="text-center text-gray-700">
                  Votre commande sera prête pour le retrait le <span className="font-bold text-brand-brown">{new Date(orderComplete.details.pickupDate).toLocaleString('fr-FR')}</span>.
                  Présentez votre code au comptoir.
                </p>
              )}
            </div>

            {/* Récapitulatif Rapide */}
            <div className="border-t border-gray-100 pt-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">Récapitulatif</h3>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                {orderComplete.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.total).toLocaleString()} FCFA</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center font-bold text-lg text-brand-brown border-t border-gray-100 pt-2">
                <span>Total à payer</span>
                <span>{orderComplete.details.finalTotal.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button onClick={() => navigate('/')} className="w-full bg-brand-brown text-white font-bold py-3 rounded-xl hover:bg-brand-brown/90 transition">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
if (!isOpenNow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">La boutique est fermée</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Nous ne pouvons pas prendre votre commande pour le moment.
          Nos horaires sont de <span className="font-bold">{config.openingTime}</span> à <span className="font-bold">{config.closingTime}</span>.
        </p>
        <button onClick={() => navigate('/menu')} className="bg-brand-brown text-white px-8 py-3 rounded-xl font-bold">
          Retour au menu
        </button>
      </div>
    );
  }
  // --- VUE FORMULAIRE ---
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24">
      {/* On encapsule TOUT dans la balise form pour que 'required' fonctionne */}
      <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Partie Gauche : Infos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><User size={20}/> Vos Coordonnées</h2>
            <div className="space-y-4">
              {/* Notez le 'required' ici */}
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-3" placeholder="Nom complet *" />
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg p-3" placeholder="Téléphone *" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Truck size={20}/> Livraison ou Retrait</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 ${formData.method === 'Livraison' ? 'border-brand-brown bg-brand-beige/10' : ''}`}>
                 <input type="radio" name="method" className="hidden" checked={formData.method === 'Livraison'} onChange={() => setFormData({...formData, method: 'Livraison'})}/>
                 <Truck size={24}/> <span className="font-bold text-sm">Livraison</span>
               </label>
               <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-2 ${formData.method === 'Retrait' ? 'border-brand-brown bg-brand-beige/10' : ''}`}>
                 <input type="radio" name="method" className="hidden" checked={formData.method === 'Retrait'} onChange={() => setFormData({...formData, method: 'Retrait'})}/>
                 <ShoppingBag size={24}/> <span className="font-bold text-sm">Retrait</span>
               </label>
            </div>

            {formData.method === 'Livraison' ? (
              <div>
                <label className="font-bold text-sm text-gray-700 mb-1 block">Adresse précise *</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg p-3" placeholder="Quartier, rue, numéro..."></textarea>
              </div>
            ) : (
              <div>
                <label className="font-bold text-sm text-gray-700 mb-1 block">Date et Heure de retrait *</label>
                <input required type="datetime-local" value={formData.pickupDate} onChange={e => setFormData({...formData, pickupDate: e.target.value})} className="w-full border rounded-lg p-3" />
              </div>
            )}
             
            <div className="mt-4">
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded-lg p-3" placeholder="Message optionnel..." />
            </div>
          </div>
        </div>

        {/* Partie Droite : Résumé (Lecture seule) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Votre Commande</h2>
          <div className="max-h-60 overflow-y-auto mb-4 border-b border-gray-100 pb-2">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between"><span>Sous-total</span> <span>{cartTotal.toLocaleString()} FCFA</span></div>
            <div className="flex justify-between"><span>Livraison</span> <span>{formData.method === 'Livraison' ? DELIVERY_FEE : 0} FCFA</span></div>
          </div>
          
          <div className="flex justify-between text-xl font-bold text-brand-brown mb-6">
            <span>Total</span> <span>{finalTotal.toLocaleString()} FCFA</span>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-brand-red text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition">
            {loading ? 'Envoi...' : 'Confirmer la commande'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;