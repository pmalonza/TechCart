import { useState } from 'react'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import ProductList from './components/ProductList'
import { PRODUCTS } from './data/products'
import './App.css'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

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
