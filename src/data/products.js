export const PRODUCTS = [
  // Refrigerators
  {
    id: 'ref-1',
    name: 'FrostGuard 18cu.ft Top-Freezer Refrigerator',
    category: 'electronics',
    subcategory: 'refrigerators',
    price: 649.99,
    description: 'Spacious top-freezer fridge with adjustable glass shelving.',
    colors: [
      { id: 'white', label: 'White', hex: '#f8f9fa' },
      { id: 'black', label: 'Black', hex: '#212529' },
      { id: 'stainless', label: 'Stainless Steel', hex: '#adb5bd' },
    ],
  },
  {
    id: 'ref-2',
    name: 'ChillPro French Door Refrigerator',
    category: 'electronics',
    subcategory: 'refrigerators',
    price: 1399.0,
    description: 'French door fridge with in-door ice and water dispenser.',
    colors: [
      { id: 'stainless', label: 'Stainless Steel', hex: '#adb5bd' },
      { id: 'black', label: 'Black Stainless', hex: '#343a40' },
    ],
  },
  {
    id: 'ref-3',
    name: 'CompactCool Mini Fridge',
    category: 'electronics',
    subcategory: 'refrigerators',
    price: 129.5,
    description: 'Small-space fridge, ideal for dorms and offices.',
    colors: [
      { id: 'white', label: 'White', hex: '#f8f9fa' },
      { id: 'black', label: 'Black', hex: '#212529' },
      { id: 'red', label: 'Red', hex: '#e03131' },
    ],
  },
  // TVs
  {
    id: 'tv-1',
    name: 'VividView 55" 4K QLED TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 549.99,
    description: 'Vibrant 4K QLED display with built-in streaming apps.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
  },
  {
    id: 'tv-2',
    name: 'VividView 65" 4K OLED TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 999.0,
    description: 'Deep blacks and true-to-life color with OLED panel technology.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
  },
  {
    id: 'tv-3',
    name: 'ClearScreen 32" HD TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 179.99,
    description: 'Compact HD TV, great for bedrooms and kitchens.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
  },
  // Vacuums
  {
    id: 'vac-1',
    name: 'SweepMaster Robot Vacuum',
    category: 'electronics',
    subcategory: 'vacuums',
    price: 249.99,
    description: 'Self-navigating robot vacuum with app scheduling.',
    colors: [
      { id: 'white', label: 'White', hex: '#f8f9fa' },
      { id: 'black', label: 'Black', hex: '#212529' },
    ],
  },
  {
    id: 'vac-2',
    name: 'PowerSuck Cordless Stick Vacuum',
    category: 'electronics',
    subcategory: 'vacuums',
    price: 159.0,
    description: 'Lightweight cordless vacuum with 40-minute runtime.',
    colors: [
      { id: 'blue', label: 'Blue', hex: '#1971c2' },
      { id: 'purple', label: 'Purple', hex: '#9c36b5' },
    ],
  },
  // Electronics accessories
  {
    id: 'eacc-1',
    name: 'Universal Remote Control',
    category: 'electronics',
    subcategory: 'electronics-accessories',
    price: 19.99,
    description: 'Works with most TVs, sound bars, and streaming boxes.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
  },
  {
    id: 'eacc-2',
    name: 'Surge Protector Power Strip (8-outlet)',
    category: 'electronics',
    subcategory: 'electronics-accessories',
    price: 24.5,
    description: '8-outlet surge protector with 2 USB charging ports.',
    colors: [{ id: 'white', label: 'White', hex: '#f8f9fa' }],
  },
  // Laptops
  {
    id: 'lap-1',
    name: 'AeroBook 14" Ultralight Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 899.0,
    description: 'Thin and light laptop with all-day battery life.',
    colors: [
      { id: 'silver', label: 'Silver', hex: '#ced4da' },
      { id: 'space-gray', label: 'Space Gray', hex: '#495057' },
    ],
  },
  {
    id: 'lap-2',
    name: 'WorkStation Pro 16" Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 1599.99,
    description: 'High-performance laptop for demanding workloads.',
    colors: [{ id: 'space-gray', label: 'Space Gray', hex: '#495057' }],
  },
  {
    id: 'lap-3',
    name: 'ValueBook 15" Everyday Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 499.99,
    description: 'Budget-friendly laptop for browsing and office work.',
    colors: [
      { id: 'silver', label: 'Silver', hex: '#ced4da' },
      { id: 'blue', label: 'Blue', hex: '#1971c2' },
    ],
  },
  // Computer accessories
  {
    id: 'cacc-1',
    name: 'Wireless Mouse and Keyboard Combo',
    category: 'computers',
    subcategory: 'computer-accessories',
    price: 34.99,
    description: 'Reliable wireless combo with long battery life.',
    colors: [
      { id: 'black', label: 'Black', hex: '#212529' },
      { id: 'white', label: 'White', hex: '#f8f9fa' },
    ],
  },
  {
    id: 'cacc-2',
    name: 'USB-C Docking Station',
    category: 'computers',
    subcategory: 'computer-accessories',
    price: 79.0,
    description: 'Single-cable docking with HDMI, USB-A, and Ethernet.',
    colors: [{ id: 'gray', label: 'Gray', hex: '#868e96' }],
  },
  {
    id: 'cacc-3',
    name: '27" 1440p Monitor',
    category: 'computers',
    subcategory: 'computer-accessories',
    price: 219.99,
    description: 'Sharp 1440p monitor with adjustable stand.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
    sizes: ['24"', '27"', '32"'],
  },
  // Smartphones
  {
    id: 'phone-1',
    name: 'Nova X12 Smartphone',
    category: 'phones',
    subcategory: 'smartphones',
    price: 799.0,
    description: 'Flagship smartphone with triple-lens camera.',
    colors: [
      { id: 'black', label: 'Midnight Black', hex: '#212529' },
      { id: 'blue', label: 'Ocean Blue', hex: '#1971c2' },
      { id: 'gold', label: 'Champagne Gold', hex: '#e8c468' },
    ],
    sizes: ['128GB', '256GB', '512GB'],
  },
  {
    id: 'phone-2',
    name: 'Nova SE Smartphone',
    category: 'phones',
    subcategory: 'smartphones',
    price: 399.99,
    description: 'Affordable smartphone with all-day battery.',
    colors: [
      { id: 'black', label: 'Black', hex: '#212529' },
      { id: 'white', label: 'White', hex: '#f8f9fa' },
    ],
    sizes: ['64GB', '128GB'],
  },
  // Phone accessories
  {
    id: 'pacc-1',
    name: 'Fast Wireless Charging Pad',
    category: 'phones',
    subcategory: 'phone-accessories',
    price: 22.99,
    description: '15W wireless charging pad, case-friendly.',
    colors: [
      { id: 'black', label: 'Black', hex: '#212529' },
      { id: 'white', label: 'White', hex: '#f8f9fa' },
    ],
  },
  {
    id: 'pacc-2',
    name: 'Shockproof Phone Case',
    category: 'phones',
    subcategory: 'phone-accessories',
    price: 14.99,
    description: 'Drop-tested protective case with raised edges.',
    colors: [
      { id: 'black', label: 'Black', hex: '#212529' },
      { id: 'clear', label: 'Clear', hex: '#e9ecef' },
      { id: 'red', label: 'Red', hex: '#e03131' },
      { id: 'blue', label: 'Blue', hex: '#1971c2' },
    ],
    sizes: ['iPhone', 'Samsung Galaxy', 'Google Pixel'],
  },
]

export function getProduct(id) {
  return PRODUCTS.find((product) => product.id === id) ?? null
}

// Deduped by color id across the whole catalog, for a single global color
// filter. Where the same id shows up with different labels on different
// products (e.g. 'black' as both "Black" and "Midnight Black"), this keeps
// whichever label was seen first — a reasonable simplification for a
// catalog-wide filter control, even though a specific product's own swatch
// may show a more specific label.
export function getAllColors() {
  const seen = new Map()
  for (const product of PRODUCTS) {
    for (const color of product.colors) {
      if (!seen.has(color.id)) {
        seen.set(color.id, color)
      }
    }
  }
  return [...seen.values()]
}
