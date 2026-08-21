import { useEffect, useState } from 'react'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import Filters from './components/Filters'
import SearchBar from './components/SearchBar'
import HotDeals from './components/HotDeals'
import AuthSection from './components/AuthSection'
import CartView from './components/CartView'
import CheckoutView from './components/CheckoutView'
import OrderConfirmation from './components/OrderConfirmation'
import ProfileView from './components/ProfileView'
import AddressBookView from './components/AddressBookView'
import OrderHistoryView from './components/OrderHistoryView'
import OrderTrackingView from './components/OrderTrackingView'
import HelpView from './components/HelpView'
import ContactView from './components/ContactView'
import PolicyView from './components/PolicyView'
import Newsletter from './components/Newsletter'
import ScrollTopBottomButton from './components/ScrollTopBottomButton'
import WishlistView from './components/WishlistView'
import { PRODUCTS, getProduct } from './data/products'
import { loadAccounts, saveAccounts, findAccountByEmail } from './data/accounts'
import { loadSession, saveSession } from './data/session'
import { loadCart, saveCart } from './data/cart'
import { loadWishlist, saveWishlist } from './data/wishlist'
import { loadOrders, saveOrders } from './data/orders'
import { loadAddresses, saveAddresses } from './data/addresses'
import { getNextOrderStatus } from './data/orderStatus'
import { calculateDiscount, findDiscountCode } from './data/discountCodes'
import { calculateDeliveryFee } from './data/deliveryFees'
import { RETURN_POLICY, WARRANTY_INFO } from './data/policies'
import { makeVariantId } from './utils/cartVariant'
import { hashPassword } from './utils/hash'
import { generateResetCode } from './utils/resetCode'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [accounts, setAccounts] = useState(loadAccounts)
  const [currentUser, setCurrentUser] = useState(loadSession)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [cart, setCart] = useState(() => loadCart(currentUser?.email))
  const [wishlist, setWishlist] = useState(() => loadWishlist(currentUser?.email))
  const [orders, setOrders] = useState(() => loadOrders(currentUser?.email))
  const [trackedOrderId, setTrackedOrderId] = useState(null)
  const [addresses, setAddresses] = useState(() => loadAddresses(currentUser?.email))
  const [view, setView] = useState('browse')
  const [lastOrder, setLastOrder] = useState(null)
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [passwordReset, setPasswordReset] = useState(null)
  const [pendingVerification, setPendingVerification] = useState(null)
  const [pendingSignup, setPendingSignup] = useState(null)

  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  useEffect(() => {
    saveSession(currentUser)
  }, [currentUser])

  useEffect(() => {
    saveCart(currentUser?.email, cart)
  }, [cart, currentUser])

  useEffect(() => {
    saveWishlist(currentUser?.email, wishlist)
  }, [wishlist, currentUser])

  useEffect(() => {
    saveOrders(currentUser?.email, orders)
  }, [orders, currentUser])

  useEffect(() => {
    saveAddresses(currentUser?.email, addresses)
  }, [addresses, currentUser])

  async function handleSignUp({ name, email, password }) {
    if (findAccountByEmail(accounts, email)) {
      return { ok: false, message: 'An account with this email already exists.' }
    }

    const code = generateResetCode()
    setPendingSignup({ name, email, password, code })
    return { ok: true, requiresVerification: true, code }
  }

  async function handleVerifySignUp({ email, code }) {
    const isMatch =
      pendingSignup &&
      pendingSignup.email.toLowerCase() === email.toLowerCase() &&
      pendingSignup.code === code
    if (!isMatch) {
      return { ok: false, message: 'Invalid or expired verification code.' }
    }

    const { name, email: signupEmail, password } = pendingSignup
    const passwordHash = await hashPassword(password)
    setAccounts((prev) => [...prev, { name, email: signupEmail, passwordHash }])
    setPendingSignup(null)
    return { ok: true, name }
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

    const code = generateResetCode()
    setPendingVerification({ name: account.name, email: account.email, code })
    return { ok: true, requiresVerification: true, code }
  }

  async function handleVerifySignIn({ email, code }) {
    const isMatch =
      pendingVerification &&
      pendingVerification.email.toLowerCase() === email.toLowerCase() &&
      pendingVerification.code === code
    if (!isMatch) {
      return { ok: false, message: 'Invalid or expired verification code.' }
    }

    setCurrentUser({ name: pendingVerification.name, email: pendingVerification.email })
    setCart(loadCart(pendingVerification.email))
    setWishlist(loadWishlist(pendingVerification.email))
    setOrders(loadOrders(pendingVerification.email))
    setAddresses(loadAddresses(pendingVerification.email))
    setPendingVerification(null)
    return { ok: true }
  }

  function handleSignOut() {
    setCurrentUser(null)
    setCart(loadCart(null))
    setWishlist(loadWishlist(null))
    setOrders(loadOrders(null))
    setAddresses(loadAddresses(null))
    setView('browse')
  }

  function handleRequestPasswordReset(email) {
    const account = findAccountByEmail(accounts, email)
    if (!account) {
      return { ok: false, message: 'No account found with that email.' }
    }

    const code = generateResetCode()
    setPasswordReset({ email: account.email, code })
    return { ok: true, code }
  }

  async function handleResetPassword({ email, code, newPassword }) {
    const isMatch =
      passwordReset &&
      passwordReset.email.toLowerCase() === email.toLowerCase() &&
      passwordReset.code === code
    if (!isMatch) {
      return { ok: false, message: 'Invalid or expired reset code.' }
    }

    const passwordHash = await hashPassword(newPassword)
    setAccounts((prev) =>
      prev.map((account) =>
        account.email.toLowerCase() === email.toLowerCase() ? { ...account, passwordHash } : account,
      ),
    )
    setPasswordReset(null)
    return { ok: true }
  }

  function handleUpdateProfile({ name }) {
    setAccounts((prev) =>
      prev.map((account) =>
        account.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...account, name } : account,
      ),
    )
    setCurrentUser((prev) => ({ ...prev, name }))
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

  function handleToggleWishlist(productId) {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  function handleRemoveFromWishlist(productId) {
    setWishlist((prev) => prev.filter((id) => id !== productId))
  }

  function handleApplyDiscount(code) {
    const found = findDiscountCode(code)
    if (!found) {
      return { ok: false, message: 'Invalid discount code.' }
    }
    setAppliedDiscount(found)
    return { ok: true }
  }

  function handleRemoveDiscount() {
    setAppliedDiscount(null)
  }

  function handlePlaceOrder({ address, paymentMethod, email }) {
    const order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: cartItems,
      subtotal: cartSubtotal,
      discountCode: appliedDiscount?.code ?? null,
      discountAmount: cartDiscountAmount,
      deliveryFee: cartDeliveryFee,
      total: checkoutTotal,
      address,
      paymentMethod,
      email,
      status: 'received',
    }
    setLastOrder(order)
    setOrders((prev) => [order, ...prev])
    setCart([])
    setAppliedDiscount(null)
    setView('confirmation')
  }

  function handleAddAddress({ label, street, city, postalCode }) {
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now().toString(36)}`,
        label,
        street,
        city,
        postalCode,
        isDefault: prev.length === 0,
      },
    ])
  }

  function handleRemoveAddress(addressId) {
    setAddresses((prev) => {
      const removed = prev.find((address) => address.id === addressId)
      const remaining = prev.filter((address) => address.id !== addressId)
      if (removed?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true }
      }
      return remaining
    })
  }

  function handleSetDefaultAddress(addressId) {
    setAddresses((prev) =>
      prev.map((address) => ({ ...address, isDefault: address.id === addressId })),
    )
  }

  function handleAdvanceOrderStatus(orderId) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const nextStatus = getNextOrderStatus(order.status)
        return nextStatus ? { ...order, status: nextStatus } : order
      }),
    )
  }

  function handleContinueShopping() {
    setLastOrder(null)
    setSelectedProductId(null)
    setView('browse')
  }

  function handleGoHome() {
    setSelectedProductId(null)
    setView('browse')
  }

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false
    if (minPrice !== '' && product.price < Number(minPrice)) return false
    if (maxPrice !== '' && product.price > Number(maxPrice)) return false
    if (
      searchQuery &&
      !`${product.name} ${product.description}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
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
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartDiscountAmount = calculateDiscount(appliedDiscount, cartSubtotal)
  const cartTotal = cartSubtotal - cartDiscountAmount
  const cartDeliveryFee = calculateDeliveryFee(cartSubtotal)
  const checkoutTotal = cartTotal + cartDeliveryFee

  const wishlistItems = wishlist.map((productId) => getProduct(productId)).filter(Boolean)

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onViewHome={handleGoHome}
        onViewCart={() => setView('cart')}
        onViewWishlist={() => setView('wishlist')}
        onViewOrders={() => setView('orders')}
        onViewHelp={() => setView('help')}
      />
      <main id="main-content">
        <AuthSection
          currentUser={currentUser}
          onSignUp={handleSignUp}
          onVerifySignUp={handleVerifySignUp}
          onSignIn={handleSignIn}
          onVerifySignIn={handleVerifySignIn}
          onSignOut={handleSignOut}
          onViewProfile={() => setView('profile')}
          onRequestPasswordReset={handleRequestPasswordReset}
          onResetPassword={handleResetPassword}
        />
        {view === 'order-tracking' && trackedOrderId ? (
          <OrderTrackingView
            order={orders.find((order) => order.id === trackedOrderId)}
            onBack={() => setView('orders')}
            onAdvanceStatus={handleAdvanceOrderStatus}
          />
        ) : view === 'orders' ? (
          <OrderHistoryView
            orders={orders}
            onBack={() => setView('browse')}
            onTrack={(orderId) => {
              setTrackedOrderId(orderId)
              setView('order-tracking')
            }}
          />
        ) : view === 'addresses' ? (
          <AddressBookView
            addresses={addresses}
            onBack={() => setView('profile')}
            onAdd={handleAddAddress}
            onRemove={handleRemoveAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        ) : view === 'wishlist' ? (
          <WishlistView
            items={wishlistItems}
            onBack={() => setView('browse')}
            onSelect={handleSelectProduct}
            onRemove={handleRemoveFromWishlist}
          />
        ) : view === 'contact' ? (
          <ContactView onBack={() => setView('help')} />
        ) : view === 'returns' ? (
          <PolicyView policy={RETURN_POLICY} onBack={() => setView('help')} />
        ) : view === 'warranty' ? (
          <PolicyView policy={WARRANTY_INFO} onBack={() => setView('help')} />
        ) : view === 'help' ? (
          <HelpView
            onBack={() => setView('browse')}
            onViewContact={() => setView('contact')}
            onViewReturns={() => setView('returns')}
            onViewWarranty={() => setView('warranty')}
          />
        ) : view === 'profile' && currentUser ? (
          <ProfileView
            user={currentUser}
            onBack={() => setView('browse')}
            onUpdateProfile={handleUpdateProfile}
            onViewAddresses={() => setView('addresses')}
          />
        ) : view === 'confirmation' && lastOrder ? (
          <OrderConfirmation order={lastOrder} onContinueShopping={handleContinueShopping} />
        ) : view === 'checkout' ? (
          <CheckoutView
            items={cartItems}
            onBack={() => setView('cart')}
            onPlaceOrder={handlePlaceOrder}
            subtotal={cartSubtotal}
            discount={appliedDiscount}
            discountAmount={cartDiscountAmount}
            deliveryFee={cartDeliveryFee}
            total={checkoutTotal}
            defaultEmail={currentUser?.email ?? ''}
            savedAddresses={addresses}
          />
        ) : view === 'cart' ? (
          <CartView
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onBack={() => setView('browse')}
            onCheckout={() => setView('checkout')}
            subtotal={cartSubtotal}
            discount={appliedDiscount}
            discountAmount={cartDiscountAmount}
            total={cartTotal}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
          />
        ) : selectedProduct ? (
          <ProductDetail
            key={selectedProduct.id}
            product={selectedProduct}
            onBack={() => setSelectedProductId(null)}
            onAddToCart={(variant) => handleAddToCart(selectedProduct, variant)}
            inWishlist={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
          />
        ) : (
          <>
            <HotDeals onSelect={handleSelectProduct} />
            <SearchBar query={searchQuery} onSearch={setSearchQuery} />
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
            <Newsletter />
          </>
        )}
      </main>
      <ScrollTopBottomButton />
    </div>
  )
}

export default App
