import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AppLayout from '../layouts/AppLayout';
import FlavorListPage from '../pages/customer/FlavorListPage';
import CreateFlavorPage from '../pages/customer/CreateFlavorPage';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireRole({ role }) {
  const { user } = useAuth();
  return user.roles.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route element={<RequireRole role="customer" />}>
              <Route path="/flavors" element={<FlavorListPage />} />
              <Route path="/flavors/new" element={<CreateFlavorPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
