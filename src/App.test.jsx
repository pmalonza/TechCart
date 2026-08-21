import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

function fillSignUpForm(user, { name, email, password }) {
  return Promise.resolve()
    .then(() => user.type(screen.getByLabelText('Name'), name))
    .then(() => user.type(screen.getByLabelText('Email'), email))
    .then(() => user.type(screen.getByLabelText('Password'), password))
    .then(() => user.type(screen.getByLabelText('Confirm password'), password))
}

describe('App', () => {
  it('opens a product detail view when a card is clicked, and returns via Back', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))

    expect(screen.getByRole('heading', { name: 'VividView 55" 4K QLED TV' })).toBeInTheDocument()
    expect(screen.getByText('Electronics › TVs')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Electronics' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back to products/ }))

    expect(screen.queryByText('Electronics › TVs')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
    // The product is back in the list (as a card, not the detail view).
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
  })

  it('resets variant selection when navigating from one product detail to another', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /FrostGuard 18cu\.ft/ }))
    await user.click(screen.getByRole('button', { name: 'Black' }))
    expect(screen.getByText('Color: Black')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back to products/ }))
    await user.click(screen.getByRole('button', { name: /CompactCool Mini Fridge/ }))

    // A different product with its own color list (not the "Black" from before).
    expect(screen.getByText('Color: White')).toBeInTheDocument()
  })

  it('renders all products by default', () => {
    render(<App />)
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.getByText('Nova X12 Smartphone')).toBeInTheDocument()
  })

  it('filters products by minimum price', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Min price'), '500')

    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.queryByText('Nova SE Smartphone')).not.toBeInTheDocument()
  })

  it('filters products by maximum price', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Max price'), '50')

    expect(screen.getByText('Universal Remote Control')).toBeInTheDocument()
    expect(screen.queryByText('AeroBook 14" Ultralight Laptop')).not.toBeInTheDocument()
  })

  it('filters products by min and max price together', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Min price'), '100')
    await user.type(screen.getByLabelText('Max price'), '200')

    expect(screen.getByText('CompactCool Mini Fridge')).toBeInTheDocument()
    expect(screen.queryByText('AeroBook 14" Ultralight Laptop')).not.toBeInTheDocument()
    expect(screen.queryByText('Fast Wireless Charging Pad')).not.toBeInTheDocument()
  })

  it('filters products by color', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Red' }))

    expect(screen.getByText('CompactCool Mini Fridge')).toBeInTheDocument()
    expect(screen.getByText('Shockproof Phone Case')).toBeInTheDocument()
    expect(screen.queryByText('AeroBook 14" Ultralight Laptop')).not.toBeInTheDocument()
  })

  it('clears the color filter when "All" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Red' }))
    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
  })

  it('filters to a category when selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))

    expect(screen.getByText('Nova X12 Smartphone')).toBeInTheDocument()
    expect(screen.queryByText('AeroBook 14" Ultralight Laptop')).not.toBeInTheDocument()
  })

  it('narrows further to a subcategory when selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Electronics' }))
    await user.click(screen.getByRole('button', { name: 'TVs' }))

    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
    expect(screen.queryByText('SweepMaster Robot Vacuum')).not.toBeInTheDocument()
  })

  it('resets the subcategory when switching categories', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Electronics' }))
    await user.click(screen.getByRole('button', { name: 'TVs' }))
    await user.click(screen.getByRole('button', { name: 'Computers' }))

    expect(screen.getByRole('button', { name: 'All Computers' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.getByText('27" 1440p Monitor')).toBeInTheDocument()
  })

  it('returns to all products when "All products" is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Phones' }))
    await user.click(screen.getByRole('button', { name: 'All products' }))

    expect(screen.getByText('AeroBook 14" Ultralight Laptop')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All Phones' })).not.toBeInTheDocument()
  })

  async function goToSignUpTab(user) {
    await user.click(screen.getByRole('tab', { name: 'Create account' }))
  }

  async function signIn(user, { email, password }) {
    await user.type(screen.getByLabelText('Email'), email)
    await user.type(screen.getByLabelText('Password'), password)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    const code = screen.getByText(/the code is \d{6}/).textContent.match(/\d{6}/)[0]
    await user.type(screen.getByLabelText('Verification code'), code)
    await user.click(screen.getByRole('button', { name: 'Verify' }))
  }

  async function completeSignUp(user, { name, email, password }) {
    await goToSignUpTab(user)
    await fillSignUpForm(user, { name, email, password })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const code = screen.getByText(/the code is \d{6}/).textContent.match(/\d{6}/)[0]
    await user.type(screen.getByLabelText('Verification code'), code)
    await user.click(screen.getByRole('button', { name: 'Verify' }))
  }

  it('creates an account and persists it to localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })

    expect(screen.getByRole('status')).toHaveTextContent('Account created for Ada Lovelace')

    const stored = JSON.parse(window.localStorage.getItem('techcart:accounts'))
    expect(stored).toHaveLength(1)
    expect(stored[0].email).toBe('ada@gmail.com')
    expect(stored[0].passwordHash).not.toBe('longenoughpw')
  })

  it('rejects signing up twice with the same email', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })

    await goToSignUpTab(user)
    await fillSignUpForm(user, {
      name: 'Someone Else',
      email: 'ADA@GMAIL.com',
      password: 'anotherlongpw',
    })
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByRole('alert')).toHaveTextContent('An account with this email already exists.')
    const stored = JSON.parse(window.localStorage.getItem('techcart:accounts'))
    expect(stored).toHaveLength(1)
  })

  it('signs in with correct credentials and persists the session', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })

    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem('techcart:session'))).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
    })
  })

  it('rejects sign in with the wrong password', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password.')
    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
  })

  it('rejects sign in for an email with no account', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Email'), 'nobody@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'whatever123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No account found with that email.')
  })

  it('signs out and clears the session', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })
    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('techcart:session')).toBeNull()
  })

  it('adds an item to the cart and shows the count in the header', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(screen.getByRole('button', { name: 'Cart (1)' })).toBeInTheDocument()
  })

  it('shows added items in the cart view and allows removing them', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))

    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument()
  })

  it('keeps cart items tied to an account across sign out and sign in', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })
    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(screen.getByRole('button', { name: 'Cart (1)' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument()

    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    expect(screen.getByRole('button', { name: 'Cart (1)' })).toBeInTheDocument()
  })

  it('places an order through checkout and empties the cart', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))
    await user.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(screen.getByText(/VividView 55" 4K QLED TV/)).toBeInTheDocument()
    expect(screen.getByText('Total: $549.99')).toBeInTheDocument()

    const checkout = within(screen.getByRole('region', { name: 'Checkout' }))
    await user.type(checkout.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(checkout.getByLabelText('Street address'), '123 Main St')
    await user.type(checkout.getByLabelText('City'), 'Springfield')
    await user.type(checkout.getByLabelText('Postal code'), '12345')
    await user.click(checkout.getByRole('radio', { name: 'Bank transfer' }))
    await user.click(checkout.getByRole('button', { name: 'Place order' }))

    expect(screen.getByRole('status')).toHaveTextContent(/Order ORD-.+ placed\. Thank you!/)
    expect(
      screen.getByText('A confirmation email with your order details was sent to ada@gmail.com.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Shipping to 123 Main St, Springfield 12345')).toBeInTheDocument()
    expect(screen.getByText('Payment method: Bank transfer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }))

    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument()
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
  })

  it('applies a discount code and updates the cart total', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))

    expect(screen.getByText('Total: $549.99')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Discount code'), 'WELCOME5')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByText('Code WELCOME5 applied: -$5.00')).toBeInTheDocument()
    expect(screen.getByText('Total: $544.99')).toBeInTheDocument()
  })

  it('shows an error for an invalid discount code and leaves the total unchanged', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))

    await user.type(screen.getByLabelText('Discount code'), 'NOPE')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid discount code.')
    expect(screen.getByText('Total: $549.99')).toBeInTheDocument()
  })

  it('updates the profile name and reflects it in the signed-in header', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })
    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    await user.click(screen.getByRole('button', { name: 'Profile' }))
    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Ada King')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('status')).toHaveTextContent('Profile updated.')

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(screen.getByText('Ada King')).toBeInTheDocument()
    const stored = JSON.parse(window.localStorage.getItem('techcart:accounts'))
    expect(stored[0].name).toBe('Ada King')
  })

  it('opens and closes the help view from the header', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Help' }))

    expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByText('How do I add items to my cart?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(screen.queryByRole('heading', { name: 'Help' })).not.toBeInTheDocument()
    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
  })

  it('resets a forgotten password and signs in with the new password', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'originalpw123',
    })

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    const code = screen.getByText(/the code is \d{6}/).textContent.match(/\d{6}/)[0]
    await user.type(screen.getByLabelText('Reset code'), code)
    await user.type(screen.getByLabelText('New password'), 'brandnewpw456')
    await user.type(screen.getByLabelText('Confirm new password'), 'brandnewpw456')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    expect(
      screen.getByText('Password reset. You can now sign in with your new password.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to sign in' }))
    await signIn(user, { email: 'ada@gmail.com', password: 'brandnewpw456' })

    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('rejects sign in with the old password after a reset', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'originalpw123',
    })

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    const code = screen.getByText(/the code is \d{6}/).textContent.match(/\d{6}/)[0]
    await user.type(screen.getByLabelText('Reset code'), code)
    await user.type(screen.getByLabelText('New password'), 'brandnewpw456')
    await user.type(screen.getByLabelText('Confirm new password'), 'brandnewpw456')
    await user.click(screen.getByRole('button', { name: 'Reset password' }))

    await user.click(screen.getByRole('button', { name: 'Back to sign in' }))
    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'originalpw123')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Incorrect password.')
  })

  it('rejects a reset request for an email with no account', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }))
    await user.type(screen.getByLabelText('Email'), 'nobody@gmail.com')
    await user.click(screen.getByRole('button', { name: 'Send reset code' }))

    expect(screen.getByRole('alert')).toHaveTextContent('No account found with that email.')
  })

  it('requires a verification code after a correct password before signing in', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'longenoughpw')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByLabelText('Verification code')).toBeInTheDocument()
    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
  })

  it('rejects an incorrect verification code and keeps the user signed out', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })

    await user.type(screen.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(screen.getByLabelText('Password'), 'longenoughpw')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await user.type(screen.getByLabelText('Verification code'), '000000')
    await user.click(screen.getByRole('button', { name: 'Verify' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid or expired verification code.')
    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument()
  })

  it('returns to browse from product detail with one click on Home', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    expect(screen.getByRole('heading', { name: 'VividView 55" 4K QLED TV' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Home' }))

    expect(screen.queryByRole('heading', { name: 'VividView 55" 4K QLED TV' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
  })

  it('returns to browse from the cart with one click on Home', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Cart' }))
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Home' }))

    expect(screen.queryByText('Your cart is empty.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Electronics' })).toBeInTheDocument()
  })

  it('charges a delivery fee at checkout for a small order and waives it for a large one', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Shockproof Phone Case/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))
    await user.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(screen.getByText('Delivery: $9.99')).toBeInTheDocument()
    expect(screen.getByText('Total: $24.98')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back to cart/ }))
    await user.click(screen.getByRole('button', { name: 'Home' }))
    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (2)' }))
    await user.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(screen.getByText('Delivery: Free')).toBeInTheDocument()
  })

  it('subscribes to the newsletter from the browse page', async () => {
    const user = userEvent.setup()
    render(<App />)

    const newsletter = within(screen.getByRole('region', { name: 'Newsletter signup' }))
    await user.type(newsletter.getByLabelText('Newsletter email'), 'ada@gmail.com')
    await user.click(newsletter.getByRole('button', { name: 'Subscribe' }))

    expect(newsletter.getByText("Subscribed! We'll send updates to ada@gmail.com.")).toBeInTheDocument()
  })

  it('reaches the contact form from Help and sends a message', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Help' }))
    await user.click(screen.getByRole('button', { name: 'Contact us' }))

    expect(screen.getByRole('heading', { name: 'Contact us' })).toBeInTheDocument()

    const contact = within(screen.getByRole('region', { name: 'Contact us' }))
    await user.type(contact.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(contact.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(contact.getByLabelText('Message'), 'Where is my order?')
    await user.click(contact.getByRole('button', { name: 'Send message' }))

    expect(contact.getByRole('status')).toHaveTextContent(
      "Thanks, Ada Lovelace. Your message has been sent",
    )

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument()
  })

  it('reaches the return policy and warranty pages from Help', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Help' }))
    await user.click(screen.getByRole('button', { name: 'Return policy' }))

    expect(screen.getByRole('heading', { name: 'Return Policy' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Return window' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Back/ }))
    await user.click(screen.getByRole('button', { name: 'Warranty' }))

    expect(screen.getByRole('heading', { name: 'Warranty', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Standard coverage' })).toBeInTheDocument()
  })

  it('searches products by name', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Search products'), 'monitor')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByText('27" 1440p Monitor')).toBeInTheDocument()
    expect(screen.queryByText('VividView 55" 4K QLED TV')).not.toBeInTheDocument()
  })

  it('clears the search and shows all products again', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Search products'), 'monitor')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()
  })

  it('opens a product detail view from the hot deals banner', async () => {
    const user = userEvent.setup()
    render(<App />)

    const hotDeals = within(screen.getByRole('region', { name: 'Hot deals' }))
    await user.click(hotDeals.getByRole('button', { name: /ValueBook 15" Everyday Laptop/ }))

    expect(screen.getByRole('heading', { name: 'ValueBook 15" Everyday Laptop' })).toBeInTheDocument()
    expect(screen.getByText('$599.99')).toBeInTheDocument()
    expect(screen.getByText('$499.99')).toBeInTheDocument()
  })

  it('adds a product to the wishlist, shows it in the wishlist view, and can remove it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: /Add to wishlist/ }))

    expect(screen.getByRole('button', { name: /In wishlist/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Wishlist (1)' }))

    expect(screen.getByText('VividView 55" 4K QLED TV')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Remove.*from wishlist/ }))

    expect(screen.getByText('Your wishlist is empty.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wishlist' })).toBeInTheDocument()
  })

  it('keeps wishlist items tied to an account across sign out and sign in', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })
    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: /Add to wishlist/ }))
    expect(screen.getByRole('button', { name: 'Wishlist (1)' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(screen.getByRole('button', { name: 'Wishlist' })).toBeInTheDocument()

    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    expect(screen.getByRole('button', { name: 'Wishlist (1)' })).toBeInTheDocument()
  })

  it('shows a placed order in order history and tracks its status', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))
    await user.click(screen.getByRole('button', { name: 'Checkout' }))
    const checkout = within(screen.getByRole('region', { name: 'Checkout' }))
    await user.type(checkout.getByLabelText('Email'), 'ada@gmail.com')
    await user.type(checkout.getByLabelText('Street address'), '123 Main St')
    await user.type(checkout.getByLabelText('City'), 'Springfield')
    await user.type(checkout.getByLabelText('Postal code'), '12345')
    await user.click(checkout.getByRole('button', { name: 'Place order' }))

    const orderId = screen.getByRole('status').textContent.match(/ORD-\w+/)[0]

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }))
    await user.click(screen.getByRole('button', { name: 'Orders' }))

    expect(screen.getByText(orderId)).toBeInTheDocument()
    expect(screen.getByText('Order received')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Track order' }))

    expect(screen.getByRole('heading', { name: orderId })).toBeInTheDocument()
    expect(screen.getByText('Order received')).toHaveClass('order-tracking-step-complete')
    expect(screen.getByText('Packed')).not.toHaveClass('order-tracking-step-complete')

    await user.click(screen.getByRole('button', { name: /Simulate: mark as Packed/ }))

    expect(screen.getByText('Packed')).toHaveClass('order-tracking-step-complete')

    await user.click(screen.getByRole('button', { name: /Back to orders/ }))

    expect(screen.getByText('Packed')).toBeInTheDocument()
  })

  it('manages a saved address book and correctly applies whichever address is selected at checkout', async () => {
    const user = userEvent.setup()
    render(<App />)

    await completeSignUp(user, {
      name: 'Ada Lovelace',
      email: 'ada@gmail.com',
      password: 'longenoughpw',
    })
    await signIn(user, { email: 'ada@gmail.com', password: 'longenoughpw' })

    await user.click(screen.getByRole('button', { name: 'Profile' }))
    await user.click(screen.getByRole('button', { name: 'Manage addresses' }))

    await user.type(screen.getByLabelText('Label (optional)'), 'Home')
    await user.type(screen.getByLabelText('Street address'), '123 Main St')
    await user.type(screen.getByLabelText('City'), 'Springfield')
    await user.type(screen.getByLabelText('Postal code'), '12345')
    await user.click(screen.getByRole('button', { name: 'Add address' }))

    await user.type(screen.getByLabelText('Label (optional)'), 'Work')
    await user.type(screen.getByLabelText('Street address'), '456 Oak Ave')
    await user.type(screen.getByLabelText('City'), 'Shelbyville')
    await user.type(screen.getByLabelText('Postal code'), '67890')
    await user.click(screen.getByRole('button', { name: 'Add address' }))

    expect(screen.getByText('123 Main St, Springfield 12345')).toBeInTheDocument()
    expect(screen.getByText('456 Oak Ave, Shelbyville 67890')).toBeInTheDocument()
    expect(screen.getByText('Default')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Set as default' }))
    expect(screen.getAllByText('Default')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /Back/ }))
    await user.click(screen.getByRole('button', { name: /Back/ }))

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))
    await user.click(screen.getByRole('button', { name: 'Cart (1)' }))
    await user.click(screen.getByRole('button', { name: 'Checkout' }))

    const checkout = within(screen.getByRole('region', { name: 'Checkout' }))
    expect(checkout.getByLabelText('Street address')).toHaveValue('456 Oak Ave')

    await user.click(checkout.getByRole('button', { name: /Home: 123 Main St/ }))

    expect(checkout.getByLabelText('Street address')).toHaveValue('123 Main St')
    expect(checkout.getByLabelText('City')).toHaveValue('Springfield')
    expect(checkout.getByLabelText('Postal code')).toHaveValue('12345')
  })

  it('submits and shows a product review', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /VividView 55" 4K QLED TV/ }))

    const reviews = within(screen.getByRole('region', { name: 'Reviews' }))
    expect(reviews.getByText('No reviews yet. Be the first to review this product.')).toBeInTheDocument()

    await user.type(reviews.getByLabelText('Your name'), 'Ada Lovelace')
    await user.selectOptions(reviews.getByLabelText('Rating'), '4')
    await user.type(reviews.getByLabelText('Review'), 'Great picture, a bit pricey.')
    await user.click(reviews.getByRole('button', { name: 'Submit review' }))

    expect(reviews.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(reviews.getByText('Great picture, a bit pricey.')).toBeInTheDocument()
    expect(reviews.getByRole('heading', { name: /Reviews — 4.0 avg \(1\)/ })).toBeInTheDocument()
  })
})
