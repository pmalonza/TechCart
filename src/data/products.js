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
    specs: [
      { label: 'Total capacity', value: '18 cu.ft (13 cu.ft fridge / 5 cu.ft freezer)' },
      { label: 'Type', value: 'Top-freezer' },
      { label: 'Energy rating', value: 'ENERGY STAR certified' },
      { label: 'Shelving', value: 'Adjustable tempered glass' },
      { label: 'Dimensions', value: '30"W x 66"H x 32"D' },
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
    specs: [
      { label: 'Total capacity', value: '25 cu.ft (18 cu.ft fridge / 7 cu.ft freezer)' },
      { label: 'Type', value: 'French door, bottom freezer' },
      { label: 'Dispenser', value: 'In-door filtered ice and water' },
      { label: 'Energy rating', value: 'ENERGY STAR certified' },
      { label: 'Dimensions', value: '36"W x 70"H x 34"D' },
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
    specs: [
      { label: 'Total capacity', value: '3.2 cu.ft' },
      { label: 'Type', value: 'Freestanding compact' },
      { label: 'Freezer compartment', value: 'Small top-mounted freezer box' },
      { label: 'Dimensions', value: '17"W x 33"H x 18"D' },
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
    specs: [
      { label: 'Screen size', value: '55 inches' },
      { label: 'Resolution', value: '3840 x 2160 (4K UHD)' },
      { label: 'Panel type', value: 'QLED, 60Hz' },
      { label: 'Smart platform', value: 'VividOS 4.2' },
      { label: 'Ports', value: '3x HDMI 2.1, 2x USB, optical audio' },
      { label: 'Voice control', value: 'Built-in far-field microphone' },
    ],
  },
  {
    id: 'tv-2',
    name: 'VividView 65" 4K OLED TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 999.0,
    originalPrice: 1299.0,
    description: 'Deep blacks and true-to-life color with OLED panel technology.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
    specs: [
      { label: 'Screen size', value: '65 inches' },
      { label: 'Resolution', value: '3840 x 2160 (4K UHD)' },
      { label: 'Panel type', value: 'OLED, 120Hz' },
      { label: 'Smart platform', value: 'VividOS 4.2' },
      { label: 'Ports', value: '4x HDMI 2.1, 2x USB, optical audio' },
      { label: 'HDR', value: 'Dolby Vision, HDR10+' },
    ],
  },
  {
    id: 'tv-3',
    name: 'ClearScreen 32" HD TV',
    category: 'electronics',
    subcategory: 'tvs',
    price: 179.99,
    description: 'Compact HD TV, great for bedrooms and kitchens.',
    colors: [{ id: 'black', label: 'Black', hex: '#212529' }],
    specs: [
      { label: 'Screen size', value: '32 inches' },
      { label: 'Resolution', value: '1366 x 768 (HD)' },
      { label: 'Panel type', value: 'LED, 60Hz' },
      { label: 'Smart platform', value: 'ClearScreen OS 2.0' },
      { label: 'Ports', value: '2x HDMI, 1x USB' },
    ],
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
    specs: [
      { label: 'Navigation', value: 'LiDAR mapping with room-by-room cleaning' },
      { label: 'Battery runtime', value: 'Up to 150 minutes per charge' },
      { label: 'Dustbin capacity', value: '0.6L' },
      { label: 'App', value: 'SweepMaster app, scheduling and no-go zones' },
      { label: 'Software version', value: 'Firmware 3.1' },
    ],
  },
  {
    id: 'vac-2',
    name: 'PowerSuck Cordless Stick Vacuum',
    category: 'electronics',
    subcategory: 'vacuums',
    price: 159.0,
    originalPrice: 199.0,
    description: 'Lightweight cordless vacuum with 40-minute runtime.',
    colors: [
      { id: 'blue', label: 'Blue', hex: '#1971c2' },
      { id: 'purple', label: 'Purple', hex: '#9c36b5' },
    ],
    specs: [
      { label: 'Battery runtime', value: 'Up to 40 minutes per charge' },
      { label: 'Weight', value: '4.2 lbs' },
      { label: 'Dustbin capacity', value: '0.5L' },
      { label: 'Filtration', value: 'Washable HEPA filter' },
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
    specs: [
      { label: 'Compatibility', value: 'Most major TV, sound bar, and streaming box brands' },
      { label: 'Power', value: '2x AAA batteries (included)' },
      { label: 'Setup', value: 'Auto-scan code pairing' },
    ],
  },
  {
    id: 'eacc-2',
    name: 'Surge Protector Power Strip (8-outlet)',
    category: 'electronics',
    subcategory: 'electronics-accessories',
    price: 24.5,
    description: '8-outlet surge protector with 2 USB charging ports.',
    colors: [{ id: 'white', label: 'White', hex: '#f8f9fa' }],
    specs: [
      { label: 'Outlets', value: '8 AC outlets, 2 USB-A charging ports' },
      { label: 'Surge protection', value: '1680 joules' },
      { label: 'Cord length', value: '6 ft' },
    ],
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
    specs: [
      { label: 'Screen size', value: '14 inches, 1920 x 1200' },
      { label: 'Processor', value: 'AeroCore 5-series, 8-core' },
      { label: 'Memory', value: '16GB RAM' },
      { label: 'Storage', value: '512GB SSD' },
      { label: 'Operating system', value: 'AeroOS 14' },
      { label: 'Battery life', value: 'Up to 18 hours' },
      { label: 'Weight', value: '2.6 lbs' },
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
    specs: [
      { label: 'Screen size', value: '16 inches, 2560 x 1600' },
      { label: 'Processor', value: 'AeroCore 9-series, 12-core' },
      { label: 'Memory', value: '32GB RAM' },
      { label: 'Storage', value: '1TB SSD' },
      { label: 'Graphics', value: 'Dedicated 8GB GPU' },
      { label: 'Operating system', value: 'AeroOS 14' },
      { label: 'Battery life', value: 'Up to 10 hours' },
    ],
  },
  {
    id: 'lap-3',
    name: 'ValueBook 15" Everyday Laptop',
    category: 'computers',
    subcategory: 'laptops',
    price: 499.99,
    originalPrice: 599.99,
    description: 'Budget-friendly laptop for browsing and office work.',
    colors: [
      { id: 'silver', label: 'Silver', hex: '#ced4da' },
      { id: 'blue', label: 'Blue', hex: '#1971c2' },
    ],
    specs: [
      { label: 'Screen size', value: '15.6 inches, 1920 x 1080' },
      { label: 'Processor', value: 'AeroCore 3-series, 4-core' },
      { label: 'Memory', value: '8GB RAM' },
      { label: 'Storage', value: '256GB SSD' },
      { label: 'Operating system', value: 'AeroOS 14' },
      { label: 'Battery life', value: 'Up to 9 hours' },
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
    specs: [
      { label: 'Connectivity', value: '2.4GHz wireless USB receiver' },
      { label: 'Battery life', value: 'Up to 12 months (keyboard), 6 months (mouse)' },
      { label: 'Compatibility', value: 'Windows, macOS, ChromeOS' },
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
    specs: [
      { label: 'Host connection', value: 'USB-C (100W power delivery)' },
      { label: 'Video output', value: '1x HDMI, up to 4K @ 60Hz' },
      { label: 'Ports', value: '3x USB-A, 1x Gigabit Ethernet, SD card reader' },
    ],
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
    specs: [
      { label: 'Resolution', value: '2560 x 1440 (QHD)' },
      { label: 'Refresh rate', value: '144Hz' },
      { label: 'Panel type', value: 'IPS' },
      { label: 'Ports', value: 'HDMI, DisplayPort, USB-C' },
      { label: 'Stand', value: 'Height, tilt, and swivel adjustable' },
    ],
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
    specs: [
      { label: 'Screen size', value: '6.5 inches, 2400 x 1080 OLED' },
      { label: 'Camera', value: 'Triple-lens: 50MP main, ultra-wide, telephoto' },
      { label: 'Memory', value: '12GB RAM' },
      { label: 'Battery', value: '4500mAh, fast + wireless charging' },
      { label: 'Operating system', value: 'NovaOS 15' },
      { label: 'Connectivity', value: '5G' },
    ],
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
    specs: [
      { label: 'Screen size', value: '6.1 inches, 2000 x 900 LCD' },
      { label: 'Camera', value: 'Dual-lens: 48MP main, ultra-wide' },
      { label: 'Memory', value: '6GB RAM' },
      { label: 'Battery', value: '4200mAh, fast charging' },
      { label: 'Operating system', value: 'NovaOS 15' },
      { label: 'Connectivity', value: '5G' },
    ],
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
    specs: [
      { label: 'Output', value: 'Up to 15W wireless charging' },
      { label: 'Compatibility', value: 'Qi-enabled phones, works through most cases' },
      { label: 'Cable', value: 'USB-C to USB-A included' },
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
    specs: [
      { label: 'Drop protection', value: 'Tested to 6.6 ft (2m)' },
      { label: 'Material', value: 'TPU bumper with polycarbonate back' },
      { label: 'Wireless charging', value: 'Compatible, no need to remove case' },
    ],
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

export function getOnSaleProducts() {
  return PRODUCTS.filter((product) => product.originalPrice > product.price)
}
