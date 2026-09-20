import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AppProviders from './context/AppProviders'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProductsPage from './pages/ProductsPage'

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppProviders>
  )
}
