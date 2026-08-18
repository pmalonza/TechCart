import { useEffect, useState } from 'react'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import Filters from './components/Filters'
import AuthSection from './components/AuthSection'
import CartView from './components/CartView'
import CheckoutView from './components/CheckoutView'
import OrderConfirmation from './components/OrderConfirmation'
import { PRODUCTS, getProduct } from './data/products'
import { loadAccounts, saveAccounts, findAccountByEmail } from './data/accounts'
import { loadSession, saveSession } from './data/session'
import { loadCart, saveCart } from './data/cart'
import { makeVariantId } from './utils/cartVariant'
import { hashPassword } from './utils/hash'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [accounts, setAccounts] = useState(loadAccounts)
  const [currentUser, setCurrentUser] = useState(loadSession)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [cart, setCart] = useState(() => loadCart(currentUser?.email))
  const [view, setView] = useState('browse')
  const [lastOrder, setLastOrder] = useState(null)

  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  useEffect(() => {
    saveSession(currentUser)
  }, [currentUser])

  useEffect(() => {
    saveCart(currentUser?.email, cart)
  }, [cart, currentUser])

  async function handleSignUp({ name, email, password }) {
    if (findAccountByEmail(accounts, email)) {
      return { ok: false, message: 'An account with this email already exists.' }
    }

    const passwordHash = await hashPassword(password)
    setAccounts((prev) => [...prev, { name, email, passwordHash }])
    return { ok: true }
  }

  async function handleSignIn({ email, password }) {
    const account = findAccountByEmail(accounts, email)
    if (!account) {
      return { ok: false, message: 'No account found with that email.' }
    }

    const passwordHash = await hashPassword(password)
    if (passwordHash !== account.passwordHash) {
      return { ok: false, message: 'Incorrect password.' }
    }

    setCurrentUser({ name: account.name, email: account.email })
    setCart(loadCart(account.email))
    return { ok: true }
  }

  function handleSignOut() {
    setCurrentUser(null)
    setCart(loadCart(null))
  }

  function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null)
  }

  function handleSelectProduct(productId) {
    setSelectedProductId(productId)
    setView('browse')
  }

  function handleAddToCart(product, { colorId, size, quantity }) {
    const variantId = makeVariantId(product.id, colorId, size)
    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === variantId)
      if (existing) {
        return prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prev, { variantId, productId: product.id, colorId, size, quantity }]
    })
  }

  function handleUpdateCartQuantity(variantId, quantity) {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.variantId !== variantId)
        : prev.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
    )
  }

  function handleRemoveFromCart(variantId) {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId))
  }

  function handlePlaceOrder({ address, paymentMethod }) {
    const order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      address,
      paymentMethod,
    }
    setLastOrder(order)
    setCart([])
    setView('confirmation')
  }

  function handleContinueShopping() {
    setLastOrder(null)
    setSelectedProductId(null)
    setView('browse')
  }

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false
    if (minPrice !== '' && product.price < Number(minPrice)) return false
    if (maxPrice !== '' && product.price > Number(maxPrice)) return false
    if (selectedColor && !product.colors.some((color) => color.id === selectedColor)) return false
    return true
  })

  const selectedProduct = selectedProductId ? getProduct(selectedProductId) : null

  const cartItems = cart
    .map((item) => {
      const product = getProduct(item.productId)
      if (!product) return null
      const colorLabel = product.colors.find((color) => color.id === item.colorId)?.label
      return { ...item, product, colorLabel }
    })
    .filter(Boolean)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="app">
      <Header cartCount={cartCount} onViewCart={() => setView('cart')} />
      <main>
        <AuthSection
          currentUser={currentUser}
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        {view === 'confirmation' && lastOrder ? (
          <OrderConfirmation order={lastOrder} onContinueShopping={handleContinueShopping} />
        ) : view === 'checkout' ? (
          <CheckoutView
            items={cartItems}
            onBack={() => setView('cart')}
            onPlaceOrder={handlePlaceOrder}
          />
        ) : view === 'cart' ? (
          <CartView
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onBack={() => setView('browse')}
            onCheckout={() => setView('checkout')}
          />
        ) : selectedProduct ? (
          <ProductDetail
            key={selectedProduct.id}
            product={selectedProduct}
            onBack={() => setSelectedProductId(null)}
            onAddToCart={(variant) => handleAddToCart(selectedProduct, variant)}
          />
        ) : (
          <>
            <CategoryNav
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={handleSelectCategory}
              onSelectSubcategory={setSelectedSubcategory}
            />
            <Filters
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />
            <ProductList products={filteredProducts} onSelect={handleSelectProduct} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
