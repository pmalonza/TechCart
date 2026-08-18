# TechCart

A client-side shopping app for electronics, computers, and phones, built with React and Vite. There is no backend — accounts, sessions, and carts are stored in the browser's `localStorage`, and anything described as "sent" (a reset code, a verification code) is shown directly in the UI as a stand-in for a real email.

## Features

- **Product catalog** — electronics (refrigerators, TVs, vacuums, accessories), computers (laptops, accessories), and phones (smartphones, accessories), organized by category and subcategory.
- **Browsing** — category and subcategory navigation, price range and color filters.
- **Product detail** — color and size variants where applicable, quantity selection, add to cart.
- **Accounts** — sign up (restricted to well-known email providers), sign in with a mock email verification code step, forgot password with a mock reset code, and a profile page to update your display name.
- **Cart** — add/update/remove items, persisted per signed-in account (a separate guest cart is used when signed out), with a running subtotal and total.
- **Discount codes** — `SAVE10` (10% off) and `WELCOME5` ($5 off), applied in the cart and carried through to checkout.
- **Checkout** — delivery address and payment method (PayPal or bank transfer, mock), an order confirmation with the final order summary, and a cart that empties after the order is placed.
- **Help** — a short FAQ covering accounts, cart, discount codes, and checkout.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm test` — run the Vitest suite
- `npm run lint` — run oxlint
- `npm run build` — production build
- `npm run preview` — preview the production build locally

## Notes

- Passwords are hashed client-side (`SHA-256` via the Web Crypto API) before being stored, but this is **not** real security — there's no server, no per-user salt secret, and no protection against someone reading `localStorage` directly. Don't reuse a real password here.
- Discount codes, reset codes, and verification codes are intentionally visible in the UI since there's no backend to send them anywhere.
