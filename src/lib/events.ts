/**
 * Fired on `window` when an account is deleted, so other data keyed to that
 * account (orders, listings) can erase itself without the auth layer having
 * to know about every feature that stores per-user data.
 */
export const ACCOUNT_DELETED_EVENT = 'techcart:account-deleted'

export interface AccountDeletedDetail {
  userId: string
}

export function announceAccountDeleted(userId: string) {
  window.dispatchEvent(new CustomEvent<AccountDeletedDetail>(ACCOUNT_DELETED_EVENT, { detail: { userId } }))
}
