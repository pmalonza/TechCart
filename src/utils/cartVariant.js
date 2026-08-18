export function makeVariantId(productId, colorId, size) {
  return [productId, colorId ?? '', size ?? ''].join('::')
}
