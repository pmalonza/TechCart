# TechCart

A demo online store for laptops, phones, audio, wearables, gaming gear and accessories, built with React and TypeScript.

> **This is a demonstration, not a real shop.** There is no server or database. Everything (accounts, carts, orders, listings, photos) lives in your own browser's `localStorage`, no payment is taken and nothing is delivered. See [What "demo" means](#what-demo-means) before reusing any of it.

## Features

Each feature was added in its own commit, so the history reads as a build log.

| Area | What it does |
| --- | --- |
| **Menu** | Header navigation with a categories dropdown and a responsive mobile menu |
| **Product categories** | Six categories with a browsable catalog and category tiles |
| **Search bar** | Live suggestions (keyboard-navigable combobox) and a full results page; matches names, brands, categories, tags and descriptions, ranked with name matches first |
| **Filter and sort** | Filter by category, brand, price range, minimum rating, in stock and on sale, with removable filter chips; sort by relevance, price, rating, reviews or name. All of it is kept in the URL so a result page can be shared |
| **Product details** | Product image, price and sale badge, stock notice, quantity stepper, key features, related products |
| **Back button** | Goes back one step, or to a sensible fallback when a page was opened directly |
| **Cart** | Add, change quantity, remove; quantities are capped by stock and per-item limit; persists across reloads and tabs |
| **Wishlist** | Save products, add them to the cart one by one, or add every available item at once |
| **Account management** | Sign up, sign in, edit profile, change password, delete account |
| **Reset password** | Request a reset, then choose a new password from a time-limited link |
| **Addresses** | Address book with add, edit, delete and a default address; country-aware fields |
| **Checkout** | Guest or signed-in checkout, saved or new address, delivery method, card or pay on delivery, order confirmation and order history |
| **Product image upload** | Signed-in members list products with a photo: pick or drag a file, it is validated and shrunk in the browser; add, replace or remove a photo later |
| **Newsletter** | Footer sign-up with validation, plus an unsubscribe page |
| **Terms and Conditions** | Sample terms whose prices and limits are read from the same constants the store uses |
| **Privacy Policy** | Lists every piece of stored data and how to delete it (a test fails if a new storage key is not described) |
| **Help** | Searchable FAQ accordion and a contact form |
| **Back to top** | Floating button after scrolling down; smooth scroll, reduced-motion aware, keeps keyboard focus |

## Getting started

Requires Node.js. It is developed and tested on Node 26; the toolchain (Vite 8, Vitest 5, TypeScript 7) expects a current release.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run lint` | Lint `src` with oxlint |

To try checkout use the test card `4242 4242 4242 4242`, any future expiry and any 3-digit code. Please do not enter a real card number.

## What "demo" means

These are deliberate limits, not bugs:

- **No backend.** Data is stored per browser. Another browser or device sees an empty store, and clearing site data erases everything. A listing you create is visible only to you.
- **Sign-in is not real security.** Passwords are hashed with PBKDF2-SHA256 (310,000 iterations, per-user salt) using the Web Crypto API, and checked in constant time, but the hash sits in `localStorage` where anyone with access to the browser can read it. Do not reuse a real password.
- **Password reset sends no email.** The "email" appears on screen in a clearly labelled demo inbox. Reset codes are stored only as a SHA-256 hash and expire after 30 minutes.
- **Checkout takes no payment.** Only the card brand and last four digits are kept with an order; the full number, expiry and security code are never stored. Delivery prices and the 8% tax are illustrative.
- **Stock is local.** Ordering lowers stock in your browser only.
- **Newsletter and contact messages are not sent anywhere.** They are saved locally and listed so you can delete them.
- **Legal pages are sample text**, not legal advice, and say so on the page. Have a lawyer write real ones.
- **Photos are re-encoded in the browser** (JPEG, longest side 900 px, about 150 KB at most), which also strips EXIF data such as GPS location. Stored images must be small base64 image data URLs, so hand-edited storage cannot inject a script or a remote URL.

Deleting an account erases its profile, addresses, reset requests, orders and listings. Guest orders, the cart, the wishlist, newsletter sign-ups and contact messages are not tied to an account and are not erased; the Privacy page says so.

## Known gaps

- A listing's photo can be changed and the listing deleted, but its text, price and stock cannot be edited after publishing.
- Orders have a single "Processing" status; there is no fulfilment flow, returns or refunds.
- New listings have no reviews (they show "No reviews yet"); there is no review feature.
- Accessibility was built in (labelled fields, `aria-invalid` and `aria-describedby` on errors, focus moved to the first error, a shared live region for announcements, a skip link, keyboard-operable widgets) and checked with automated tests and the browser's accessibility tree. It has **not** been audited with real screen readers or an automated tool such as Lighthouse or axe.
- Browser checks were done in a single Chromium-based browser. Safari and Firefox have not been tried.
- The smooth-scroll animation of the back-to-top button was not observed visually; its scroll call, threshold and focus handling were tested.

## Tech stack

- React 19, React Router 7, TypeScript (strict), Vite 8
- Plain CSS with light and dark design tokens (follows the system setting)
- Vitest 5, Testing Library, user-event and jsdom for tests; oxlint for linting

## Project layout

```
src/
  components/   Reusable UI (header, footer, search bar, cards, forms, uploader, ...)
  context/      App-wide state: auth, products, cart, wishlist, orders, newsletter, announcer
  data/         The product catalog, categories and FAQ
  hooks/        usePersistentState (localStorage with cross-tab sync), useDocumentTitle
  lib/          Pure, unit-tested logic: cart, filters, search, checkout, payment, auth, images, listings, ...
  pages/        Route components (account pages under pages/account, sign-in pages under pages/auth)
  styles/       CSS, one file per area
  test/         Test helpers
```

Design choices worth knowing:

- Money is stored as integer cents, so totals are exact.
- Every value read from `localStorage` is treated as untrusted and passed through a sanitiser, so stale or hand-edited data cannot crash the app.
- Business rules live in `src/lib` as plain functions and are tested without rendering anything; pages are then tested end to end through the real app, providers and routes.

## Tests

```bash
npm test
```

The suite has 553 tests across 39 files: unit tests for the logic in `src/lib` and behaviour tests that drive the whole app the way a person would (typing into fields, clicking buttons, using the keyboard). `npm run build` also typechecks.

## Branches

`main` is this app, built from scratch one feature per commit. The `master` branch holds a separate, independent implementation of TechCart by another contributor; `main` does not build on it or share its code.
