import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ClipboardList, Settings, LogOut, Store } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  // Liste des liens du menu admin
  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/orders', icon: ClipboardList, label: 'Commandes' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Produits' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR GAUCHE --- */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        {/* Logo Admin */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold font-serif text-brand-beige">Admin Panel</h2>
          <p className="text-xs text-gray-500 mt-1">Délices d'Afrique</p>
        </div>

        {/* Menu de Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-brand-red text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pied de Sidebar */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-4 py-2">
            <Store size={16} /> Voir le site
          </Link>
          <button className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-4 py-2 w-full text-left">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Administration'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-brand-brown rounded-full text-white flex items-center justify-center font-bold">
              A
            </div>
            <span className="text-sm text-gray-600 font-medium">Admin Principal</span>
          </div>
        </header>

        <div className="p-8">
          <Outlet /> {/* C'est ici que s'afficheront Dashboard, Produits, etc. */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;