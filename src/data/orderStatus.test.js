import { describe, expect, it } from 'vitest'
import { ORDER_STATUSES, getNextOrderStatus, getOrderStatus } from './orderStatus'

describe('getOrderStatus', () => {
  it('finds a known status', () => {
    expect(getOrderStatus('shipped').label).toBe('In transit')
  })

  it('falls back to the first status for an unknown id', () => {
    expect(getOrderStatus('made-up')).toEqual(ORDER_STATUSES[0])
  })
})

describe('getNextOrderStatus', () => {
  it('returns the next status in sequence', () => {
    expect(getNextOrderStatus('received')).toBe('packed')
    expect(getNextOrderStatus('packed')).toBe('shipped')
    expect(getNextOrderStatus('shipped')).toBe('delivered')
  })

  it('returns null once delivered', () => {
    expect(getNextOrderStatus('delivered')).toBeNull()
  })

  it('returns null for an unknown status', () => {
    expect(getNextOrderStatus('made-up')).toBeNull()
  })
})
