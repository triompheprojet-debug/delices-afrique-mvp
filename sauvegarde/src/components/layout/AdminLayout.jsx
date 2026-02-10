import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Settings, 
  LogOut, Menu, X, Users, Truck // <--- AJOUT DE TRUCK
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Menu Admin
  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
    { path: '/admin/products', icon: Package, label: 'Produits & Stocks' },
    { path: '/admin/partners', icon: Users, label: 'Partenaires' },
    { path: '/admin/suppliers', icon: Truck, label: 'Fournisseurs' }, // <--- NOUVEAU LIEN
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex justify-between items-center">
        <span className="font-serif font-bold text-lg text-brand-brown">Admin</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative
      `}>
        <div className="p-8 border-b border-gray-100 hidden md:block">
          <h1 className="font-serif font-bold text-2xl text-gray-800">Délices<span className="text-brand-brown">Admin</span></h1>
        </div>

        <nav className="p-4 space-y-2 mt-16 md:mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${isActive 
                    ? 'bg-brand-brown text-white shadow-lg shadow-brand-brown/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-brown'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition px-4 py-2 w-full text-sm font-bold">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 pt-16 md:pt-0 h-screen overflow-y-auto bg-gray-50">
        <Outlet />
      </main>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;