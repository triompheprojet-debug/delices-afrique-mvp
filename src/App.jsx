import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ConfigProvider } from './context/ConfigContext';
import ClientLayout from './components/layout/ClientLayout';

import Home from './pages/client/Home';
import Menu from './pages/client/Menu';
import Contact from './pages/client/Contact';
import About from './pages/client/About';
import Checkout from './pages/client/Checkout';
import Confirmation from './pages/client/Confirmation';




// ... autres imports existants
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/Products';
import OrdersAdmin from './pages/admin/Orders';
import SettingsAdmin from './pages/admin/Settings';

import Login from './pages/admin/Login'; // Import Login
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
      <ConfigProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Routes Client */}
              <Route path="/" element={<ClientLayout />}>
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="confirmation" element={<Confirmation />} />
              </Route>

              {/* Routes Admin (Nouvelle section) */}
              <Route path="/login" element={<Login />} />
              {/* Routes Admin SÉCURISÉES */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                {/* ... autres routes admin ... */}
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
                <Route path="settings" element={<SettingsAdmin />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
    </ConfigProvider>
  )
}

export default App;