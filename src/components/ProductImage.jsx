// Hand-built flat-illustration icons per subcategory, rather than sourced
// product photography (avoids licensing/copyright concerns entirely, and
// keeps the app free of external image dependencies).
const ICONS = {
  refrigerators: (
    <svg viewBox="0 0 100 100" role="img" aria-label="Refrigerator">
      <rect x="28" y="8" width="44" height="84" rx="6" fill="#a5d8ff" stroke="#1971c2" strokeWidth="3" />
      <line x1="28" y1="38" x2="72" y2="38" stroke="#1971c2" strokeWidth="3" />
      <rect x="34" y="16" width="4" height="14" rx="2" fill="#1971c2" />
      <rect x="34" y="46" width="4" height="14" rx="2" fill="#1971c2" />
    </svg>
  ),
  tvs: (
    <svg viewBox="0 0 100 100" role="img" aria-label="Television">
      <rect x="8" y="20" width="84" height="52" rx="4" fill="#d0bfff" stroke="#7048e8" strokeWidth="3" />
      <rect x="16" y="28" width="68" height="36" fill="#f3f0ff" />
      <line x1="50" y1="72" x2="50" y2="84" stroke="#7048e8" strokeWidth="3" />
      <line x1="34" y1="88" x2="66" y2="88" stroke="#7048e8" strokeWidth="3" />
    </svg>
  ),
  vacuums: (
    <svg viewBox="0 0 100 100" role="img" aria-label="Vacuum">
      <circle cx="40" cy="65" r="22" fill="#b2f2bb" stroke="#2f9e44" strokeWidth="3" />
      <line x1="55" y1="50" x2="80" y2="20" stroke="#2f9e44" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="65" r="6" fill="#2f9e44" />
    </svg>
  ),
  'electronics-accessories': (
    <svg viewBox="0 0 100 100" role="img" aria-label="Electronics accessory">
      <rect x="20" y="40" width="60" height="20" rx="4" fill="#ffec99" stroke="#f08c00" strokeWidth="3" />
      <circle cx="34" cy="50" r="4" fill="#f08c00" />
      <circle cx="50" cy="50" r="4" fill="#f08c00" />
      <circle cx="66" cy="50" r="4" fill="#f08c00" />
    </svg>
  ),
  laptops: (
    <svg viewBox="0 0 100 100" role="img" aria-label="Laptop">
      <rect x="22" y="18" width="56" height="38" rx="3" fill="#a5d8ff" stroke="#1971c2" strokeWidth="3" />
      <path d="M12 82 L88 82 L80 60 L20 60 Z" fill="#1971c2" />
    </svg>
  ),
  'computer-accessories': (
    <svg viewBox="0 0 100 100" role="img" aria-label="Computer accessory">
      <rect x="14" y="24" width="72" height="46" rx="4" fill="#eebefa" stroke="#9c36b5" strokeWidth="3" />
      <rect x="34" y="78" width="32" height="6" rx="2" fill="#9c36b5" />
    </svg>
  ),
  smartphones: (
    <svg viewBox="0 0 100 100" role="img" aria-label="Smartphone">
      <rect x="32" y="8" width="36" height="84" rx="8" fill="#ffc9c9" stroke="#e03131" strokeWidth="3" />
      <line x1="42" y1="84" x2="58" y2="84" stroke="#e03131" strokeWidth="3" />
    </svg>
  ),
  'phone-accessories': (
    <svg viewBox="0 0 100 100" role="img" aria-label="Phone accessory">
      <rect x="30" y="30" width="40" height="40" rx="20" fill="#99e9f2" stroke="#0c8599" strokeWidth="3" />
      <path d="M50 40 L44 50 L52 50 L46 62" fill="none" stroke="#0c8599" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function ProductImage({ subcategory }) {
  return <span className="product-image">{ICONS[subcategory] ?? ICONS['electronics-accessories']}</span>
}
