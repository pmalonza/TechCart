import { Link } from 'react-router-dom'
import LegalPage, { type LegalSection } from '../components/LegalPage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { MAX_MESSAGES } from '../lib/help'
import { MAX_SUBSCRIBERS } from '../lib/newsletter'
import { STORAGE_KEYS } from '../lib/storage'

const PRIVACY_UPDATED = 'September 20, 2026'

// Every storage key is named on this page, and a test fails if one is added without being described here.
const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    heading: 'What this policy covers',
    body: (
      <p>
        TechCart is a demonstration storefront that runs entirely in your web browser. There is no TechCart server that receives your information, so
        everything described below stays on the device you are using.
      </p>
    ),
  },
  {
    id: 'collected',
    heading: 'What is kept about you',
    body: (
      <>
        <p>When you use a feature, the browser keeps the following. The name in brackets is where it is saved.</p>
        <ul>
          <li>
            <strong>Your account</strong> (<code>{STORAGE_KEYS.users}</code>): your name, email address, the date you joined, and a salted, one-way hash of
            your password (never the password itself). Your saved delivery addresses, with the name, phone number and address on each, are part of it.
          </li>
          <li>
            <strong>Being signed in</strong> (<code>{STORAGE_KEYS.session}</code>): the id of the account that is signed in.
          </li>
          <li>
            <strong>Password reset requests</strong> (<code>{STORAGE_KEYS.resetTokens}</code>): a hash of the reset code, the account it belongs to and when
            it expires. No email is sent; the demo shows the message on screen.
          </li>
          <li>
            <strong>Orders</strong> (<code>{STORAGE_KEYS.orders}</code>): the email address, items, totals, delivery address and delivery method. For a card
            payment only the card brand and last four digits are kept. The full card number, expiry date and security code are never saved.
          </li>
          <li>
            <strong>Your cart</strong> (<code>{STORAGE_KEYS.cart}</code>) and <strong>wishlist</strong> (<code>{STORAGE_KEYS.wishlist}</code>): which
            products you added and how many.
          </li>
          <li>
            <strong>Products you list</strong> (<code>{STORAGE_KEYS.listings}</code>): the details you typed and your resized photo, plus the id of your
            account.
          </li>
          <li>
            <strong>Newsletter</strong> (<code>{STORAGE_KEYS.newsletter}</code>): the email address and the date, for up to {MAX_SUBSCRIBERS} addresses.
          </li>
          <li>
            <strong>Messages you send from the Help page</strong> (<code>{STORAGE_KEYS.messages}</code>): your name, email address, the topic and the text
            of the message, for up to {MAX_MESSAGES} messages. Nobody receives them.
          </li>
          <li>
            <strong>Stock counts</strong> (<code>{STORAGE_KEYS.sold}</code>): how many of each product were ordered in this browser. It holds no personal
            information.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'where',
    heading: 'Where it is kept',
    body: (
      <>
        <p>
          All of it is kept in your browser&rsquo;s local storage. The site sets no cookies, uses no analytics or advertising, and does not load fonts,
          scripts or images from other websites. Nothing is sent to a server, so nobody at TechCart can see it.
        </p>
        <p>
          Local storage is not encrypted. Only the password is hashed. Anyone who can use this browser profile, or open its developer tools, can read
          the rest. Do not use a shared computer for real personal details, and do not enter real card numbers.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    heading: 'How it is used',
    body: (
      <p>
        Only to make the demo work: signing you in, filling in checkout, showing your orders and listings, and remembering your cart. It is not sold, shared
        or used for profiling, because it never leaves your browser.
      </p>
    ),
  },
  {
    id: 'photos',
    heading: 'Product photos',
    body: (
      <p>
        A photo you upload is not sent anywhere. Your browser shrinks it and saves it again as a new image, which also removes hidden details such as the
        place a photo was taken.
      </p>
    ),
  },
  {
    id: 'choices',
    heading: 'Your choices and deleting your data',
    body: (
      <>
        <p>
          <strong>Deleting your account</strong> (Account, then Password &amp; security) erases your profile, your saved addresses, your sign-in, any pending
          reset requests, the orders you placed while signed in, and the products you listed.
        </p>
        <p>These are separate and are not removed when you delete an account:</p>
        <ul>
          <li>
            <strong>Guest orders</strong>, which are not tied to an account and include an email address and a delivery address.
          </li>
          <li>
            <strong>The cart and wishlist</strong>, which belong to the browser, not to an account.
          </li>
          <li>
            <strong>Newsletter sign-ups</strong>, which you remove on the <Link to="/newsletter/unsubscribe">unsubscribe page</Link>.
          </li>
          <li>
            <strong>Messages you sent</strong>, which you can delete one by one on the <Link to="/help">Help page</Link>.
          </li>
        </ul>
        <p>
          To erase everything at once, clear this site&rsquo;s data in your browser&rsquo;s settings. Because nothing is stored anywhere else, that removes
          it completely.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    body: (
      <p>
        If the site starts keeping something new, this page changes with it. The date at the top shows the last update. See also the{' '}
        <Link to="/terms">Terms and Conditions</Link>.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy')
  return (
    <LegalPage
      title="Privacy Policy"
      updated={PRIVACY_UPDATED}
      intro={<p>This page lists exactly what TechCart keeps, where, and how to get rid of it. There is no fine print: the demo has no server.</p>}
      sections={SECTIONS}
    />
  )
}
