import { MAX_ADDRESSES } from '../lib/addresses'
import { MAX_PER_LINE } from '../lib/cart'
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_METHODS, TAX_RATE } from '../lib/checkout'
import type { Faq } from '../lib/help'
import { MAX_IMAGE_FILE_BYTES } from '../lib/image'
import { MAX_LISTINGS_PER_USER } from '../lib/listings'
import { formatPrice } from '../lib/money'
import { RESET_TOKEN_TTL_MS } from '../lib/passwordReset'

// Prices, limits and times are read from the constants the store itself uses, so an answer cannot drift from the behaviour.
const standard = SHIPPING_METHODS.find((method) => method.id === 'standard')!
const express = SHIPPING_METHODS.find((method) => method.id === 'express')!

export const FAQS: Faq[] = [
  {
    id: 'delivery-cost',
    topic: 'orders',
    question: 'How much does delivery cost?',
    answer: `${standard.name} (${standard.eta}) is ${formatPrice(standard.priceCents)}, and free on orders of ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} or more. ${express.name} (${express.eta}) is ${formatPrice(express.priceCents)}. An estimated ${Math.round(TAX_RATE * 100)}% tax is added to the merchandise. Nothing is really delivered, because this is a demo.`,
  },
  {
    id: 'guest-checkout',
    topic: 'orders',
    question: 'Do I need an account to place an order?',
    answer: 'No. You can check out as a guest with just an email address. An account lets you reuse saved delivery addresses and see all your orders in one place.',
    link: { to: '/register', label: 'Create an account' },
  },
  {
    id: 'find-orders',
    topic: 'orders',
    question: 'Where can I see my orders?',
    answer:
      'If you were signed in, open Account and choose Orders. Guest orders are not listed anywhere, so keep the confirmation page open or bookmark its link: anyone with that link can view the order.',
    link: { to: '/account/orders', label: 'Go to my orders' },
  },
  {
    id: 'payment',
    topic: 'orders',
    question: 'How do I pay?',
    answer:
      'At checkout choose a card or pay on delivery. No payment is really taken and you should not enter a real card number. Use the test card 4242 4242 4242 4242 with any future expiry date and any 3-digit code.',
  },
  {
    id: 'cart-quantity',
    topic: 'orders',
    question: 'Why did the quantity in my cart change?',
    answer: `You can order at most ${MAX_PER_LINE} of any one product, and never more than are in stock. If stock drops after you add something, the quantity is lowered and the cart tells you.`,
    link: { to: '/cart', label: 'View my cart' },
  },
  {
    id: 'forgot-password',
    topic: 'account',
    question: 'I forgot my password. What do I do?',
    answer: `Use the reset page and enter your email address. This demo cannot send email, so the message with your reset link appears on the screen. The link works for ${Math.round(RESET_TOKEN_TTL_MS / 60000)} minutes.`,
    link: { to: '/forgot-password', label: 'Reset my password' },
  },
  {
    id: 'change-password',
    topic: 'account',
    question: 'How do I change my password or delete my account?',
    answer: 'Sign in, open Account and choose Password & security. Both actions ask for your current password first. Deleting your account also erases your addresses, orders and listings.',
    link: { to: '/account/security', label: 'Password & security' },
  },
  {
    id: 'addresses',
    topic: 'account',
    question: 'How do I add or change a delivery address?',
    answer: `Open Account and choose Addresses. You can save up to ${MAX_ADDRESSES}, edit or delete them, and mark one as your default so checkout fills it in.`,
    link: { to: '/account/addresses', label: 'My addresses' },
  },
  {
    id: 'unsubscribe',
    topic: 'account',
    question: 'How do I stop the newsletter?',
    answer: 'Enter the address you signed up with on the unsubscribe page and it is removed from the list straight away.',
    link: { to: '/newsletter/unsubscribe', label: 'Unsubscribe' },
  },
  {
    id: 'list-product',
    topic: 'selling',
    question: 'How do I list a product with a photo?',
    answer: `Sign in, open Account, choose My listings, then Add a product. A photo can be a JPEG, PNG or WebP of up to ${MAX_IMAGE_FILE_BYTES / (1024 * 1024)} MB; it is shrunk in your browser before it is saved. You can list up to ${MAX_LISTINGS_PER_USER} products and change or remove a photo later.`,
    link: { to: '/account/listings', label: 'My listings' },
  },
  {
    id: 'listing-visibility',
    topic: 'selling',
    question: 'Why can nobody else see my listing?',
    answer: 'Everything in this demo is saved in your own browser, not on a server. Your listings are visible in that browser only, and clearing the browser data removes them.',
  },
  {
    id: 'real-store',
    topic: 'demo',
    question: 'Is TechCart a real store?',
    answer: 'No. It is a demonstration: the products, brands and reviews are made up, no payment is taken and nothing is shipped.',
    link: { to: '/terms', label: 'Terms and Conditions' },
  },
  {
    id: 'data',
    topic: 'demo',
    question: 'Where is my information stored?',
    answer: 'Only in your browser, on your device. The site has no server, sets no cookies and loads nothing from other websites. The privacy policy lists everything that is kept and how to delete it.',
    link: { to: '/privacy', label: 'Privacy Policy' },
  },
]
