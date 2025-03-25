import { Route, Routes } from 'react-router-dom'
import './App.css'
import { publicRoutes } from './routes'

function App() {

  return (
    <div>
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
      </Routes>
    </div>
  )
}

export default App