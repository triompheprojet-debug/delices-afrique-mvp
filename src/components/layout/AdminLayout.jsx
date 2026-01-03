import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChefHat
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fonction de déconnexion
  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      await signOut(auth);
      navigate('/login');
    }
  };

  // Liens de navigation
  const navItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
    { path: '/admin/products', label: 'Produits', icon: <Package size={20} /> }, // Note le nom "Produits" ici
    { path: '/admin/settings', label: 'Paramètres', icon: <Settings size={20} /> },
  ];

  // Composant Lien pour éviter la répétition
  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setIsSidebarOpen(false)} // Ferme le menu sur mobile au clic
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium mb-1 ${
          isActive 
            ? 'bg-brand-brown text-white shadow-lg' 
            : 'text-gray-600 hover:bg-brand-beige/20 hover:text-brand-brown'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* --- SIDEBAR MOBILE (Overlay + Menu) --- */}
      {/* Fond sombre quand le menu est ouvert sur mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Le Menu Latéral lui-même */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo / Header Sidebar */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2 text-brand-brown font-serif font-bold text-xl">
            <ChefHat />
            <span>Admin Panel</span>
          </div>
          {/* Bouton fermer sur mobile uniquement */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute right-4 top-6 text-gray-400 md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2 overflow-y-auto flex-1">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Pied de page Sidebar (Déconnexion) */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>


      {/* --- CONTENU PRINCIPAL --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Mobile (Visible uniquement sur petits écrans) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden flex-shrink-0">
          <span className="font-bold text-gray-800">Menu Administration</span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Zone de Contenu (C'est ici que s'affichent Dashboard, Orders, etc.) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
          {/* Outlet affiche le composant de la route enfant */}
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;