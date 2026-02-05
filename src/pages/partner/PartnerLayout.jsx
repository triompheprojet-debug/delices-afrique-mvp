import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, ShoppingBag, 
  LogOut, ChevronRight, Store, ArrowLeft 
} from 'lucide-react';

const PartnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Vérif session rapide
  React.useEffect(() => {
    // On vérifie la session SAUF si on est sur login/register
    if (!localStorage.getItem('partnerSession') && !location.pathname.includes('register') && !location.pathname.includes('login')) {
      navigate('/partner/login');
    }
  }, [navigate, location]);

  // Si on est sur les pages publiques (login/register), on affiche juste le contenu sans le menu
  if (location.pathname.includes('login') || location.pathname.includes('register')) {
    return <Outlet />;
  }

  // --- MENU DE NAVIGATION ---
  const navItems = [
    { path: '/partner/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/partner/sales', icon: ShoppingBag, label: 'Ventes' },
    { path: '/partner/wallet', icon: Wallet, label: 'Finances' },
  ];

  const handleLogout = () => {
    if(window.confirm("Se déconnecter de l'espace partenaire ?")) {
      localStorage.removeItem('partnerSession');
      navigate('/partner/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* === 1. SIDEBAR (ORDINATEUR) === */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-8 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-brown text-white rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg group-hover:scale-105 transition">D</div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight">Délices<br/><span className="text-brand-brown">Partenaires</span></h1>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {/* LIEN DE RETOUR VERS LE SITE (LE PONT) */}
          <Link to="/menu" className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-800 bg-gray-100 hover:bg-gray-200 font-bold mb-6 transition-all">
             <ArrowLeft size={20}/> 
             <span>Retour Boutique</span>
          </Link>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">Menu</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-brand-brown text-white shadow-md shadow-brand-brown/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-brown'
                  }`}
              >
                <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto opacity-50"/>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition px-4 py-2 w-full text-sm font-medium">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* === 2. CONTENU PRINCIPAL === */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-8 relative">
        {/* Header Mobile Simplifié */}
        <div className="md:hidden bg-white p-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
           <div className="font-serif font-bold text-lg text-brand-brown">Espace Partenaire</div>
           <button onClick={handleLogout} className="p-2 bg-gray-100 rounded-full text-gray-500"><LogOut size={16}/></button>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* === 3. BOTTOM BAR (MOBILE) === */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-end h-20 px-2 z-40 pb-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        
        {/* LIEN DE RETOUR VERS LA BOUTIQUE (LE PONT MOBILE) */}
        <Link 
          to="/menu" 
          className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600 active:scale-95 transition"
        >
          <div className="p-2 rounded-full border border-gray-100">
             <Store size={22} />
          </div>
          <span className="text-[10px] font-bold">Boutique</span>
        </Link>

        {/* LIENS PARTENAIRE */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-brand-brown -translate-y-2' : 'text-gray-400'}`}
            >
              <div className={`p-2 rounded-full ${isActive ? 'bg-brand-brown text-white shadow-lg' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
};

export default PartnerLayout;