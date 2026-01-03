import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Phone, Instagram, Facebook, AlertTriangle, Clock } from 'lucide-react';

// Import des Contextes
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext'; // Logique V2

// Import du Panier (C'était manquant dans la V2 !)
import CartDrawer from '../client/CartDrawer';

const ClientLayout = () => {
  // --- LOGIQUE (Mélange V1 et V2) ---
  const { config, isOpenNow, loading } = useConfig();
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Écran de chargement
  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

  // 2. Mode Maintenance (Bloquant)
  if (config.maintenanceMode) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle size={40} className="text-white"/>
        </div>
        <h1 className="text-3xl font-bold mb-2">Site en maintenance</h1>
        <p className="text-gray-400 max-w-md">
          Nous mettons à jour notre cuisine numérique. Revenez vite !
        </p>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-500">
          Urgence ? <span className="text-white font-bold">{config.phoneNumber}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- BANNIÈRES D'INFORMATION (Logique V2) --- */}
      {config.bannerMessage && (
        <div className="bg-brand-brown text-brand-beige text-xs font-bold text-center py-2 px-4 border-b border-brand-beige/10">
          {config.bannerMessage}
        </div>
      )}

      {!isOpenNow && (
        <div className="bg-red-600 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2">
          <Clock size={14}/> 
          Fermé actuellement. (Ouverture à {config.openingTime})
        </div>
      )}

      {/* --- HEADER / NAVBAR (Design V1 Restauré) --- */}
      <header className="bg-brand-brown text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Logo (Style V1) */}
          <Link to="/" className="text-2xl font-serif font-bold tracking-wider">
            Délices <span className="text-brand-beige">d'Afrique</span>
          </Link>

          {/* Menu Desktop (Style V1) */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-brand-beige transition">Accueil</Link>
            <Link to="/menu" className="hover:text-brand-beige transition">Notre Menu</Link>
            <Link to="/contact" className="hover:text-brand-beige transition">Contact</Link>
          </nav>

          {/* Actions Droite */}
          <div className="flex items-center gap-4">
            
            {/* BOUTON PANIER (Réparé avec Style V1) */}
            <div 
              className="relative cursor-pointer hover:text-brand-beige transition p-1"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={24} />
              {/* Le badge s'affiche toujours s'il y a un count, ou même 0 selon votre préférence */}
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </div>

            {/* Bouton Mobile Menu */}
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile (Dropdown) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand-brown border-t border-brand-beige/20 pb-4">
            <nav className="flex flex-col space-y-4 px-4 pt-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-beige">Accueil</Link>
              <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-beige">Notre Menu</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-brand-beige">Contact</Link>
            </nav>
          </div>
        )}
      </header>

      {/* --- CONTENU --- */}
      <main className="flex-grow">
        <Outlet /> 
      </main>

      {/* --- COMPOSANT PANIER (Réintégré ici !) --- */}
      <CartDrawer />

      {/* --- FOOTER (Design V1 + Données Dynamiques V2) --- */}
      <footer className="bg-gray-900 text-white py-10 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 text-brand-beige">Délices d'Afrique</h3>
            <p className="text-gray-400 text-sm">
              Pâtisserie artisanale d'exception. <br/>
              {config.address || "Adresse non configurée"}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/menu" className="hover:text-white">Commander</Link></li>
              <li><Link to="/contact" className="hover:text-white">Nous trouver</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400 items-center md:items-start">
              <span className="flex items-center gap-2">
                 <Phone size={16}/> {config.phoneNumber || "+242 06 000 0000"}
              </span>
              <div className="flex gap-4 mt-2">
                <Instagram className="cursor-pointer hover:text-brand-beige" />
                <Facebook className="cursor-pointer hover:text-brand-beige" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 mt-10 border-t border-gray-800 pt-4">
          © 2024 Délices d'Afrique. Fait avec passion.
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;