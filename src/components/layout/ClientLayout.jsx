import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Phone, Instagram, Facebook, AlertTriangle, Clock, 
  Home, UtensilsCrossed, MapPin, ArrowRight, Users, Gift, Star, 
  ThermometerSun, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import des Contextes
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import CartDrawer from '../client/CartDrawer';

const ClientLayout = () => {
  const { config, isOpenNow, loading } = useConfig();
  const { cartCount, setIsCartOpen, vendorConflict, resolveConflictNewCart, cancelConflict } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Détection du scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-brand-cream">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-brown mb-4"></div>
      <p className="text-brand-brown font-serif animate-pulse">Préparation de la boutique...</p>
    </div>
  );

  if (config.maintenanceMode) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6 animate-pulse"><AlertTriangle size={40} className="text-white"/></div>
        <h1 className="text-3xl font-bold mb-2">Maintenance en cours</h1>
        <p className="text-gray-400 max-w-md">{config.bannerMessage || "Nous revenons très vite !"}</p>
      </div>
    );
  }

  // Lien de la Bottom Bar (Mobile)
  const BottomNavLink = ({ to, icon: Icon, label, highlight }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex-1 flex flex-col items-center justify-center py-2 active:scale-95 transition-transform ${highlight ? 'relative -top-3' : ''}`}>
        <div className={`
            p-2 rounded-full mb-1 transition-all duration-300 shadow-sm
            ${highlight 
               ? 'bg-brand-brown text-white border-4 border-gray-50' 
               : isActive ? 'bg-brand-brown/10 text-brand-brown' : 'text-gray-400'
            }
        `}>
          <Icon size={highlight ? 24 : 22} strokeWidth={isActive || highlight ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-bold ${isActive ? 'text-brand-brown' : 'text-gray-400'} ${highlight ? 'text-brand-brown font-black' : ''}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="font-sans text-gray-800 bg-gray-50 flex flex-col min-h-screen relative">
      
      {/* Top Bar Info */}
      {!config.isShopOpen && !config.maintenanceMode && (
         <div className="bg-gray-800 text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
            <Clock size={14}/> <span>Fermé. Ouverture : {config.openingTime}</span>
         </div>
      )}
      
      {config.bannerMessage && (
        <div className="bg-brand-brown text-white text-xs py-2 px-4 text-center font-medium animate-marquee">
          {config.bannerMessage}
        </div>
      )}

      {/* --- NAVBAR (Desktop) --- */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 shadow-md ${isScrolled ? 'bg-brand-brown/95 backdrop-blur-md py-3' : 'bg-brand-brown py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          
          <Link to="/" className="text-2xl text-white font-serif font-bold tracking-wider">
            Délices <span className="text-brand-beige">d'Afrique</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['/', '/menu', '/contact'].map((path) => (
              <Link 
                key={path} to={path} 
                className={`text-sm font-bold uppercase tracking-wide transition-colors relative group py-2 ${location.pathname === path ? 'text-brand-beige' : 'text-white/80 hover:text-white'}`}
              >
                {path === '/' ? 'Accueil' : path.replace('/', '')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-beige transform origin-left transition-transform duration-300 ${location.pathname === path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            ))}
            
            <Link to="/partner" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition group">
                <Gift size={16} className="text-brand-beige group-hover:scale-110 transition"/>
                <span className="text-xs font-bold uppercase tracking-wide">Espace Partenaire</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-white/10 rounded-full transition-colors group">
               <ShoppingBag size={24} className="text-white group-hover:text-brand-beige transition-colors"/>
               {cartCount > 0 && <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-md border-2 border-brand-brown">{cartCount}</span>}
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* --- BOTTOM BAR (Mobile) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-end h-16 pb-2">
          <BottomNavLink to="/" icon={Home} label="Accueil" />
          <BottomNavLink to="/menu" icon={UtensilsCrossed} label="Menu" />
          <BottomNavLink to="/partner" icon={Gift} label="Gagner +" highlight={true} />
          <BottomNavLink to="/contact" icon={MapPin} label="Infos" />
        </div>
      </div>

      {/* --- FOOTER SITE (Desktop) --- */}
      <footer className="hidden md:block bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
           {/* (Contenu Footer identique à l'original...) */}
           <div className="grid grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <h3 className="font-serif text-2xl font-bold mb-4 text-brand-beige">Délices d'Afrique</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">Pâtisserie artisanale 2.0. Commandez en ligne, savourez chez vous.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-brown transition-colors"><Instagram size={18}/></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-brown transition-colors"><Facebook size={18}/></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Menu</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-brand-beige flex gap-2"><ArrowRight size={14}/> Accueil</Link></li>
                <li><Link to="/menu" className="hover:text-brand-beige flex gap-2"><ArrowRight size={14}/> Nos Gâteaux</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex gap-3"><MapPin className="text-brand-brown" size={18}/> {config.address}</li>
                <li className="flex gap-3"><Phone className="text-brand-brown" size={18}/> {config.phoneNumber}</li>
              </ul>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
               <h4 className="font-bold text-lg mb-3 text-brand-beige flex items-center gap-2"><Star className="fill-brand-beige text-brand-beige" size={18}/> Ambassadeurs</h4>
               <p className="text-gray-400 text-xs mb-4 leading-relaxed">Vous avez une audience ? Rejoignez notre programme et gagnez des commissions.</p>
               <div className="flex flex-col gap-2">
                 <Link to="/partner/register" className="bg-brand-brown text-white font-bold py-2 rounded-lg hover:bg-brand-beige transition-colors text-sm text-center">Devenir Partenaire</Link>
                 <Link to="/partner/login" className="text-gray-400 text-xs text-center hover:text-white underline">Déjà membre ? Connexion</Link>
               </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex justify-between items-center text-xs text-gray-500">
             <p>&copy; {new Date().getFullYear()} Délices d'Afrique.</p>
             <Link to="/admin" className="opacity-0 hover:opacity-100 transition">Admin Access</Link>
          </div>
        </div>
      </footer>

      <CartDrawer isOpen={Boolean(cartCount > -1)} /> 

      {/* --- MODALE CONFLICTUELLE "CONTINENTALE" --- */}
      <AnimatePresence>
        {vendorConflict.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={cancelConflict}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-orange-50 p-6 flex flex-col items-center text-center border-b border-orange-100">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-orange-500">
                  <ThermometerSun size={32} />
                </div>
                <h3 className="font-serif font-bold text-xl text-gray-800">Garantie Fraîcheur & Rapidité</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <Info className="text-blue-600 shrink-0 mt-0.5" size={20}/>
                   <p className="text-sm text-blue-900 leading-relaxed">
                     Pour vous assurer une dégustation optimale et un respect strict de la chaîne du chaud/froid, nos partenaires expédient leurs créations <strong>en direct de leurs ateliers</strong>.
                   </p>
                </div>
                
                <p className="text-gray-600 text-sm text-center">
                  Votre panier contient déjà des produits d'un autre artisan. Pour garantir la qualité, les commandes sont traitées séparément.
                </p>

                <div className="pt-2 space-y-3">
                  <button 
                    onClick={resolveConflictNewCart}
                    className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18}/> Créer un nouveau panier
                    <span className="text-[10px] font-normal opacity-70 block">(Remplace le panier actuel)</span>
                  </button>
                  
                  <button 
                    onClick={cancelConflict}
                    className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                  >
                    Annuler et garder mon panier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ClientLayout;