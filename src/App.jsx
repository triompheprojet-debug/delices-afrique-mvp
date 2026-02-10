import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ConfigProvider } from './context/ConfigContext';
import ClientLayout from './components/layout/ClientLayout';

// Imports Pages Client
import Home from './pages/client/Home';
import Menu from './pages/client/Menu';
import Contact from './pages/client/Contact';
import About from './pages/client/About';
import Checkout from './pages/client/Checkout';
import Confirmation from './pages/client/Confirmation';
import Cart from './pages/client/Cart';

// Imports Pages Admin
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/Products';
import OrdersAdmin from './pages/admin/Orders';
import PartnersAdmin from './pages/admin/Partners';
import SuppliersAdmin from './pages/admin/Suppliers';
import SettingsAdmin from './pages/admin/Settings';
import Login from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Imports Partenaire
import PartnerLayout from './pages/partner/PartnerLayout';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerRegister from './pages/partner/PartnerRegister';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerSales from './pages/partner/PartnerSales';
import PartnerWallet from './pages/partner/PartnerWallet';
import PartnerProgramInfo from './pages/partner/PartnerProgramInfo';

import SupplierLayout from './pages/supplier/SupplierLayout';
import SupplierLogin from './pages/supplier/SupplierLogin';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierOrders from './pages/supplier/SupplierOrders';
import SupplierWallet from './pages/supplier/SupplierWallet';
import SupplierRules from './pages/supplier/SupplierRules';



function App() {
  return (
      <ConfigProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              
              {/* === SITE CLIENT === */}
              <Route path="/" element={<ClientLayout />}>
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="confirmation" element={<Confirmation />} />
                <Route path="Cart" element={<Cart />} />
              </Route>

              {/* === ESPACE ADMIN === */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="partners" element={<PartnersAdmin />} />
                <Route path="suppliers" element={<SuppliersAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
              </Route>

              {/* === ESPACE PARTENAIRE === */}
              <Route path="/partner" element={<PartnerLayout />}>
                <Route index element={<PartnerLogin />} />
                <Route path="login" element={<PartnerLogin />} />
                <Route path="register" element={<PartnerRegister />} />
                <Route path="program" element={<PartnerProgramInfo />} />
                <Route path="dashboard" element={<PartnerDashboard />} />
                <Route path="sales" element={<PartnerSales />} />
                <Route path="wallet" element={<PartnerWallet />} />
              </Route>

              <Route path="/fournisseur/:slug" element={<SupplierLayout />}>
                <Route index element={<SupplierLogin />} />
                <Route path="dashboard" element={<SupplierDashboard />} />
                <Route path="products" element={<SupplierProducts />} />
                <Route path="orders" element={<SupplierOrders />} />
                <Route path="wallet" element={<SupplierWallet />} />
                <Route path="rules" element={<SupplierRules />} />
              </Route>
              
            </Routes>
          </BrowserRouter>
        </CartProvider>
    </ConfigProvider>
  )
}

export default App;