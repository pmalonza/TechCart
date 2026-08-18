export const PRODUCTS = [
  // Refrigerators
  {
    id: 'ref-1',
    name: 'FrostGuard 18cu.ft Top-Freezer Refrigerator',
    category: 'electronics',
    subcategory: 'refrigerators',
    price: 649.99,
    description: 'Spacious top-freezer fridge with adjustable glass shelving.',
  },
  {
    id: 'ref-2',
    name: 'ChillPro French Door Refrigerator',
    category: 'electronics',
    subcategory: 'refrigerators',
    price: 1399.0,
    description: 'French door fridge with in-door ice and water dispenser.',
  },
  {
    id: 'ref-3',
    name: 'CompactCool Mini Fridge',
    category: 'electronics',
    subcategory: 'refrigerators',
    price: 129.5,
    description: 'Small-space fridge, ideal for dorms and offices.',
  },
  // TVs
  {
    id: 'tv-1',
    name: 'VividView 55" 4K QLED TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 549.99,
    description: 'Vibrant 4K QLED display with built-in streaming apps.',
  },
  {
    id: 'tv-2',
    name: 'VividView 65" 4K OLED TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 999.0,
    description: 'Deep blacks and true-to-life color with OLED panel technology.',
  },
  {
    id: 'tv-3',
    name: 'ClearScreen 32" HD TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 179.99,
    description: 'Compact HD TV, great for bedrooms and kitchens.',
  },
  // Vacuums
  {
    id: 'vac-1',
    name: 'SweepMaster Robot Vacuum',
    category: 'electronics',
    subcategory: 'vacuums',
    price: 249.99,
    description: 'Self-navigating robot vacuum with app scheduling.',
  },
  {
    id: 'vac-2',
    name: 'PowerSuck Cordless Stick Vacuum',
    category: 'electronics',
    subcategory: 'vacuums',
    price: 159.0,
    description: 'Lightweight cordless vacuum with 40-minute runtime.',
  },
  // Electronics accessories
  {
    id: 'eacc-1',
    name: 'Universal Remote Control',
    category: 'electronics',
    subcategory: 'electronics-accessories',
    price: 19.99,
    description: 'Works with most TVs, sound bars, and streaming boxes.',
  },
  {
    id: 'eacc-2',
    name: 'Surge Protector Power Strip (8-outlet)',
    category: 'electronics',
    subcategory: 'electronics-accessories',
    price: 24.5,
    description: '8-outlet surge protector with 2 USB charging ports.',
  },
  // Laptops
  {
    id: 'lap-1',
    name: 'AeroBook 14" Ultralight Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 899.0,
    description: 'Thin and light laptop with all-day battery life.',
  },
  {
    id: 'lap-2',
    name: 'WorkStation Pro 16" Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 1599.99,
    description: 'High-performance laptop for demanding workloads.',
  },
  {
    id: 'lap-3',
    name: 'ValueBook 15" Everyday Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 499.99,
    description: 'Budget-friendly laptop for browsing and office work.',
  },
  // Computer accessories
  {
    id: 'cacc-1',
    name: 'Wireless Mouse and Keyboard Combo',
    category: 'computers',
    subcategory: 'computer-accessories',
    price: 34.99,
    description: 'Reliable wireless combo with long battery life.',
  },
  {
    id: 'cacc-2',
    name: 'USB-C Docking Station',
    category: 'computers',
    subcategory: 'computer-accessories',
    price: 79.0,
    description: 'Single-cable docking with HDMI, USB-A, and Ethernet.',
  },
  {
    id: 'cacc-3',
    name: '27" 1440p Monitor',
    category: 'computers',
    subcategory: 'computer-accessories',
    price: 219.99,
    description: 'Sharp 1440p monitor with adjustable stand.',
  },
  // Smartphones
  {
    id: 'phone-1',
    name: 'Nova X12 Smartphone',
    category: 'phones',
    subcategory: 'smartphones',
    price: 799.0,
    description: 'Flagship smartphone with triple-lens camera.',
  },
  {
    id: 'phone-2',
    name: 'Nova SE Smartphone',
    category: 'phones',
    subcategory: 'smartphones',
    price: 399.99,
    description: 'Affordable smartphone with all-day battery.',
  },
  // Phone accessories
  {
    id: 'pacc-1',
    name: 'Fast Wireless Charging Pad',
    category: 'phones',
    subcategory: 'phone-accessories',
    price: 22.99,
    description: '15W wireless charging pad, case-friendly.',
  },
  {
    id: 'pacc-2',
    name: 'Shockproof Phone Case',
    category: 'phones',
    subcategory: 'phone-accessories',
    price: 14.99,
    description: 'Drop-tested protective case with raised edges.',
  },
]

export function getProduct(id) {
  return PRODUCTS.find((product) => product.id === id) ?? null
}
