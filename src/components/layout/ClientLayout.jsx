import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Phone, Instagram, Facebook, AlertTriangle, Clock, 
  Home, UtensilsCrossed, MapPin, ArrowRight 
} from 'lucide-react';

// Import des Contextes
import { useCart } from '../../context/CartContext';
import { useConfig } from '../../context/ConfigContext';
import CartDrawer from '../client/CartDrawer';

const ClientLayout = () => {
  const { config, isOpenNow, loading } = useConfig();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation(); // Pour savoir sur quelle page on est (active tab)
  const [isScrolled, setIsScrolled] = useState(false);

  // Détection du scroll pour l'effet de navbar sur PC
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. Écran de chargement
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-brand-cream">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-brown mb-4"></div>
      <p className="text-brand-brown font-serif animate-pulse">Préparation de la boutique...</p>
    </div>
  );

  // 2. Mode Maintenance (Bloquant)
  if (config.maintenanceMode) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <AlertTriangle size={40} className="text-white"/>
        </div>
        <h1 className="text-3xl font-bold mb-2">Maintenance en cours</h1>
        <p className="text-gray-400 max-w-md">
          {config.bannerMessage || "Nous améliorons notre fournil numérique. Revenez très vite !"}
        </p>
      </div>
    );
  }

  // --- COMPOSANTS INTERNES ---

  // Lien de la Bottom Bar (Mobile)
  const BottomNavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className="flex-1 flex flex-col items-center justify-center py-3 active:scale-95 transition-transform">
        <div className={`
            p-1.5 rounded-full mb-1 transition-colors duration-300
            ${isActive ? 'bg-brand-brown/10 text-brand-brown' : 'text-gray-400'}
        `}>
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-bold ${isActive ? 'text-brand-brown' : 'text-gray-400'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="font-sans text-gray-800 bg-gray-50 flex flex-col min-h-screen">
      
      {/* --- BANNIÈRES D'INFORMATION (Top) --- */}
      {!config.isShopOpen && !config.maintenanceMode && (
         <div className="bg-gray-800 text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
            <Clock size={14}/> 
            <span>Fermé actuellement. Ouverture : {config.openingTime}</span>
         </div>
      )}
      
      {config.bannerMessage && (
        <div className="bg-brand-brown text-white text-xs py-2 px-4 text-center font-medium animate-marquee">
          {config.bannerMessage}
        </div>
      )}

      {/* --- NAVBAR (Top) --- */}
      {/* Sur Mobile : Juste le Logo + Panier */}
      {/* Sur PC : Logo + Liens + Panier */}
      {/* --- NAVBAR (Top) --- */}
      <nav className={`
        sticky top-0 z-40 transition-all duration-300 shadow-md
        ${isScrolled ? 'bg-brand-brown/95 backdrop-blur-md py-3' : 'bg-brand-brown py-4'}
      `}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          
          {/* 1. LOGO (Couleurs inversées pour être visible sur le marron) */}
          <Link to="/" className="text-2xl text-white font-serif font-bold tracking-wider">
            Délices <span className="text-brand-beige">d'Afrique</span>
          </Link>

          {/* 2. LIENS DESKTOP (Textes en blanc) */}
          <div className="hidden md:flex items-center gap-8">
            {['/', '/menu', '/contact'].map((path) => (
              <Link 
                key={path}
                to={path} 
                className={`text-sm font-bold uppercase tracking-wide transition-colors relative group py-2
                  ${location.pathname === path ? 'text-brand-beige' : 'text-white/80 hover:text-white'}
                `}
              >
                {path === '/' ? 'Accueil' : path.replace('/', '')}
                {/* La ligne de soulignement devient beige */}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-beige transform origin-left transition-transform duration-300 ${location.pathname === path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            ))}
          </div>

          {/* 3. ACTIONS (Panier en blanc) */}
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsCartOpen(true)} 
               className="relative p-2 hover:bg-white/10 rounded-full transition-colors group"
             >
               {/* L'icône devient Blanche */}
               <ShoppingBag size={24} className="text-white group-hover:text-brand-beige transition-colors"/>
               
               {cartCount > 0 && (
                 <span className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-md border-2 border-brand-brown transform group-hover:scale-110 transition-transform">
                   {cartCount}
                 </span>
               )}
             </button>
          </div>
        </div>
      </nav>

      {/* --- CONTENU PRINCIPAL --- */}
      {/* pb-24 ajoute de l'espace en bas sur mobile pour ne pas que le contenu soit caché par la barre du bas */}
      <main className="flex-grow pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* --- FOOTER APP (MOBILE SEULEMENT) --- */}
      {/* 3 Boutons fixes en bas */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <BottomNavLink to="/" icon={Home} label="Accueil" />
          <BottomNavLink to="/menu" icon={UtensilsCrossed} label="Menu" />
          <BottomNavLink to="/contact" icon={MapPin} label="Contact" />
        </div>
      </div>

      {/* --- FOOTER SITE (DESKTOP SEULEMENT) --- */}
      {/* Design amélioré et caché sur mobile */}
      <footer className="hidden md:block bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          
          <div className="grid grid-cols-4 gap-12 mb-12">
            
            {/* Col 1: Marque */}
            <div className="col-span-1">
              <h3 className="font-serif text-2xl font-bold mb-4 text-brand-beige">Délices d'Afrique</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Une pâtisserie artisanale où chaque création raconte une histoire. Le mariage parfait entre tradition française et saveurs locales.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-brown transition-colors"><Instagram size={18}/></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-brown transition-colors"><Facebook size={18}/></a>
              </div>
            </div>
            
            {/* Col 2: Liens */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Navigation</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-brand-beige transition-colors flex items-center gap-2"><ArrowRight size={14}/> Accueil</Link></li>
                <li><Link to="/menu" className="hover:text-brand-beige transition-colors flex items-center gap-2"><ArrowRight size={14}/> Commander</Link></li>
                <li><Link to="/contact" className="hover:text-brand-beige transition-colors flex items-center gap-2"><ArrowRight size={14}/> Nous trouver</Link></li>
              </ul>
            </div>

            {/* Col 3: Contact */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                   <MapPin className="text-brand-brown mt-1 shrink-0" size={18}/>
                   <span>{config.address || "Centre Ville, Pointe-Noire"}</span>
                </li>
                <li className="flex items-center gap-3">
                   <Phone className="text-brand-brown shrink-0" size={18}/>
                   <span>{config.phoneNumber || "+242 06 000 0000"}</span>
                </li>
                <li className="flex items-center gap-3">
                   <Clock className="text-brand-brown shrink-0" size={18}/>
                   <span>{config.openingTime} - {config.closingTime}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter (Nouveau) */}
            <div>
               <h4 className="font-bold text-lg mb-6 text-white">Restez informé</h4>
               <p className="text-gray-500 text-xs mb-4">Recevez nos promos exclusives.</p>
               <form className="flex flex-col gap-2">
                 <input type="email" placeholder="Votre email..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-brown" />
                 <button className="bg-brand-brown text-white font-bold py-2 rounded-lg hover:bg-brand-beige transition-colors text-sm">S'abonner</button>
               </form>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex justify-between items-center text-xs text-gray-500">
             <p>&copy; {new Date().getFullYear()} Délices d'Afrique. Tous droits réservés.</p>
             <div className="flex gap-4">
                <a href="#" className="hover:text-white">Mentions Légales</a>
                <a href="#" className="hover:text-white">Confidentialité</a>
             </div>
          </div>
        </div>
      </footer>

      {/* --- CART DRAWER (Panier latéral) --- */}
      <CartDrawer isOpen={Boolean(cartCount > -1)} /> 
      {/* Note: isOpen est géré par le Context, j'ai simplifié la prop ici car le Drawer utilise le context aussi */}

    </div>
  );
};

export default ClientLayout;