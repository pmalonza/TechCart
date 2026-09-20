import {
  canViewOrder,
  generateOrderNumber,
  orderItemCount,
  ordersForUser,
  sanitizeOrders,
  sortOrders,
  type Order,
} from './orders'

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: 'TC-20260920-1234',
  createdAt: '2026-09-20T10:00:00.000Z',
  userId: 'u1',
  email: 'ada@example.com',
  lines: [{ productId: 'pulse-s5', name: 'Pulse S5', brand: 'Pulse', priceCents: 24900, quantity: 2 }],
  subtotalCents: 49800,
  shippingCents: 0,
  taxCents: 3984,
  totalCents: 53784,
  shippingMethod: 'standard',
  shippingAddress: {
    label: 'Home',
    fullName: 'Ada Lovelace',
    phone: '+254 700 000 000',
    line1: '12 Baker Street',
    line2: '',
    city: 'Nairobi',
    region: '',
    postalCode: '00100',
    country: 'KE',
  },
  payment: { method: 'card', brand: 'visa', last4: '4242' },
  status: 'processing',
  ...overrides,
})

describe('generateOrderNumber', () => {
  it('combines the date and four random digits', () => {
    expect(generateOrderNumber(new Date(2026, 8, 20), '4821')).toBe('TC-20260920-4821')
  })

  it('zero-pads the month and day', () => {
    expect(generateOrderNumber(new Date(2026, 0, 5), '0007')).toBe('TC-20260105-0007')
  })
})

describe('sorting and filtering', () => {
  const older = order({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' })
  const newer = order({ id: 'b', createdAt: '2026-06-01T00:00:00.000Z' })
  const other = order({ id: 'c', userId: 'u2', createdAt: '2026-09-01T00:00:00.000Z' })

  it('puts the newest order first without mutating the input', () => {
    const input = [older, newer]
    expect(sortOrders(input).map((o) => o.id)).toEqual(['b', 'a'])
    expect(input.map((o) => o.id)).toEqual(['a', 'b'])
  })

  it('returns only one account’s orders, newest first', () => {
    expect(ordersForUser([older, other, newer], 'u1').map((o) => o.id)).toEqual(['b', 'a'])
    expect(ordersForUser([older, other, newer], 'u3')).toEqual([])
  })

  it('counts items across lines', () => {
    expect(orderItemCount({ lines: [...order().lines, { productId: 'x', name: 'X', brand: 'B', priceCents: 1, quantity: 3 }] })).toBe(5)
  })
})

describe('canViewOrder', () => {
  it('lets the owner see their order and nobody else', () => {
    expect(canViewOrder({ userId: 'u1' }, 'u1')).toBe(true)
    expect(canViewOrder({ userId: 'u1' }, 'u2')).toBe(false)
    expect(canViewOrder({ userId: 'u1' }, null)).toBe(false)
  })

  it('lets anyone with the link see a guest order', () => {
    expect(canViewOrder({ userId: null }, null)).toBe(true)
    expect(canViewOrder({ userId: null }, 'u2')).toBe(true)
  })
})

describe('sanitizeOrders', () => {
  it('keeps valid orders, including guest orders', () => {
    const guest = order({ id: 'g', userId: null, payment: { method: 'cod' } })
    expect(sanitizeOrders([order(), guest])).toEqual([order(), guest])
  })

  it('rejects non-arrays', () => {
    expect(sanitizeOrders(undefined)).toEqual([])
    expect(sanitizeOrders({})).toEqual([])
  })

  it('drops malformed orders', () => {
    const { lines: _lines, ...noLines } = order({ id: 'x' })
    const bad = [
      noLines,
      { ...order({ id: 'y' }), lines: [] },
      { ...order({ id: 'z' }), lines: [{ productId: 'p', name: 'P', brand: 'B', priceCents: 1, quantity: 0 }] },
      { ...order({ id: 'w' }), totalCents: -5 },
      { ...order({ id: 'v' }), totalCents: 1.5 },
      { ...order({ id: 'u' }), shippingMethod: 'drone' },
      { ...order({ id: 't' }), payment: { method: 'bitcoin' } },
      { ...order({ id: 's' }), payment: { method: 'card', brand: 'visa', last4: '42' } },
      { ...order({ id: 'r' }), shippingAddress: null },
      { ...order({ id: 'q' }), userId: 42 },
      'junk',
      null,
    ]
    expect(sanitizeOrders([order(), ...bad])).toEqual([order()])
  })

  it('drops duplicate ids', () => {
    expect(sanitizeOrders([order(), order({ number: 'other' })])).toHaveLength(1)
  })

  it('normalises an unrecognised card brand', () => {
    const odd = { ...order(), payment: { method: 'card', brand: 'diners', last4: '1234' } }
    expect(sanitizeOrders([odd])[0].payment).toEqual({ method: 'card', brand: 'unknown', last4: '1234' })
  })

  it('never keeps card details beyond the brand and last four digits', () => {
    const risky = { ...order(), payment: { method: 'card', brand: 'visa', last4: '4242', number: '4242424242424242', cvc: '123' } }
    const stored = JSON.stringify(sanitizeOrders([risky]))
    expect(stored).not.toContain('4242424242424242')
    expect(stored).not.toContain('cvc')
  })
})
