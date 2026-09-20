import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AppProviders from './context/AppProviders'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProductPage from './pages/ProductPage'
import ProductsPage from './pages/ProductsPage'

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppProviders>
  )
}
