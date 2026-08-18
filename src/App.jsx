import { useEffect, useState } from 'react'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import ProductList from './components/ProductList'
import AuthSection from './components/AuthSection'
import { PRODUCTS } from './data/products'
import { loadAccounts, saveAccounts, findAccountByEmail } from './data/accounts'
import { hashPassword } from './utils/hash'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [accounts, setAccounts] = useState(loadAccounts)

  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  async function handleSignUp({ name, email, password }) {
    if (findAccountByEmail(accounts, email)) {
      return { ok: false, message: 'An account with this email already exists.' }
    }

    const passwordHash = await hashPassword(password)
    setAccounts((prev) => [...prev, { name, email, passwordHash }])
    return { ok: true }
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

  return (
    <div className="app">
      <Header />
      <main>
        <AuthSection onSignUp={handleSignUp} />
        <CategoryNav
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={handleSelectCategory}
          onSelectSubcategory={setSelectedSubcategory}
        />
        <ProductList products={filteredProducts} />
      </main>
    </div>
  )
}

export default App
