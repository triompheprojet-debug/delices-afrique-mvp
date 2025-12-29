import React from 'react';
import { ShoppingBag, Calendar } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Image de fond (Pâtisserie vitrine/gâteaux)  */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1739132124985-6c9277e268b5?q=80&w=1139&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Vitrine Pâtisserie Délices d'Afrique" 
          className="w-full h-full object-cover brightness-50"
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
        
        {/* Logo textuel ou Badge */}
        <span className="uppercase tracking-widest text-sm font-bold text-brand-beige mb-4 block">
          Pâtisserie Artisanale
        </span>

        {/* Nom + Slogan [cite: 8] */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
          Délices d'Afrique
        </h1>
        
        {/* Message clé  */}
        <p className="text-lg md:text-2xl mb-10 text-gray-200 font-light max-w-2xl mx-auto">
          Des pâtisseries artisanales, fraîches chaque jour. 
          Le mariage parfait entre tradition et saveurs locales.
        </p>

        {/* Boutons CTA [cite: 11] */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          
          {/* Bouton Commander [cite: 12] */}
          <button className="bg-brand-red hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
            <ShoppingBag size={20} />
            Commander
          </button>

          {/* Bouton Réserver [cite: 13] */}
          <button className="bg-white hover:bg-gray-100 text-brand-brown px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-lg">
            <Calendar size={20} />
            Réserver une table
          </button>
        </div>

        {/* Info rapide (Rassurance) [cite: 4] */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-300">
          <span className="flex items-center gap-1">🌿 100% Frais</span>
          <span className="flex items-center gap-1">🏆 Savoir-faire</span>
          <span className="flex items-center gap-1">🛵 Livraison Locale</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;