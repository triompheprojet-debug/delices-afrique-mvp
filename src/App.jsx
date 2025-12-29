import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // <-- Importation du Provider
import ClientLayout from './components/layout/ClientLayout';
import Home from './pages/client/Home';
import Menu from './pages/client/Menu';
import Contact from './pages/client/Contact';
import Checkout from './pages/client/Checkout';
import Confirmation from './pages/client/Confirmation';


// ... autres imports existants
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/Products';
import OrdersAdmin from './pages/admin/Orders';
import SettingsAdmin from './pages/admin/Settings';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes Client */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="contact" element={<Contact />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="confirmation" element={<Confirmation />} />
          </Route>

          {/* Routes Admin (Nouvelle section) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} /> {/* Redirige /admin vers Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App;