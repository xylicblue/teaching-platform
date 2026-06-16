import { useState } from 'react'
import SocialButtons from '../SocialButtons/SocialButtons'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import './SignUpForm.css'

type Props = {
  onSwitch: () => void
  onToRole: () => void
}

const EYE_OPEN = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EYE_OFF = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.2 3.2M6.6 6.6A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
  </svg>
)

function pwScore(v: string) {
  if (!v) return 0
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return Math.max(1, s)
}

export default function SignUpForm({ onSwitch, onToRole }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [country,   setCountry]   = useState('Pakistan')
  const [phone,     setPhone]     = useState('')
  const [agree,     setAgree]     = useState(false)
  const [errors,    setErrors]    = useState<Record<string, string>>({})
  const [apiError,  setApiError]  = useState('')
  const [loading,   setLoading]   = useState(false)

  const score = pwScore(password)

  function clearErr(key: string) { setErrors(x => ({ ...x, [key]: '' })) }

  function validate() {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'Required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    if (password.length < 8) e.password = 'Use at least 8 characters.'
    if (!agree) e.agree = 'Please accept the terms to continue.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')

    if (!isSupabaseConfigured) {
      setTimeout(() => { setLoading(false); onToRole() }, 1300)
      return
    }

    const countryCode = country === 'Pakistan' ? 'PK'
      : country === 'India' ? 'IN'
      : country === 'Bangladesh' ? 'BD'
      : country === 'United Arab Emirates' ? 'AE'
      : country === 'United Kingdom' ? 'GB'
      : country

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name:  lastName.trim() || null,
          phone:      phone || null,
          country:    countryCode,
        },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already in use') || msg.includes('email_exists')) {
        setErrors(e => ({ ...e, email: 'This email is already registered. Sign in instead, or use "Continue with Google" if you signed up that way.' }))
      } else {
        setApiError(error.message)
      }
      setLoading(false)
      return
    }

    // With email confirmation ON, Supabase returns error: null but identities: []
    // when the email is already taken — it silently no-ops to prevent enumeration.
    if (!data.user?.identities?.length) {
      setErrors(e => ({ ...e, email: 'This email is already registered. Sign in instead, or use "Continue with Google" if you signed up that way.' }))
      setLoading(false)
      return
    }

    setLoading(false)
    onToRole()
  }

  return (
    <div className="auth-form">
      <div className="form-switch-top">
        <span className="switch-q">
          Have an account?{' '}
          <button className="link-btn" onClick={onSwitch}>Sign in →</button>
        </span>
      </div>

      <h1 className="auth-head display">Create your account</h1>
      <p className="auth-sub">Find the right tutor in minutes.</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 'var(--s3)' }}>
        <div className="row-2">
          <div className={`field ${errors.firstName ? 'field--err' : ''}`}>
            <label htmlFor="su-first">First name</label>
            <div className="input-wrap">
              <input id="su-first" type="text" placeholder="Ahmed"
                autoComplete="given-name" value={firstName}
                onChange={e => { setFirstName(e.target.value); clearErr('firstName'); setApiError('') }}
              />
            </div>
            {errors.firstName && <p className="hint hint--error">{errors.firstName}</p>}
          </div>

          <div className="field">
            <label htmlFor="su-last">Last name</label>
            <div className="input-wrap">
              <input id="su-last" type="text" placeholder="Khan"
                autoComplete="family-name" value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={`field ${errors.email ? 'field--err' : ''}`}>
          <label htmlFor="su-email">Email address</label>
          <div className="input-wrap">
            <input id="su-email" type="email" placeholder="you@example.com"
              autoComplete="email" value={email}
              onChange={e => { setEmail(e.target.value); clearErr('email'); setApiError('') }}
            />
          </div>
          {errors.email && <p className="hint hint--error">{errors.email}</p>}
        </div>

        <div className={`field ${errors.password ? 'field--err' : ''}`}>
          <label htmlFor="su-password">Password</label>
          <div className="input-wrap">
            <input id="su-password" type={showPw ? 'text' : 'password'}
              placeholder="At least 8 characters"
              autoComplete="new-password" value={password}
              onChange={e => { setPassword(e.target.value); clearErr('password') }}
            />
            <button type="button" className="toggle-pw"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw(s => !s)}
            >
              {showPw ? EYE_OFF : EYE_OPEN}
            </button>
          </div>
          {password && (
            <div className={`pw-strength s${score}`} aria-hidden="true">
              <i /><i /><i /><i />
            </div>
          )}
          {errors.password && <p className="hint hint--error">{errors.password}</p>}
        </div>

        <div className="row-2">
          <div className="field">
            <label htmlFor="su-country">Country</label>
            <div className="input-wrap">
              <select id="su-country" value={country} onChange={e => setCountry(e.target.value)}>
                <option>Pakistan</option>
                <option>India</option>
                <option>Bangladesh</option>
                <option>United Arab Emirates</option>
                <option>United Kingdom</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="su-phone">Phone</label>
            <div className="input-wrap">
              <input id="su-phone" type="tel" placeholder="+92 3xx xxxxxxx"
                autoComplete="tel" value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <label className="checkbox terms">
          <input type="checkbox" checked={agree}
            onChange={e => { setAgree(e.target.checked); clearErr('agree') }}
          />
          <span className="box">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </span>
          <span>
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            {errors.agree && <span className="hint hint--error" style={{ display: 'block' }}>{errors.agree}</span>}
          </span>
        </label>

        {apiError && <p className="hint hint--error" role="alert" style={{ marginBottom: 'var(--s2)' }}>{apiError}</p>}

        <button type="submit" className={`btn btn-primary submit${loading ? ' loading' : ''}`} disabled={loading}>
          Create account
          {loading && <span className="spin"><span className="spinner" aria-label="Creating account…" /></span>}
        </button>
      </form>

      <div className="divider">OR</div>
      <SocialButtons mode="signup" onSuccess={() => {}} onSwitchToRole={onToRole} compact />

      <p className="fp-switch">
        Already have an account?{' '}
        <button className="link-btn" onClick={onSwitch}>Sign in →</button>
      </p>
    </div>
  )
}
