import { Link } from 'react-router-dom'
import LegalPage, { type LegalSection } from '../components/LegalPage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { FREE_SHIPPING_THRESHOLD_CENTS, SHIPPING_METHODS, TAX_RATE } from '../lib/checkout'
import { MAX_LISTINGS_PER_USER } from '../lib/listings'
import { formatPrice } from '../lib/money'

const TERMS_UPDATED = 'September 20, 2026'

// Delivery prices, the tax rate and the listing limit are read from the same constants checkout uses, so this page cannot drift from the store.
const standard = SHIPPING_METHODS.find((method) => method.id === 'standard')!
const express = SHIPPING_METHODS.find((method) => method.id === 'express')!

const SECTIONS: LegalSection[] = [
  {
    id: 'about',
    heading: 'About TechCart',
    body: (
      <>
        <p>
          TechCart is a demonstration storefront. The products, brands, prices, ratings and reviews are made up, and no real goods are sold or shipped.
          By using the site you agree to these terms.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    heading: 'Your account',
    body: (
      <>
        <p>You can browse and check out as a guest, or create an account. If you create one:</p>
        <ul>
          <li>Give accurate details and keep your password to yourself.</li>
          <li>You are responsible for what happens under your account on the device you use.</li>
          <li>You can delete your account at any time from Password &amp; security. Deleting it also erases your saved addresses, orders and listings.</li>
        </ul>
        <p>Accounts live only in the browser you created them in, so they cannot be used from another browser or device.</p>
      </>
    ),
  },
  {
    id: 'orders',
    heading: 'Orders and payment',
    body: (
      <>
        <p>
          Checkout is a simulation. No payment is taken, no card is charged, and nothing is delivered. Please do not enter a real card number; use the test
          card shown at checkout. Only the card brand and the last four digits are kept with an order.
        </p>
        <p>The delivery and tax figures shown are illustrations of how a real checkout could work:</p>
        <ul>
          <li>
            {standard.name} ({standard.eta}): {formatPrice(standard.priceCents)}, free on orders of {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} or more.
          </li>
          <li>
            {express.name} ({express.eta}): {formatPrice(express.priceCents)}.
          </li>
          <li>Estimated tax: {Math.round(TAX_RATE * 100)}% of the merchandise subtotal.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'availability',
    heading: 'Prices and availability',
    body: (
      <p>
        Prices and stock levels are demo data. Stock goes down when an order is placed in this browser and is not shared with anyone else. A product can show
        as sold out or have its quantity reduced in your cart if stock changes.
      </p>
    ),
  },
  {
    id: 'listings',
    heading: 'Listing products',
    body: (
      <>
        <p>Signed-in members can list products with a photo. When you do:</p>
        <ul>
          <li>You may list up to {MAX_LISTINGS_PER_USER} products.</li>
          <li>Only upload photos you took yourself or have the right to use.</li>
          <li>Do not list anything illegal, unsafe, counterfeit or misleading.</li>
          <li>Photos are resized and saved in your browser, and listings are visible only in that browser.</li>
        </ul>
        <p>A real marketplace would review listings and may remove any that break these rules.</p>
      </>
    ),
  },
  {
    id: 'returns',
    heading: 'Returns and refunds',
    body: <p>Because no real goods are sold, there is nothing to return and no money to refund.</p>,
  },
  {
    id: 'ip',
    heading: 'Names, artwork and content',
    body: (
      <p>
        The TechCart name, the generated product artwork and the page designs belong to the people who built this demo. Brand names shown in the catalog are
        fictional; any resemblance to a real company is a coincidence.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: 'No warranty and limits on liability',
    body: (
      <p>
        The site is provided as it is, without promises that it will be available, error-free or fit for a particular purpose. Data is kept in your browser,
        so clearing your browser data or switching devices removes it. To the extent the law allows, the people who built this demo are not liable for any loss
        that results from using it.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these terms. The date at the top shows when they last changed, and using the site after a change means you accept the new version. See the <Link to="/privacy">Privacy Policy</Link> for how your information is handled.
      </p>
    ),
  },
]

export default function TermsPage() {
  useDocumentTitle('Terms and Conditions')
  return (
    <LegalPage
      title="Terms and Conditions"
      updated={TERMS_UPDATED}
      intro={<p>Please read these terms before using TechCart. They are short, and they describe what this demo store really does.</p>}
      sections={SECTIONS}
    />
  )
}
