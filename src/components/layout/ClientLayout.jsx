import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Phone, Instagram, Facebook } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../client/CartDrawer';

const ClientLayout = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- HEADER / NAVBAR --- */}
      <header className="bg-brand-brown text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-bold tracking-wider">
            Délices <span className="text-brand-beige">d'Afrique</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="hover:text-brand-beige transition">Accueil</Link>
            <Link to="/menu" className="hover:text-brand-beige transition">Notre Menu</Link>
            <Link to="/contact" className="hover:text-brand-beige transition">Contact</Link>
          </nav>

          {/* Actions Droite */}
          <div className="flex items-center gap-4">
           {/* Panier */}
            <div 
              className="relative cursor-pointer hover:text-brand-beige transition"
              onClick={() => setIsCartOpen(true)} // <-- Ouvre le panier
            >
              <ShoppingBag size={24} />
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount} {/* <-- Affiche le vrai compte */}
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

      {/* --- CONTENU DE LA PAGE --- */}
      <main className="flex-grow">
        {/* C'est ici que s'afficheront Home, Menu, etc. */}
        <Outlet /> 
      </main>

        <CartDrawer />
      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white py-10 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 text-brand-beige">Délices d'Afrique</h3>
            <p className="text-gray-400 text-sm">
              Pâtisserie artisanale d'exception. <br/>
              Commandez en ligne, payez à la livraison.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/menu" className="hover:text-white">Commander</Link></li>
              <li><Link to="/contact" className="hover:text-white">Nous trouver</Link></li>
              <li><Link to="/admin/login" className="hover:text-white">Espace Pro</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400 items-center md:items-start">
              <span className="flex items-center gap-2"><Phone size={16}/> +242 06 000 0000</span>
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