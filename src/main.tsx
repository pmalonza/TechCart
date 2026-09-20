import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/base.css'
import './styles/layout.css'
import './styles/catalog.css'
import './styles/product-detail.css'
import './styles/search.css'
import './styles/filters.css'
import './styles/back-button.css'
import './styles/cart.css'
import './styles/wishlist.css'
import './styles/account.css'
import './styles/checkout.css'
import './styles/sell.css'
import './styles/footer.css'
import './styles/help.css'
import './styles/back-to-top.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
