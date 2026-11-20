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
import { ChefScope } from './i18n';

function App() {
  return (
    <Routes>
      <Route path="/kitchen" element={<ChefScope><ProtectedRoute><KitchenPage /></ProtectedRoute></ChefScope>} />
      <Route path="/admin" element={<ChefScope><ProtectedRoute><AdminPage /></ProtectedRoute></ChefScope>} />
      <Route path="/admin/setup" element={<ChefScope><ProtectedRoute><SetupRedirect /></ProtectedRoute></ChefScope>} />
      <Route path="/admin/events/:eventId/setup" element={<ChefScope><ProtectedRoute><SetupPage /></ProtectedRoute></ChefScope>} />
      <Route path="/" element={<MenuPage />} />
      <Route path="/orders/:id" element={<OrderStatusPage />} />
      <Route path="/login" element={<ChefScope><LoginPage /></ChefScope>} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
