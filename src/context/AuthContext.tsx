import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import {
  createCredentials,
  newId,
  normalizeEmail,
  sanitizeSession,
  sanitizeUsers,
  toPublicUser,
  validateEmail,
  validateName,
  validatePassword,
  verifyPassword,
  type PublicUser,
  type User,
} from '../lib/auth'
import {
  addResetRecord,
  createResetToken,
  findValidRecord,
  removeRecordsForUser,
  sanitizeResetRecords,
  sha256Hex,
  type ResetRecord,
} from '../lib/passwordReset'
import { STORAGE_KEYS } from '../lib/storage'

export type AuthResult = { ok: true } | { ok: false; error: string }

const OK: AuthResult = { ok: true }
const fail = (error: string): AuthResult => ({ ok: false, error })

interface AuthContextValue {
  /** The signed-in user, or null. Credential fields are never exposed. */
  user: PublicUser | null
  signUp: (input: { name: string; email: string; password: string }) => Promise<AuthResult>
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>
  signOut: () => void
  updateProfile: (input: { name: string; email: string }) => AuthResult
  changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<AuthResult>
  deleteAccount: (password: string) => Promise<AuthResult>
  /**
   * Starts a password reset. Returns the reset token only when the account
   * exists, so the demo inbox can show the "email" (there is no mail server).
   */
  requestPasswordReset: (email: string) => Promise<{ token: string | null }>
  /** Whether a reset token is valid (known, unexpired, and for an account that still exists). */
  checkResetToken: (token: string) => Promise<boolean>
  resetPassword: (input: { token: string; newPassword: string }) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const NO_USERS: User[] = []
const NO_RESET_RECORDS: ResetRecord[] = []

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = usePersistentState<User[]>(STORAGE_KEYS.users, NO_USERS, sanitizeUsers)
  const [sessionId, setSessionId] = usePersistentState<string | null>(STORAGE_KEYS.session, null, sanitizeSession)

  const [resetRecords, setResetRecords] = usePersistentState<ResetRecord[]>(
    STORAGE_KEYS.resetTokens,
    NO_RESET_RECORDS,
    sanitizeResetRecords,
  )

  // Async operations need the latest data, not what was captured when the callback was created.
  const usersRef = useRef(users)
  usersRef.current = users
  const resetRecordsRef = useRef(resetRecords)
  resetRecordsRef.current = resetRecords

  const currentUser = useMemo(() => users.find((candidate) => candidate.id === sessionId) ?? null, [users, sessionId])
  const user = useMemo(() => (currentUser ? toPublicUser(currentUser) : null), [currentUser])
  const currentRef = useRef(currentUser)
  currentRef.current = currentUser

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ name, email, password }) => {
      const problem = validateName(name) ?? validateEmail(email) ?? validatePassword(password)
      if (problem) return fail(problem)
      const normalized = normalizeEmail(email)
      if (usersRef.current.some((existing) => existing.email === normalized)) {
        return fail('An account with this email already exists. Try signing in instead.')
      }
      const credentials = await createCredentials(password)
      const created: User = {
        id: newId(),
        name: name.trim(),
        email: normalized,
        createdAt: new Date().toISOString(),
        ...credentials,
      }
      setUsers((current) => [...current, created])
      setSessionId(created.id)
      return OK
    },
    [setUsers, setSessionId],
  )

  const signIn = useCallback<AuthContextValue['signIn']>(
    async ({ email, password }) => {
      const normalized = normalizeEmail(email)
      const found = usersRef.current.find((candidate) => candidate.email === normalized)
      // One message for "no such account" and "wrong password", so the form does not reveal which emails are registered.
      if (!found || !(await verifyPassword(password, found))) return fail('Incorrect email or password.')
      setSessionId(found.id)
      return OK
    },
    [setSessionId],
  )

  const signOut = useCallback(() => setSessionId(null), [setSessionId])

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    ({ name, email }) => {
      const active = currentRef.current
      if (!active) return fail('You need to be signed in.')
      const problem = validateName(name) ?? validateEmail(email)
      if (problem) return fail(problem)
      const normalized = normalizeEmail(email)
      if (usersRef.current.some((other) => other.id !== active.id && other.email === normalized)) {
        return fail('Another account already uses this email.')
      }
      setUsers((current) =>
        current.map((candidate) =>
          candidate.id === active.id ? { ...candidate, name: name.trim(), email: normalized } : candidate,
        ),
      )
      return OK
    },
    [setUsers],
  )

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async ({ currentPassword, newPassword }) => {
      const active = currentRef.current
      if (!active) return fail('You need to be signed in.')
      if (!(await verifyPassword(currentPassword, active))) return fail('Your current password is incorrect.')
      const problem = validatePassword(newPassword)
      if (problem) return fail(problem)
      if (newPassword === currentPassword) return fail('Choose a password different from your current one.')
      const credentials = await createCredentials(newPassword)
      setUsers((current) => current.map((candidate) => (candidate.id === active.id ? { ...candidate, ...credentials } : candidate)))
      return OK
    },
    [setUsers],
  )

  const deleteAccount = useCallback<AuthContextValue['deleteAccount']>(
    async (password) => {
      const active = currentRef.current
      if (!active) return fail('You need to be signed in.')
      if (!(await verifyPassword(password, active))) return fail('That password is incorrect.')
      setSessionId(null)
      setUsers((current) => current.filter((candidate) => candidate.id !== active.id))
      setResetRecords((current) => removeRecordsForUser(current, active.id))
      return OK
    },
    [setUsers, setSessionId, setResetRecords],
  )

  const requestPasswordReset = useCallback<AuthContextValue['requestPasswordReset']>(
    async (email) => {
      const normalized = normalizeEmail(email)
      const found = usersRef.current.find((candidate) => candidate.email === normalized)
      if (!found) return { token: null }
      const now = Date.now()
      const { token, record } = await createResetToken(found.id, now)
      setResetRecords((current) => addResetRecord(current, record, now))
      return { token }
    },
    [setResetRecords],
  )

  const checkResetToken = useCallback<AuthContextValue['checkResetToken']>(async (token) => {
    if (!token) return false
    const record = findValidRecord(resetRecordsRef.current, await sha256Hex(token), Date.now())
    return record !== undefined && usersRef.current.some((candidate) => candidate.id === record.userId)
  }, [])

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(
    async ({ token, newPassword }) => {
      const problem = validatePassword(newPassword)
      if (problem) return fail(problem)
      const record = token ? findValidRecord(resetRecordsRef.current, await sha256Hex(token), Date.now()) : undefined
      const target = record ? usersRef.current.find((candidate) => candidate.id === record.userId) : undefined
      if (!record || !target) return fail('This reset link is invalid or has expired. Request a new one.')
      const credentials = await createCredentials(newPassword)
      setUsers((current) => current.map((candidate) => (candidate.id === target.id ? { ...candidate, ...credentials } : candidate)))
      // Single use: drop every outstanding link for this account.
      setResetRecords((current) => removeRecordsForUser(current, target.id))
      return OK
    },
    [setUsers, setResetRecords],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signUp,
      signIn,
      signOut,
      updateProfile,
      changePassword,
      deleteAccount,
      requestPasswordReset,
      checkResetToken,
      resetPassword,
    }),
    [user, signUp, signIn, signOut, updateProfile, changePassword, deleteAccount, requestPasswordReset, checkResetToken, resetPassword],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
