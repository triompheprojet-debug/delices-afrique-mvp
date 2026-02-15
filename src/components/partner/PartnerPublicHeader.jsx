import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Store, Info, Phone, Gift, Menu, X, 
  LogIn, UserPlus, ArrowRight 
} from 'lucide-react';

/**
 * 🎨 HEADER NAVIGATION POUR PAGES PUBLIQUES PARTENAIRE
 * Utilisé dans : PartnerLogin, PartnerRegister, PartnerProgramInfo
 * Design cohérent avec ClientLayout mais adapté au contexte partenaire
 */

const PartnerPublicHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation site client
  const clientNavItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/menu', icon: Store, label: 'Menu' },
    { path: '/about', icon: Info, label: 'À propos' },
    { path: '/contact', icon: Phone, label: 'Contact' },
  ];

  // Navigation parcours partenaire
  const partnerNavItems = [
    { path: '/partner/program', icon: Gift, label: 'Programme' },
    { path: '/partner/login', icon: LogIn, label: 'Connexion' },
    { path: '/partner/register', icon: UserPlus, label: 'Inscription' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center font-serif font-bold text-lg sm:text-xl text-white shadow-lg group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-base text-slate-100 leading-tight">
                Délices d'Afrique
              </h1>
              <p className="text-xs text-purple-400 font-bold">
                {location.pathname.includes('program') ? 'Programme Ambassadeur' : 
                 location.pathname.includes('register') ? 'Inscription' : 
                 'Espace Partenaire'}
              </p>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Navigation Client */}
            {clientNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-slate-800 mx-2"></div>

            {/* Navigation Partenaire */}
            {partnerNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Desktop - Conditionnel selon la page */}
          <div className="hidden lg:flex items-center gap-3">
            {!location.pathname.includes('register') && (
              <Link 
                to="/partner/register"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 text-sm"
              >
                <UserPlus size={16} />
                Rejoindre
              </Link>
            )}
            {!location.pathname.includes('login') && location.pathname.includes('register') && (
              <Link 
                to="/partner/login"
                className="text-slate-400 hover:text-purple-400 text-sm font-medium transition-all"
              >
                Déjà membre ?
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl"
            >
              <div className="py-4 space-y-1">
                {/* Section Client */}
                <p className="text-xs font-bold text-slate-500 uppercase px-4 py-2">Navigation Site</p>
                {clientNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}

                {/* Divider */}
                <div className="h-px bg-slate-800 my-3 mx-4"></div>

                {/* Section Partenaire */}
                <p className="text-xs font-bold text-slate-500 uppercase px-4 py-2">Espace Partenaire</p>
                {partnerNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}

                {/* CTA Mobile */}
                {!location.pathname.includes('register') && (
                  <div className="px-4 pt-4">
                    <Link 
                      to="/partner/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                      <UserPlus size={18} />
                      Rejoindre le programme
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default PartnerPublicHeader;