import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Phone } from 'lucide-react';

const Confirmation = () => {
  // Numéro de commande fictif pour le prototype 
  const orderId = "CMD-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-brand-green">
        
        {/* Message de Succès */}
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-brand-green animate-bounce" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-brand-brown mb-2">
          Merci pour votre commande !
        </h1>
        <p className="text-gray-500 mb-8">
          Votre demande a bien été reçue. Nous allons vous contacter rapidement pour confirmation.
        </p>

        {/* Détails de la preuve */}
        <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Numéro de commande</p>
          <p className="text-2xl font-bold text-brand-brown mb-4">{orderId}</p>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-brand-beige"/>
              <span>En attente de confirmation téléphonique</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-brand-beige"/>
              <span>Paiement à la livraison / retrait</span>
            </div>
          </div>
        </div>

        {/* Message Important */}
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-8">
          ⚠️ Veuillez conserver ce numéro ou faire une capture d'écran.
        </div>

        <Link 
          to="/" 
          className="block w-full bg-brand-brown text-white py-3 rounded-xl font-bold hover:bg-brand-beige transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;