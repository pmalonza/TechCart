import { useEffect, useState } from 'react'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import AuthSection from './components/AuthSection'
import { PRODUCTS, getProduct } from './data/products'
import { loadAccounts, saveAccounts, findAccountByEmail } from './data/accounts'
import { loadSession, saveSession } from './data/session'
import { hashPassword } from './utils/hash'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [accounts, setAccounts] = useState(loadAccounts)
  const [currentUser, setCurrentUser] = useState(loadSession)
  const [selectedProductId, setSelectedProductId] = useState(null)

  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  useEffect(() => {
    saveSession(currentUser)
  }, [currentUser])

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
    return { ok: true }
  }

  function handleSignOut() {
    setCurrentUser(null)
  }

  function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(null)
  }

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false
    return true
  })

  const selectedProduct = selectedProductId ? getProduct(selectedProductId) : null

  return (
    <div className="app">
      <Header />
      <main>
        <AuthSection
          currentUser={currentUser}
          onSignUp={handleSignUp}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        {selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProductId(null)} />
        ) : (
          <>
            <CategoryNav
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={handleSelectCategory}
              onSelectSubcategory={setSelectedSubcategory}
            />
            <ProductList products={filteredProducts} onSelect={setSelectedProductId} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
