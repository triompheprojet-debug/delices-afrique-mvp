import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Phone, Instagram, Facebook, AlertTriangle, Clock, 
  Home, UtensilsCrossed, MapPin, Gift, 
  ThermometerSun, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import des Contextes
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';

const ClientLayout = () => {
  const { config, isOpenNow, loading } = useConfig();
  const { cartCount, vendorConflict, resolveConflictNewCart, cancelConflict } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Détection du scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-slate-300 font-serif animate-pulse">Préparation...</p>
    </div>
  );

  if (config.maintenanceMode) {
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle size={40} className="text-white"/>
        </div>
        <h1 className="text-3xl font-bold mb-2">Maintenance en cours</h1>
        <p className="text-slate-400 max-w-md">{config.bannerMessage || "Nous revenons très vite !"}</p>
      </div>
    );
  }

  // Lien de la Bottom Bar (Mobile - Style App Native)
  const BottomNavLink = ({ to, icon: Icon, label, badge }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className="flex flex-col items-center justify-center gap-1 py-2 px-1 relative group"
      >
        <div className="relative">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`
              p-2.5 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-slate-400 group-active:bg-slate-800/50'
              }
            `}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </motion.div>
          {/* Badge panier */}
          {badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-slate-950">
              {badge}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-bold ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="font-sans text-slate-100 bg-slate-950 flex flex-col min-h-screen relative">
      
      {/* Top Bar Info - Version dark */}
      {!config.isShopOpen && !config.maintenanceMode && (
         <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
            <Clock size={14} className="text-purple-400"/> 
            <span>Fermé. Ouverture : {config.openingTime}</span>
         </div>
      )}
      
      {config.bannerMessage && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs py-2 px-4 text-center font-medium">
          {config.bannerMessage}
        </div>
      )}

      {/* --- NAVBAR (Desktop uniquement) --- */}
      <nav className={`hidden md:block sticky top-0 z-40 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md py-3 border-slate-800' 
          : 'bg-slate-900 py-4 border-slate-800'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          
          <Link to="/" className="text-2xl text-white font-serif font-bold tracking-wider">
            Délices <span className="text-purple-400">d'Afrique</span>
          </Link>

          <div className="flex items-center gap-8">
            {['/', '/menu', '/contact'].map((path) => (
              <Link 
                key={path} to={path} 
                className={`text-sm font-bold uppercase tracking-wide transition-colors relative group py-2 ${
                  location.pathname === path ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {path === '/' ? 'Accueil' : path.replace('/', '')}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 transform origin-left transition-transform duration-300 ${
                  location.pathname === path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </Link>
            ))}
            
            <Link 
              to="/partner" 
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition group"
            >
                <Gift size={16} className="text-purple-400 group-hover:scale-110 transition"/>
                <span className="text-xs font-bold uppercase tracking-wide">Espace Partenaire</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
             <Link to="/cart" className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-colors group">
               <ShoppingBag size={24} className="text-slate-300 group-hover:text-purple-400 transition-colors"/>
               {cartCount > 0 && (
                 <span className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-md">
                   {cartCount}
                 </span>
               )}
             </Link>
          </div>
        </div>
      </nav>

      {/* --- HEADER MOBILE (Style App Native) - Sans panier --- */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center font-serif font-bold text-white shadow-lg">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-none">Délices</span>
              <span className="text-xs text-purple-400 leading-none">d'Afrique</span>
            </div>
          </Link>
        </div>
      </div>

      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* --- BOTTOM BAR (Mobile - 5 boutons avec Panier circulaire style coupon) --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-3">
          <BottomNavLink to="/" icon={Home} label="Accueil" />
          <BottomNavLink to="/menu" icon={UtensilsCrossed} label="Menu" />
          
          {/* Panier style Coupon - Circulaire simple */}
          <Link to="/cart" className="flex flex-col items-center justify-center relative">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                location.pathname === '/cart'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800 border-2 border-slate-700'
              }`}
            >
              <ShoppingBag size={22} className="text-white" strokeWidth={2.5} />
              {/* Badge quantité */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-slate-950">
                  {cartCount}
                </span>
              )}
            </motion.div>
            <span className={`text-[10px] font-bold mt-1 ${
              location.pathname === '/cart' ? 'text-purple-400' : 'text-slate-500'
            }`}>
              Panier
            </span>
          </Link>
          
          <BottomNavLink to="/partner" icon={Gift} label="Gagner" />
          <BottomNavLink to="/contact" icon={Phone} label="Contact" />
        </div>
      </div>

      {/* --- FOOTER SITE (Desktop uniquement) --- */}
      <footer className="hidden md:block bg-slate-900 border-t border-slate-800 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <h3 className="font-serif text-2xl font-bold mb-4 text-purple-400">Délices d'Afrique</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Plateforme premium de pâtisserie artisanale. Commandez en ligne, savourez l'excellence.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <Instagram size={18}/>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <Facebook size={18}/>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Navigation</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-purple-400 transition-colors">Accueil</Link></li>
                <li><Link to="/menu" className="hover:text-purple-400 transition-colors">Nos Créations</Link></li>
                <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex gap-3">
                  <MapPin className="text-purple-400" size={18}/> 
                  {config.address || 'Pointe-Noire, Congo'}
                </li>
                <li className="flex gap-3">
                  <Phone className="text-purple-400" size={18}/> 
                  {config.phoneNumber || '+242 06 000 0000'}
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
               <h4 className="font-bold text-lg mb-3 text-purple-400 flex items-center gap-2">
                 <Gift size={18}/> Programme Ambassadeurs
               </h4>
               <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                 Transformez votre influence en revenus. Gagnez des commissions sur chaque vente.
               </p>
               <div className="flex flex-col gap-2">
                 <Link 
                   to="/partner/register" 
                   className="bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm text-center"
                 >
                   Rejoindre le programme
                 </Link>
                 <Link 
                   to="/partner/login" 
                   className="text-slate-500 text-xs text-center hover:text-purple-400 transition-colors"
                 >
                   Déjà membre ? Connexion
                 </Link>
               </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex justify-between items-center text-xs text-slate-500">
             <p>&copy; {new Date().getFullYear()} Délices d'Afrique. Tous droits réservés.</p>
             <Link to="/admin" className="opacity-0 hover:opacity-100 transition">Admin</Link>
          </div>
        </div>
      </footer>

      {/* --- MODALE CONFLIT FOURNISSEUR --- */}
      <AnimatePresence>
        {vendorConflict.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={cancelConflict}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-800"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 p-6 flex flex-col items-center text-center border-b border-slate-800">
                <div className="w-16 h-16 bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4 text-purple-400">
                  <ThermometerSun size={32} />
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-100">Garantie Fraîcheur</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                   <Info className="text-blue-400 shrink-0 mt-0.5" size={20}/>
                   <p className="text-sm text-slate-300 leading-relaxed">
                     Pour garantir la <strong className="text-white">fraîcheur optimale</strong>, nos créateurs expédient directement depuis leurs ateliers.
                   </p>
                </div>
                
                <p className="text-slate-400 text-sm text-center">
                  Votre panier contient déjà des produits d'un autre créateur. Les commandes doivent être séparées pour maintenir notre standard de qualité.
                </p>

                <div className="pt-2 space-y-3">
                  <button 
                    onClick={resolveConflictNewCart}
                    className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18}/> 
                    Créer un nouveau panier
                  </button>
                  
                  <button 
                    onClick={cancelConflict}
                    className="w-full bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition"
                  >
                    Garder mon panier actuel
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