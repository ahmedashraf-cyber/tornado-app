import React, { useState } from 'react'
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const STEP = { EMAIL: 'email', PASSWORD: 'password', RESET_SENT: 'reset_sent' }

export default function LoginPage() {
  const [step, setStep] = useState(STEP.EMAIL)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Step 1: validate email and move to password ──
  function handleEmailContinue(e) {
    e.preventDefault()
    setError('')
    const trimmed = email.trim()
    if (!trimmed) { setError('Email address is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setStep(STEP.PASSWORD)
  }

  // ── Step 2: sign in ──
  async function handlePasswordContinue(e) {
    e.preventDefault()
    setError('')
    if (!password) { setError('Password is required.'); return }
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      // Role fetched in AuthContext via onAuthStateChanged — no action needed here
    } catch (err) {
      setLoading(false)
      setError(friendlyError(err.code))
    }
  }

  // ── Forgot password ──
  async function handleForgotPassword() {
    setError('')
    if (!email.trim()) { setError('Email address is missing.'); return }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setStep(STEP.RESET_SENT)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  function friendlyError(code) {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.'
      case 'auth/wrong-password': return 'Incorrect password. Please try again.'
      case 'auth/invalid-credential': return 'Incorrect email or password.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      case 'auth/network-request-failed': return 'Network error. Check your connection.'
      default: return 'Something went wrong. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm px-8 py-10">

        {/* ── Logo / Brand ── */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-tornado-red">
            Tornado
          </h1>
        </div>

        {/* ── STEP: EMAIL ── */}
        {step === STEP.EMAIL && (
          <>
            <h2 className="text-center text-xl font-normal text-gray-800 mb-6">
              Log In
            </h2>
            <form onSubmit={handleEmailContinue} noValidate>
              <div className="relative mb-4">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder=" "
                  autoFocus
                  autoComplete="email"
                  className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                >
                  Email address*
                </label>
              </div>

              {error && (
                <p className="text-red-600 text-xs mb-3">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-tornado-red hover:bg-red-700 text-white font-medium py-3 rounded transition-colors text-sm"
              >
                Continue
              </button>
            </form>
          </>
        )}

        {/* ── STEP: PASSWORD ── */}
        {step === STEP.PASSWORD && (
          <>
            <h2 className="text-center text-xl font-normal text-gray-800 mb-2">
              Enter Your Password
            </h2>
            <p className="text-center text-sm text-gray-500 mb-5">
              Enter your password for Tornado to continue to Collection App
            </p>

            <form onSubmit={handlePasswordContinue} noValidate>
              {/* Locked email display with Edit link */}
              <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-2.5 mb-3">
                <span className="text-sm text-gray-700 truncate">{email}</span>
                <button
                  type="button"
                  onClick={() => { setStep(STEP.EMAIL); setPassword(''); setError('') }}
                  className="text-blue-600 text-sm font-medium ml-3 hover:underline flex-shrink-0"
                >
                  Edit
                </button>
              </div>

              {/* Password field */}
              <div className="relative mb-2">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder=" "
                  autoFocus
                  autoComplete="current-password"
                  className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 pr-10 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <label
                  htmlFor="password"
                  className="absolute left-3 top-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500"
                >
                  Password*
                </label>
                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot password */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-xs mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tornado-red hover:bg-red-700 disabled:opacity-60 text-white font-medium py-3 rounded transition-colors text-sm"
              >
                {loading ? 'Signing in…' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP: RESET EMAIL SENT ── */}
        {step === STEP.RESET_SENT && (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              A password reset link has been sent to <strong>{email}</strong>
            </p>
            <button
              onClick={() => { setStep(STEP.PASSWORD); setError('') }}
              className="w-full bg-tornado-red hover:bg-red-700 text-white font-medium py-3 rounded transition-colors text-sm"
            >
              Back to login
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
