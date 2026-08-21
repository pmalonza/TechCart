const PRODUCT_IMAGES_KEY = 'techcart:product-images'

function loadProductImages() {
  try {
    const raw = localStorage.getItem(PRODUCT_IMAGES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getProductImage(productId) {
  return loadProductImages()[productId] ?? null
}

export function saveProductImage(productId, dataUrl) {
  const images = loadProductImages()
  images[productId] = dataUrl
  localStorage.setItem(PRODUCT_IMAGES_KEY, JSON.stringify(images))
}

export function removeProductImage(productId) {
  const images = loadProductImages()
  delete images[productId]
  localStorage.setItem(PRODUCT_IMAGES_KEY, JSON.stringify(images))
}
