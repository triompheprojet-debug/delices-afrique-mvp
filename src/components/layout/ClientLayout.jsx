import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
// ... (tes imports restent identiques)
import { 
  ShoppingBag, Phone, Instagram, Facebook, AlertTriangle, Clock, 
  Home, UtensilsCrossed, MapPin, Gift, 
  ThermometerSun, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';

const ClientLayout = () => {
  const { config, isOpenNow, loading } = useConfig();
  const { cartCount, vendorConflict, resolveConflictNewCart, cancelConflict } = useCart();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileNav, setShowMobileNav] = useState(true);

  // ... (Ton useEffect pour le scroll desktop reste identique)

  // --- LOGIQUE MOBILE : Scroll Intelligente ---
  useEffect(() => {
    let scrollTimeout;

    const handleMobileScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 1. Logique de Direction
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowMobileNav(false);
      } 
      else if (currentScrollY < lastScrollY) {
        setShowMobileNav(true);
      }
      
      setLastScrollY(currentScrollY);

      // 2. Logique "Arrêt du scroll"
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setShowMobileNav(true);
      }, 600);
    };

    window.addEventListener('scroll', handleMobileScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleMobileScroll);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

  // --- NOUVEAU : Réafficher la barre quand le panier change ---
  useEffect(() => {
    // Si le panier est modifié (ajout d'un produit), on réaffiche la navbar immédiatement
    if (cartCount > 0) {
      setShowMobileNav(true);
    }
  }, [cartCount]); 

  if (loading) return (
    // ... (Ton loading reste identique)
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-slate-300 font-serif animate-pulse">Chargement...</p>
    </div>
  );

  if (config.maintenanceMode) {
     // ... (Ton mode maintenance reste identique)
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle size={40} className="text-white"/>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Maintenance en cours</h1>
        <p className="text-slate-400 max-w-md text-sm sm:text-base">{config.bannerMessage || "Nous revenons très vite !"}</p>
      </div>
    );
  }

  // ... (Ton composant BottomNavLink reste identique)
  const BottomNavLink = ({ to, icon: Icon, label, badge }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 relative group min-w-0 flex-1"
      >
        <div className="relative">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-slate-400'
              }
            `}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          </motion.div>
          {badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-lg border-2 border-slate-950">
              {badge}
            </span>
          )}
        </div>
        <span className={`text-[9px] font-bold truncate max-w-full ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="font-sans text-slate-100 bg-slate-950 flex flex-col min-h-screen relative">
      
      {/* ... (Top Bar et Navbar Desktop restent identiques) ... */}
      {!config.isShopOpen && !config.maintenanceMode && (
         <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-[11px] sm:text-xs py-1.5 sm:py-2 px-4 text-center flex items-center justify-center gap-2">
            <Clock size={12} className="text-purple-400 sm:w-3.5 sm:h-3.5"/> 
            <span>Fermé • Ouverture : {config.openingTime}</span>
         </div>
      )}
      
      {config.bannerMessage && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-4 text-center font-medium">
          {config.bannerMessage}
        </div>
      )}

      <nav className={`hidden lg:block sticky top-0 z-40 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md py-3 border-slate-800' 
          : 'bg-slate-900 py-4 border-slate-800'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
          <Link to="/" className="text-xl lg:text-2xl text-white font-serif font-bold tracking-wider">
            Délices <span className="text-purple-400">d'Afrique</span>
          </Link>
          <div className="flex items-center gap-6 lg:gap-8">
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
                <span className="text-xs font-bold uppercase tracking-wide">Partenaire</span>
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

      <main className="flex-grow pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* --- BOTTOM BAR MOBILE (MODIFIÉE) --- */}
      <motion.div 
        initial={{ y: 0 }}
        // MODIFICATION ICI : On utilise "160%" au lieu de "100%"
        // Cela force la barre à descendre plus bas pour cacher le bouton flottant
        animate={{ y: showMobileNav ? 0 : "160%" }} 
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe shadow-2xl"
      >
        <div className="grid grid-cols-5 gap-0 px-2 py-1.5 pb-safe-offset-2">
          <BottomNavLink to="/" icon={Home} label="Accueil" />
          <BottomNavLink to="/menu" icon={UtensilsCrossed} label="Menu" />
          
          <Link to="/cart" className="flex flex-col items-center justify-center relative -mt-4">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${
                location.pathname === '/cart'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 ring-4 ring-slate-900'
                  : 'bg-slate-800 border border-slate-700 ring-4 ring-slate-900'
              }`}
            >
              <ShoppingBag size={22} className="text-white" strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0 -right-0 bg-pink-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-slate-900">
                  {cartCount}
                </span>
              )}
            </motion.div>
            <span className={`text-[9px] font-bold mt-1 ${
              location.pathname === '/cart' ? 'text-purple-400' : 'text-slate-500'
            }`}>
              Panier
            </span>
          </Link>
          
          <BottomNavLink to="/partner" icon={Gift} label="Gagner" />
          <BottomNavLink to="/contact" icon={Phone} label="Contact" />
        </div>
      </motion.div>

      {/* ... (Footer et Modale restent identiques) ... */}
      <footer className="hidden lg:block bg-slate-900 border-t border-slate-800 text-white pt-12 lg:pt-16 pb-8">
        {/* ... Contenu Footer ... */}
         <div className="container mx-auto px-4 max-w-7xl">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div className="col-span-1">
              <h3 className="font-serif text-xl lg:text-2xl font-bold mb-4 text-purple-400">Délices d'Afrique</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Plateforme premium de pâtisserie artisanale. Commandez en ligne, savourez l'excellence.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="Instagram">
                  <Instagram size={18}/>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="Facebook">
                  <Facebook size={18}/>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-base lg:text-lg mb-4 lg:mb-6 text-white">Navigation</h4>
              <ul className="space-y-2 lg:space-y-3 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-purple-400 transition-colors">Accueil</Link></li>
                <li><Link to="/menu" className="hover:text-purple-400 transition-colors">Nos Créations</Link></li>
                <li><Link to="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-base lg:text-lg mb-4 lg:mb-6 text-white">Contact</h4>
              <ul className="space-y-3 lg:space-y-4 text-sm text-slate-400">
                <li className="flex gap-3">
                  <MapPin className="text-purple-400 flex-shrink-0" size={18}/> 
                  <span>{config.address || 'Pointe-Noire, Congo'}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="text-purple-400 flex-shrink-0" size={18}/> 
                  <span>{config.phoneNumber || '+242 06 000 0000'}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-5 lg:p-6 rounded-xl border border-slate-700/50">
               <h4 className="font-bold text-base lg:text-lg mb-3 text-purple-400 flex items-center gap-2">
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
          
          <div className="border-t border-slate-800 pt-6 lg:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
             <p>&copy; {new Date().getFullYear()} Délices d'Afrique. Tous droits réservés.</p>
             <Link to="/admin" className="opacity-0 hover:opacity-100 transition">Admin</Link>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {vendorConflict.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={cancelConflict}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-800"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 p-5 sm:p-6 flex flex-col items-center text-center border-b border-slate-800">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-3 sm:mb-4 text-purple-400">
                  <ThermometerSun size={28} className="sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-100">Garantie Fraîcheur</h3>
              </div>
              
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3 bg-blue-500/10 p-3 sm:p-4 rounded-xl border border-blue-500/20">
                   <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                   <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                     Pour garantir la <strong className="text-white">fraîcheur optimale</strong>, nos créateurs expédient directement depuis leurs ateliers.
                   </p>
                </div>
                
                <p className="text-slate-400 text-xs sm:text-sm text-center leading-relaxed">
                  Votre panier contient déjà des produits d'un autre créateur. Les commandes doivent être séparées pour maintenir notre standard de qualité.
                </p>

                <div className="pt-2 space-y-2 sm:space-y-3">
                  <button 
                    onClick={resolveConflictNewCart}
                    className="w-full bg-purple-600 text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle size={18}/> 
                    Créer un nouveau panier
                  </button>
                  
                  <button 
                    onClick={cancelConflict}
                    className="w-full bg-slate-800 text-slate-300 font-bold py-2.5 sm:py-3 rounded-xl hover:bg-slate-700 transition text-sm"
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