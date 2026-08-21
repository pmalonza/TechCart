export const ORDER_STATUSES = [
  { id: 'received', label: 'Order received' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'In transit' },
  { id: 'delivered', label: 'Delivered' },
]

export function getOrderStatus(statusId) {
  return ORDER_STATUSES.find((status) => status.id === statusId) ?? ORDER_STATUSES[0]
}

export function getNextOrderStatus(statusId) {
  const index = ORDER_STATUSES.findIndex((status) => status.id === statusId)
  if (index === -1 || index === ORDER_STATUSES.length - 1) return null
  return ORDER_STATUSES[index + 1].id
}
