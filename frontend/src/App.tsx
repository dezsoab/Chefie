import { AdminPage } from './pages/AdminPage';
import MenuPage from './pages/MenuPage';
import SetupPage from './pages/SetupPage';
import SetupRedirect from './pages/SetupRedirect';
import OrderStatusPage from './components/OrderStatusPage';
import KitchenPage from './components/KitchenPage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate, Route, Routes } from 'react-router';
import BoardPage from './components/BoardPage';

function App() {
  return (
    <Routes>
      <Route path="/kitchen" element={<ProtectedRoute><KitchenPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/setup" element={<ProtectedRoute><SetupRedirect /></ProtectedRoute>} />
      <Route path="/admin/events/:eventId/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
      <Route path="/" element={<MenuPage />} />
      <Route path="/orders/:id" element={<OrderStatusPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
