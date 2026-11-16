import './App.css'
import { Route, Routes } from 'react-router/internal/react-server-client';
import { AdminPage } from './pages/AdminPage';
import MenuPage from './pages/MenuPage';
import OrderStatusPage from './components/OrderStatusPage';
import KitchenPage from './components/KitchenPage';

function App() {
  return (
    <Routes>
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/orders/:id" element={<OrderStatusPage />} />;
      <Route path="/kitchen" element={<KitchenPage />} />;
    </Routes>
  )
}

export default App
