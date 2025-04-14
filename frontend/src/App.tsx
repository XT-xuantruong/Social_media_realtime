import { Route, Routes } from 'react-router-dom';
import { publicRoutes } from '@/routes';
import { SocketProvider } from '@/contexts/SocketContext';
import './App.css';

export default function App() {
  return (
    <SocketProvider>
      <Routes>
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
      </Routes>
    </SocketProvider>
  );
}