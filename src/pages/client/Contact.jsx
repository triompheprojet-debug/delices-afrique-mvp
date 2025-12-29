import React from 'react';
import { Phone, MapPin, Mail, Clock, Send, MessageCircle } from 'lucide-react';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message envoyé ! (Simulation)");
  };

  return (
    <div className="pb-20">
      
      {/* En-tête simple */}
      <div className="bg-brand-brown text-white py-16 text-center">
        <h1 className="text-4xl font-serif font-bold">Contactez-nous</h1>
        <p className="text-brand-beige mt-2">Une question ? Une commande spéciale ? Nous sommes là.</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- COLONNE GAUCHE : INFOS --- */}
          <div className="space-y-8">
            
            {/* Carte Infos */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-serif font-bold text-brand-brown mb-6">Nos Coordonnées</h2>
              
              <div className="space-y-6">
                {/* Téléphone */}
                <div className="flex items-start gap-4">
                  <div className="bg-brand-beige/20 p-3 rounded-full text-brand-brown">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Téléphone</h3>
                    <p className="text-gray-500 text-sm mb-1">Appelez-nous pour commander directement.</p>
                    <a href="tel:+242061234567" className="text-xl font-bold text-brand-brown hover:text-brand-red transition">
                      +242 06 123 45 67
                    </a>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="bg-brand-beige/20 p-3 rounded-full text-brand-brown">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Adresse</h3>
                    <p className="text-gray-500">
                      Avenue de la Paix, Centre Ville<br/>
                      Pointe-Noire, Congo
                    </p>
                  </div>
                </div>

                {/* Horaires */}
                <div className="flex items-start gap-4">
                  <div className="bg-brand-beige/20 p-3 rounded-full text-brand-brown">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Horaires d'ouverture</h3>
                    <ul className="text-gray-500 text-sm space-y-1">
                      <li className="flex justify-between w-48"><span>Lun - Ven :</span> <span className="font-bold text-brand-brown">07h30 - 19h00</span></li>
                      <li className="flex justify-between w-48"><span>Samedi :</span> <span className="font-bold text-brand-brown">08h00 - 20h00</span></li>
                      <li className="flex justify-between w-48 text-red-500"><span>Dimanche :</span> <span>Fermé</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bouton WhatsApp Rapide */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <a 
                  href="https://wa.me/242061234567" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] shadow-md"
                >
                  <MessageCircle size={20} />
                  Discuter sur WhatsApp
                </a>
              </div>
            </div>

            {/* Carte Google Maps (Image fictive pour le prototype) */}
            <div className="bg-gray-200 rounded-2xl h-64 w-full overflow-hidden shadow-inner flex items-center justify-center relative group cursor-pointer">
              <img 
                src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg" 
                alt="Carte" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
              />
              <div className="absolute bg-white px-4 py-2 rounded-lg shadow-lg font-bold text-brand-brown flex items-center gap-2">
                <MapPin size={16} className="text-brand-red" />
                Voir sur la carte
              </div>
            </div>

          </div>

          {/* --- COLONNE DROITE : FORMULAIRE --- */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-brown h-fit">
            <h2 className="text-2xl font-serif font-bold text-brand-brown mb-2">Envoyez un message</h2>
            <p className="text-gray-500 mb-6">Nous vous répondrons sous 24h.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Votre Nom</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-beige outline-none bg-gray-50 focus:bg-white transition" placeholder="Jean Dupont" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-beige outline-none bg-gray-50 focus:bg-white transition" placeholder="06 123 45 67" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email (Optionnel)</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-beige outline-none bg-gray-50 focus:bg-white transition" placeholder="jean@email.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                <textarea required rows="4" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-beige outline-none bg-gray-50 focus:bg-white transition" placeholder="Bonjour, faites-vous des gâteaux pour les mariages ?"></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-brand-brown hover:bg-brand-beige text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-2 transition-transform active:scale-95"
              >
                <Send size={20} />
                Envoyer le message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;