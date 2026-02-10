import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, ShoppingBag, 
  LogOut, Store, Menu, X, User,
  Home, Info, Phone, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Vérification de sécurité
  React.useEffect(() => {
    const session = sessionStorage.getItem('partnerSession');
    
    if (!session && !location.pathname.includes('register') && !location.pathname.includes('login') && !location.pathname.includes('program')) {
      navigate('/partner/login');
    }
  }, [navigate, location]);

  // Pages publiques (sans layout)
  if (location.pathname.includes('login') || location.pathname.includes('register') || location.pathname.includes('program')) {
    return <Outlet />;
  }

  const navItems = [
    { path: '/partner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/partner/sales', icon: ShoppingBag, label: 'Ventes' },
    { path: '/partner/wallet', icon: Wallet, label: 'Portefeuille' },
  ];

  const clientNavItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/menu', icon: Store, label: 'Menu' },
    { path: '/about', icon: Info, label: 'À propos' },
    { path: '/contact', icon: Phone, label: 'Contact' },
  ];

  const handleLogout = () => {
    if(window.confirm("Se déconnecter de l'espace partenaire ?")) {
      sessionStorage.removeItem('partnerSession');
      navigate('/partner/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      
      {/* ========================================
          HEADER GLOBAL - Visible partout
          ======================================== */}
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
                <p className="text-xs text-purple-400 font-bold">Espace Partenaire</p>
              </div>
            </Link>

            {/* Navigation Desktop - Client */}
            <nav className="hidden lg:flex items-center gap-1">
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

              {/* Badge Partner */}
              <div className="bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                <Gift className="text-purple-400" size={16} />
                <span className="text-purple-300 text-xs font-bold">Mode Ambassadeur</span>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-800 bg-slate-900"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {/* Navigation client mobile */}
                <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Navigation Site</p>
                {clientNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================
          LAYOUT PRINCIPAL
          ======================================== */}
      <div className="flex">
        
        {/* SIDEBAR DESKTOP - Navigation Partner */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-[calc(100vh-5rem)] top-20 z-40">
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 px-4">
              Espace Ambassadeur
            </div>
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-slate-800 my-4"></div>

            {/* Retour boutique */}
            <Link 
              to="/menu" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200 font-medium transition-all group"
            >
              <Store size={18} className="group-hover:scale-110 transition-transform"/> 
              <span>Retour Boutique</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition px-4 py-3 w-full text-sm font-medium rounded-xl hover:bg-slate-800/50"
            >
              <LogOut size={18} /> 
              Déconnexion
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-5rem)]">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ========================================
          BOTTOM NAV MOBILE - Navigation Partner
          ======================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-2">
          
          {/* Boutique */}
          <Link 
            to="/menu" 
            className="flex flex-col items-center gap-1 py-2 px-1"
          >
            <div className="p-2.5 rounded-xl text-slate-400 active:scale-95 transition-transform">
              <Store size={20} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Boutique</span>
          </Link>

          {/* Navigation Partner */}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="flex flex-col items-center gap-1 py-2 px-1"
              >
                <div className={`p-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'text-slate-400 active:bg-slate-800/50 active:scale-95'
                }`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PartnerLayout;