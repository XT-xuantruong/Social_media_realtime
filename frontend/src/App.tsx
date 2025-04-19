import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { publicRoutes, privateRoutes } from '@/routes';
import './App.css';
import NotFoundPage from './pages/NotFoundPage';

// Component để bảo vệ private routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useSelector((state: RootState) => state.auth.token?.accessToken);
  const isAuthenticated = !!accessToken;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map(({ path, component: Component, layout: Layout }) => (
          <Route
            key={path}
            path={path}
            element={
              Layout ? (
                <Layout>
                  <Component />
                </Layout>
              ) : (
                <Component />
              )
            }
          />
        ))}

        {/* Private Routes */}
        {privateRoutes.map(({ path, component: Component, layout: Layout }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                {Layout ? (
                  <Layout>
                    <Component />
                  </Layout>
                ) : (
                  <Component />
                )}
              </ProtectedRoute>
            }
          />
        ))}

        {/* Route 404 (tùy chọn) */}
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
    </>
  );
}