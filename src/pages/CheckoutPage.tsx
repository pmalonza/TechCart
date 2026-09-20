import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AddressFields from '../components/AddressFields'
import AddressLines from '../components/AddressLines'
import BackButton from '../components/BackButton'
import { focusFirstError } from '../components/forms/focusFirstError'
import TextField from '../components/forms/TextField'
import OrderSummary from '../components/OrderSummary'
import { useAnnounce } from '../context/AnnouncerContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { emptyAddressInput, getDefaultAddress, normalizeAddress, validateAddress, type AddressErrors, type AddressInput } from '../lib/addresses'
import { validateEmail } from '../lib/auth'
import { SHIPPING_METHODS, computeTotals, shippingCostCents, type ShippingMethodId } from '../lib/checkout'
import { formatPrice } from '../lib/money'
import type { OrderAddress, OrderPayment } from '../lib/orders'
import { CARD_BRAND_NAMES, detectCardBrand, formatCardNumber, formatExpiry, summarizeCard, validateCard, type CardErrors, type CardInput } from '../lib/payment'

type PaymentMethod = 'card' | 'cod'

const EMPTY_CARD: CardInput = { number: '', name: '', expiry: '', cvc: '' }

export default function CheckoutPage() {
  const { user, addresses, saveAddress } = useAuth()
  const { summary, clear } = useCart()
  const { placeOrder } = useOrders()
  const navigate = useNavigate()
  const announce = useAnnounce()
  const formRef = useRef<HTMLFormElement>(null)
  const placed = useRef(false)
  useDocumentTitle('Checkout')

  const [guestEmail, setGuestEmail] = useState('')
  const [addressChoice, setAddressChoice] = useState<string>(() => getDefaultAddress(addresses)?.id ?? 'new')
  const [newAddress, setNewAddress] = useState<AddressInput>(emptyAddressInput())
  const [saveNewAddress, setSaveNewAddress] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState<CardInput>(EMPTY_CARD)

  const [emailError, setEmailError] = useState<string | undefined>()
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({})
  const [cardErrors, setCardErrors] = useState<CardErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  // A saved address deleted elsewhere (another tab) falls back to entering a new one.
  const savedChoice = addresses.find((address) => address.id === addressChoice)
  const usingNewAddress = !savedChoice

  if (summary.lines.length === 0 && !placed.current) return <Navigate to="/cart" replace />
  if (summary.lines.length === 0) return null

  const totals = computeTotals(summary.subtotalCents, shippingMethod)
  const reducedLines = summary.lines.filter((line) => line.reducedFrom !== undefined)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const foundEmail = user ? undefined : (validateEmail(guestEmail) ?? undefined)
    const foundAddress = usingNewAddress ? validateAddress(newAddress) : {}
    const foundCard = paymentMethod === 'card' ? validateCard(card, new Date()) : {}
    setEmailError(foundEmail)
    setAddressErrors(foundAddress)
    setCardErrors(foundCard)

    if (foundEmail || Object.keys(foundAddress).length > 0 || Object.keys(foundCard).length > 0) {
      setFormError('Please fix the highlighted fields and try again.')
      focusFirstError(formRef.current)
      return
    }

    const normalizedNew = normalizeAddress(newAddress)
    const chosen = savedChoice ?? normalizedNew
    const address: OrderAddress = {
      label: chosen.label,
      fullName: chosen.fullName,
      phone: chosen.phone,
      line1: chosen.line1,
      line2: chosen.line2,
      city: chosen.city,
      region: chosen.region,
      postalCode: chosen.postalCode,
      country: chosen.country,
    }
    if (user && usingNewAddress && saveNewAddress) saveAddress({ ...normalizedNew, isDefault: addresses.length === 0 })

    // Only the brand and last four digits are kept; the full number, expiry and code never leave this component.
    const payment: OrderPayment = paymentMethod === 'card' ? { method: 'card', ...summarizeCard(card.number) } : { method: 'cod' }

    const order = placeOrder({
      userId: user?.id ?? null,
      email: user?.email ?? guestEmail.trim().toLowerCase(),
      lines: summary.lines.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        priceCents: product.priceCents,
        quantity,
      })),
      shippingMethod,
      address,
      payment,
    })

    placed.current = true
    clear()
    announce(`Order ${order.number} placed`)
    navigate(`/orders/${order.id}`, { replace: true })
  }

  const cardBrand = detectCardBrand(card.number)

  return (
    <div className="container page">
      <div className="page-top">
        <BackButton fallback="/cart" />
      </div>
      <header className="page-header">
        <h1>Checkout</h1>
      </header>

      <div className="alert demo-notice" role="note">
        <strong>Demo checkout.</strong> No payment is taken and no real order is placed. Please do not enter a real card number; use the test
        card 4242 4242 4242 4242 with any future expiry date and any 3-digit code.
      </div>

      {reducedLines.length > 0 && (
        <div className="alert" role="status">
          Some quantities were lowered because of limited stock:{' '}
          {reducedLines.map((line) => `${line.product.name} (now ${line.quantity})`).join(', ')}.
        </div>
      )}

      <div className="checkout-layout">
        <form id="checkout-form" ref={formRef} onSubmit={handleSubmit} noValidate className="checkout-form">
          {formError && (
            <div className="alert alert-error" role="alert">
              {formError}
            </div>
          )}

          <section className="card card-pad checkout-section" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contact</h2>
            {user ? (
              <p>
                Signed in as <strong>{user.email}</strong>. Order updates will go to this address.
              </p>
            ) : (
              <>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  hint="We use this to send your order confirmation."
                  value={guestEmail}
                  error={emailError}
                  onChange={(event) => setGuestEmail(event.target.value)}
                />
                <p className="muted small">
                  Have an account? <Link to="/login" state={{ from: { pathname: '/checkout', search: '' } }}>Sign in</Link> to use your saved addresses.
                </p>
              </>
            )}
          </section>

          <section className="card card-pad checkout-section" aria-labelledby="address-heading">
            <h2 id="address-heading">Delivery address</h2>

            {addresses.length > 0 && (
              <fieldset className="choice-group">
                <legend className="visually-hidden">Choose a delivery address</legend>
                {addresses.map((address) => (
                  <label key={address.id} className="choice">
                    <input
                      type="radio"
                      name="address-choice"
                      checked={savedChoice?.id === address.id}
                      onChange={() => setAddressChoice(address.id)}
                    />
                    <span className="choice-body">
                      <strong>{address.label || 'Address'}</strong>
                      {address.isDefault && <span className="badge-pill">Default</span>}
                      <AddressLines address={address} />
                    </span>
                  </label>
                ))}
                <label className="choice">
                  <input type="radio" name="address-choice" checked={usingNewAddress} onChange={() => setAddressChoice('new')} />
                  <span className="choice-body">
                    <strong>Use a different address</strong>
                  </span>
                </label>
              </fieldset>
            )}

            {usingNewAddress && (
              <>
                <AddressFields
                  idPrefix="checkout-address"
                  values={newAddress}
                  errors={addressErrors}
                  showLabel={false}
                  onChange={(field, value) => setNewAddress((current) => ({ ...current, [field]: value }))}
                />
                {user && (
                  <label className="check">
                    <input type="checkbox" checked={saveNewAddress} onChange={(event) => setSaveNewAddress(event.target.checked)} />
                    <span>Save this address to my account</span>
                  </label>
                )}
              </>
            )}
          </section>

          <section className="card card-pad checkout-section" aria-labelledby="shipping-heading">
            <h2 id="shipping-heading">Delivery method</h2>
            <fieldset className="choice-group">
              <legend className="visually-hidden">Choose a delivery method</legend>
              {SHIPPING_METHODS.map((method) => {
                const cost = shippingCostCents(method.id, summary.subtotalCents)
                return (
                  <label key={method.id} className="choice">
                    <input
                      type="radio"
                      name="shipping-method"
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                    />
                    <span className="choice-body choice-row">
                      <span>
                        <strong>{method.name}</strong>
                        <span className="muted"> {method.eta}</span>
                      </span>
                      <span className="choice-price">{cost === 0 ? 'Free' : formatPrice(cost)}</span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
          </section>

          <section className="card card-pad checkout-section" aria-labelledby="payment-heading">
            <h2 id="payment-heading">Payment</h2>
            <fieldset className="choice-group">
              <legend className="visually-hidden">Choose how to pay</legend>
              <label className="choice">
                <input type="radio" name="payment-method" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <span className="choice-body">
                  <strong>Credit or debit card</strong>
                </span>
              </label>
              <label className="choice">
                <input type="radio" name="payment-method" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span className="choice-body">
                  <strong>Pay on delivery</strong>
                  <span className="muted"> Pay the courier when your order arrives.</span>
                </span>
              </label>
            </fieldset>

            {paymentMethod === 'card' && (
              <div className="card-fields">
                <TextField
                  label="Card number"
                  name="cc-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  hint={cardBrand !== 'unknown' ? CARD_BRAND_NAMES[cardBrand] : undefined}
                  value={card.number}
                  error={cardErrors.number}
                  onChange={(event) => setCard((current) => ({ ...current, number: formatCardNumber(event.target.value) }))}
                />
                <TextField
                  label="Name on card"
                  name="cc-name"
                  autoComplete="cc-name"
                  value={card.name}
                  error={cardErrors.name}
                  onChange={(event) => setCard((current) => ({ ...current, name: event.target.value }))}
                />
                <div className="form-grid">
                  <TextField
                    label="Expiry date"
                    name="cc-exp"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={card.expiry}
                    error={cardErrors.expiry}
                    onChange={(event) => setCard((current) => ({ ...current, expiry: formatExpiry(event.target.value) }))}
                  />
                  <TextField
                    label="Security code"
                    name="cc-csc"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={card.cvc}
                    error={cardErrors.cvc}
                    onChange={(event) => setCard((current) => ({ ...current, cvc: event.target.value.replace(/\D/g, '') }))}
                  />
                </div>
              </div>
            )}
          </section>
        </form>

        <OrderSummary summary={summary} totals={totals} shippingMethod={shippingMethod}>
          <button type="submit" form="checkout-form" className="btn btn-primary btn-block btn-lg">
            Place order &middot; {formatPrice(totals.totalCents)}
          </button>
        </OrderSummary>
      </div>
    </div>
  )
}
