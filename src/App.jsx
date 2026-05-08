import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Home from './pages/Home';
import CustomerLanding from './pages/customer/CustomerLanding';
import CustomerMenu from './pages/customer/CustomerMenu';
import Cart from './pages/customer/Cart';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import MenuManagement from './pages/admin/MenuManagement';
import ItemPairing from './pages/admin/ItemPairing';
import StaffManagement from './pages/admin/StaffManagement';
import OrderHistory from './pages/admin/OrderHistory';
import POSPanel from './pages/pos/POSPanel';
import WaiterPanel from './pages/waiter/WaiterPanel';

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/table/:tableId" element={<CustomerLanding />} />
          <Route path="/table/:tableId/menu" element={<CustomerMenu />} />
          <Route path="/table/:tableId/cart" element={<Cart />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="pairings" element={<ItemPairing />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="orders" element={<OrderHistory />} />
          </Route>
          <Route path="/pos" element={<POSPanel />} />
          <Route path="/waiter" element={<WaiterPanel />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
