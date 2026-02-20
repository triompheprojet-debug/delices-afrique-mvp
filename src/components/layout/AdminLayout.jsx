import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Settings, 
  LogOut, Menu, X, Users, Truck 
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Menu Admin (Logique inchangée)
  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
    { path: '/admin/products', icon: Package, label: 'Produits & Stocks' },
    { path: '/admin/partners', icon: Users, label: 'Partenaires' },
    { path: '/admin/suppliers', icon: Truck, label: 'Fournisseurs' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex font-sans text-[var(--color-text-primary)] overflow-hidden selection:bg-[var(--color-primary)] selection:text-white">
      
      {/* MOBILE HEADER - Glass Effect & Gradient Text */}
      <div className="md:hidden fixed top-0 w-full glass-effect z-50 px-4 py-3 shadow-elegant flex justify-between items-center border-b border-[var(--color-border)]">
        <span className="font-display font-bold text-2xl gradient-text tracking-wide">
          Délices Admin
        </span>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] z-40 flex flex-col transform transition-transform duration-300 cubic-bezier(0.22, 1, 0.36, 1) shadow-elegant-lg
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative
      `}>
        {/* Brand Desktop */}
        <div className="p-8 border-b border-[var(--color-border)] hidden md:block">
          <h1 className="font-display font-bold text-3xl tracking-wide">
            Délices<span className="gradient-text">Admin</span>
          </h1>
        </div>

        {/* Navigation - Custom Scrollbar & Hover Lift */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar-thin p-4 space-y-3 mt-20 md:mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium hover-lift group
                  ${isActive 
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-elegant' 
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                  }`}
              >
                <item.icon 
                  size={20} 
                  className={isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors'} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar / Logout */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-pink)] hover:bg-[var(--color-bg-tertiary)] transition-all px-4 py-3 w-full text-sm font-bold rounded-xl hover-lift"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL - Animations & Grain Texture */}
      <main className="flex-1 pt-20 md:pt-0 h-screen overflow-y-auto custom-scrollbar relative grain-texture">
        <div className="animate-fade-in container-premium py-6 md:py-8 h-full">
          <Outlet />
        </div>
      </main>

      {/* OVERLAY MOBILE - Darkened for new theme */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;