/**
 * ========================================
 * Délices d'Afrique - ClientLayout
 * Layout premium avec header et navigation mobile
 * ========================================
 */

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Phone, MapPin, Clock, AlertTriangle,
  Home, Menu, Gift, User, Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import CartDrawer from '../client/CartDrawer';
import Modal from '../common/Modal';

const ClientLayout = () => {
  const { config, isOpenNow, loading } = useConfig();
  const { cartCount, setIsCartOpen, vendorConflict, resolveConflictNewCart, cancelConflict } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Détection du scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-cream-100">
        <div className="w-16 h-16 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin mb-4" />
        <p className="font-heading text-chocolate-700 animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (config.maintenanceMode) {
    return (
      <div className="h-screen bg-gradient-to-br from-chocolate-900 to-chocolate-800 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle size={40} className="text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-4">Maintenance en cours</h1>
        <p className="font-body text-chocolate-200 max-w-md text-lg">
          {config.bannerMessage || "Nous revenons très vite !"}
        </p>
      </div>
    );
  }

  return (
    <div className="font-sans text-chocolate-900 bg-cream-50 flex flex-col min-h-screen relative">
      
      {/* Bannière fermeture */}
      {!isOpenNow && !config.maintenanceMode && (
        <div className="bg-chocolate-800 text-white text-sm py-2.5 px-4 text-center flex items-center justify-center gap-2">
          <Clock size={16} />
          <span className="font-medium">Fermé • Ouverture : {config.openingTime}</span>
        </div>
      )}
      
      {/* Bannière message */}
      {config.bannerMessage && (
        <div className="bg-gold-600 text-white text-sm py-2.5 px-4 text-center font-medium">
          {config.bannerMessage}
        </div>
      )}

      {/* === HEADER (Desktop & Mobile) === */}
      <header 
        className={`
          sticky top-0 z-40 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' 
            : 'bg-white py-4 shadow-md'
          }
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <span className="font-display text-white text-2xl font-bold">D</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold text-chocolate-900 leading-none">
                  Délices d'Afrique
                </h1>
                <p className="font-body text-xs text-chocolate-600">Gastronomie Premium</p>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" label="Accueil" />
              <NavLink to="/menu" label="Menu" />
              <NavLink to="/about" label="À propos" />
              <NavLink to="/contact" label="Contact" />
              
              <Link 
                to="/partner/register"
                className="
                  flex items-center gap-2
                  bg-gradient-to-r from-gold-500 to-gold-600
                  hover:from-gold-600 hover:to-gold-700
                  text-white px-4 py-2 rounded-xl
                  font-heading font-semibold text-sm
                  shadow-md hover:shadow-lg
                  transition-all duration-300
                  transform hover:scale-105
                "
              >
                <Gift size={16} />
                <span>Devenir Partenaire</span>
              </Link>
            </nav>

            {/* Panier */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="
                relative p-3 hover:bg-chocolate-100 rounded-full
                transition-colors group
              "
            >
              <ShoppingBag 
                size={24} 
                className="text-chocolate-700 group-hover:text-gold-600 transition-colors" 
              />
              {cartCount > 0 && (
                <span className="
                  absolute -top-1 -right-1
                  bg-gradient-to-r from-primary-600 to-primary-700
                  text-white text-xs font-bold
                  h-6 w-6 flex items-center justify-center
                  rounded-full shadow-lg
                  animate-pulse
                ">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* === BOTTOM NAVIGATION (Mobile) === */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-chocolate-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 px-2">
          <BottomNavItem to="/" icon={Home} label="Accueil" />
          <BottomNavItem to="/menu" icon={Menu} label="Menu" />
          <BottomNavItem 
            to="/partner/register" 
            icon={Gift} 
            label="Gagner +" 
            highlighted 
          />
          <BottomNavItem to="/about" icon={Info} label="Infos" />
        </div>
      </nav>

      {/* === FOOTER (Desktop) === */}
      <footer className="hidden md:block bg-chocolate-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          {/* Grid Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Colonne 1 - Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center">
                  <span className="font-display text-white text-2xl font-bold">D</span>
                </div>
                <h3 className="font-display text-xl font-bold">Délices d'Afrique</h3>
              </div>
              <p className="text-chocolate-300 text-sm leading-relaxed mb-6">
                Pâtisserie artisanale premium. La gastronomie africaine réinventée.
              </p>
              {/* Social */}
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-600 flex items-center justify-center transition-colors">
                  <span className="text-xl">📸</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-600 flex items-center justify-center transition-colors">
                  <span className="text-xl">📘</span>
                </a>
              </div>
            </div>

            {/* Colonne 2 - Navigation */}
            <div>
              <h4 className="font-heading text-lg font-bold mb-6">Navigation</h4>
              <ul className="space-y-3 text-sm">
                <FooterLink to="/" label="Accueil" />
                <FooterLink to="/menu" label="Notre Menu" />
                <FooterLink to="/about" label="À Propos" />
                <FooterLink to="/contact" label="Contact" />
              </ul>
            </div>

            {/* Colonne 3 - Contact */}
            <div>
              <h4 className="font-heading text-lg font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-chocolate-300">
                <li className="flex gap-3">
                  <MapPin size={18} className="text-gold-500 shrink-0" />
                  <span>{config.address || 'Pointe-Noire, Congo'}</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={18} className="text-gold-500 shrink-0" />
                  <span>{config.phoneNumber || '+242 06 XXX XXXX'}</span>
                </li>
                <li className="flex gap-3">
                  <Clock size={18} className="text-gold-500 shrink-0" />
                  <span>{config.openingTime} - {config.closingTime}</span>
                </li>
              </ul>
            </div>

            {/* Colonne 4 - Partenaires */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="font-heading text-lg font-bold mb-3 text-gold-400 flex items-center gap-2">
                <Gift size={18} />
                Programme Partenaire
              </h4>
              <p className="text-chocolate-300 text-sm mb-4 leading-relaxed">
                Générez des revenus en partageant nos produits.
              </p>
              <Link 
                to="/partner/register"
                className="
                  block w-full
                  bg-gradient-to-r from-gold-500 to-gold-600
                  hover:from-gold-600 hover:to-gold-700
                  text-white font-bold py-3 rounded-xl
                  text-center transition-all duration-300
                  shadow-md hover:shadow-lg
                "
              >
                Devenir Partenaire
              </Link>
              <Link 
                to="/partner/login"
                className="block text-center text-chocolate-400 text-xs mt-3 hover:text-gold-400 transition-colors"
              >
                Déjà membre ? Connexion
              </Link>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-chocolate-400">
            <p>&copy; {new Date().getFullYear()} Délices d'Afrique. Tous droits réservés.</p>
            <Link to="/admin" className="opacity-0 hover:opacity-100 transition-opacity">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* CartDrawer */}
      <CartDrawer />

      {/* Modal Conflit Fournisseur */}
      <Modal
        isOpen={vendorConflict.isOpen}
        onClose={cancelConflict}
        title="Garantie Fraîcheur"
        variant="default"
        size="md"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={cancelConflict}
              className="
                flex-1 px-6 py-3
                bg-chocolate-100 hover:bg-chocolate-200
                text-chocolate-800 font-heading font-bold
                rounded-xl transition-colors
              "
            >
              Garder mon panier
            </button>
            <button
              onClick={resolveConflictNewCart}
              className="
                flex-1 px-6 py-3
                bg-gradient-to-r from-primary-600 to-primary-700
                hover:from-primary-700 hover:to-primary-800
                text-white font-heading font-bold
                rounded-xl transition-all
                shadow-lg hover:shadow-xl
              "
            >
              ✓ Créer nouveau panier
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-primary-50 p-4 rounded-xl border border-primary-200">
            <p className="font-body text-sm text-primary-900 leading-relaxed">
              Pour garantir la fraîcheur maximale et respecter la chaîne du froid, 
              nos artisans expédient leurs créations <strong>directement de leurs ateliers</strong>.
            </p>
          </div>
          
          <p className="font-body text-chocolate-600 text-center">
            Votre panier contient déjà des produits d'un autre artisan. 
            Les commandes sont traitées séparément pour assurer la qualité.
          </p>
        </div>
      </Modal>
    </div>
  );
};

/**
 * NavLink Desktop
 */
const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        font-heading text-sm font-semibold uppercase tracking-wide
        relative group py-2 transition-colors
        ${isActive ? 'text-gold-600' : 'text-chocolate-700 hover:text-gold-600'}
      `}
    >
      {label}
      <span 
        className={`
          absolute bottom-0 left-0 w-full h-0.5 bg-gold-600
          transform origin-left transition-transform duration-300
          ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
        `}
      />
    </Link>
  );
};

/**
 * Bottom Nav Item (Mobile)
 */
const BottomNavItem = ({ to, icon: Icon, label, highlighted }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      className={`
        flex flex-col items-center justify-center
        flex-1 py-2 transition-all
        ${highlighted ? 'relative -top-3' : ''}
      `}
    >
      <div className={`
        p-2.5 rounded-full mb-1 transition-all duration-300
        ${highlighted
          ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-gold scale-110'
          : isActive
            ? 'bg-gold-100 text-gold-600'
            : 'text-chocolate-400'
        }
      `}>
        <Icon size={highlighted ? 24 : 20} strokeWidth={2.5} />
      </div>
      <span className={`
        text-[10px] font-heading font-bold
        ${highlighted
          ? 'text-gold-600'
          : isActive
            ? 'text-gold-600'
            : 'text-chocolate-500'
        }
      `}>
        {label}
      </span>
    </button>
  );
};

/**
 * Footer Link
 */
const FooterLink = ({ to, label }) => (
  <li>
    <Link 
      to={to}
      className="text-chocolate-300 hover:text-gold-400 transition-colors flex items-center gap-2"
    >
      <span className="text-gold-500">→</span>
      {label}
    </Link>
  </li>
);

export default ClientLayout;