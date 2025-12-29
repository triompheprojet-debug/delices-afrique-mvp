import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { MapPin, Store, User, Phone, Calendar, Clock, CreditCard } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, setIsCartOpen } = useCart(); // On récupère le panier
  const navigate = useNavigate();

  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    deliveryMethod: 'pickup', // 'pickup' ou 'delivery'
    address: '',
    date: '',
    time: '',
    notes: ''
  });

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, plus tard, on enverra les données au Backend ou Firebase
    console.log("Commande envoyée :", formData, cartItems);
    
    // On ferme le panier (au cas où) et on redirige vers la confirmation
    setIsCartOpen(false);
    navigate('/confirmation');
  };

  // Formatage Prix
  const formatPrice = (price) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";

  // Redirection si panier vide
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-brand-brown mb-4">Votre panier est vide</h2>
        <button onClick={() => navigate('/menu')} className="text-brand-red underline">Retourner au menu</button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-brand-brown mb-8 text-center">Finaliser votre commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* --- COLONNE GAUCHE : FORMULAIRE --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Informations Personnelles */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                <User size={20} className="text-brand-beige" /> Informations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" name="firstName" required className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-brand-beige outline-none" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" name="lastName" required className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-brand-beige outline-none" onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp (Obligatoire)</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-beige">
                    <div className="bg-gray-100 p-2 text-gray-500 border-r"><Phone size={18}/></div>
                    <input type="tel" name="phone" required placeholder="Ex: 06 123 45 67" className="w-full p-2 outline-none" onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Mode de Livraison */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-brand-beige" /> Livraison ou Retrait
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Option Retrait */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.deliveryMethod === 'pickup' ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200 hover:border-brand-beige'}`}>
                  <input type="radio" name="deliveryMethod" value="pickup" checked={formData.deliveryMethod === 'pickup'} onChange={handleChange} className="hidden" />
                  <Store size={24} className={formData.deliveryMethod === 'pickup' ? 'text-brand-brown' : 'text-gray-400'} />
                  <span className="font-bold text-sm">Retrait Boutique</span>
                </label>

                {/* Option Livraison */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${formData.deliveryMethod === 'delivery' ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200 hover:border-brand-beige'}`}>
                  <input type="radio" name="deliveryMethod" value="delivery" checked={formData.deliveryMethod === 'delivery'} onChange={handleChange} className="hidden" />
                  <MapPin size={24} className={formData.deliveryMethod === 'delivery' ? 'text-brand-brown' : 'text-gray-400'} />
                  <span className="font-bold text-sm">Livraison à domicile</span>
                </label>
              </div>

              {/* Champ Adresse (visible uniquement si Livraison) */}
              {formData.deliveryMethod === 'delivery' && (
                <div className="animate-fade-in-down">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète / Quartier</label>
                  <textarea name="address" required rows="2" placeholder="Ex: Quartier Centre, Avenue de la Paix, Immeuble bleu..." className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-brand-beige outline-none" onChange={handleChange}></textarea>
                </div>
              )}
            </div>

            {/* 3. Date et Heure */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-brand-beige" /> Date souhaitée
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" required className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-brand-beige outline-none" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <input type="time" name="time" required className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-brand-beige outline-none" onChange={handleChange} />
                </div>
              </div>
            </div>

          </div>

          {/* --- COLONNE DROITE : RÉSUMÉ & VALIDATION --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Votre Commande</h3>
              
              {/* Liste miniature */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">1x {item.name}</span>
                    <span className="font-bold">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="border-t pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Livraison</span>
                  <span>{formData.deliveryMethod === 'delivery' ? 'À définir' : 'Gratuit'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-brand-brown mt-2">
                  <span>Total estimé</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Rappel Paiement */}
              <div className="bg-brand-beige/20 p-3 rounded-lg flex items-start gap-3 mb-6">
                <CreditCard size={20} className="text-brand-brown mt-1 shrink-0" />
                <p className="text-xs text-brand-brown leading-relaxed">
                  <strong>Aucun paiement maintenant.</strong><br/>
                  Vous paierez à la réception de votre commande (Espèces ou Mobile Money).
                </p>
              </div>

              {/* Bouton Validation */}
              <button 
                onClick={handleSubmit}
                className="w-full bg-brand-red text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition transform hover:-translate-y-1"
              >
                Envoyer la commande
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;