import { useState } from 'react'
import SocialButtons from '../SocialButtons/SocialButtons'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import './SignInForm.css'

type Props = {
  onSwitch:  () => void
  onSuccess: (name: string) => void
}

export default function SignInForm({ onSwitch, onSuccess }: Props) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetNote, setResetNote] = useState('')

  /* Password reset, using the email already typed into the form. */
  async function handleReset() {
    setApiError('')
    setResetNote('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(x => ({ ...x, email: 'Enter your email first, then tap Forgot password.' }))
      return
    }
    if (!isSupabaseConfigured) {
      setResetNote('Password reset is not available in this preview.')
      return
    }
    setResetting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    })
    setResetting(false)
    setResetNote(error
      ? 'Could not send the reset email. Please try again.'
      : `Reset link sent to ${email}. Check your inbox.`)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Enter a valid email address.'
    if (password.length < 6)
      e.password = 'Password must be at least 6 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')

    if (!isSupabaseConfigured) {
      setTimeout(() => { setLoading(false); onSuccess(email.split('@')[0] || 'Ahmed') }, 1300)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setApiError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', data.user.id)
      .single()

    const name = (profile as { first_name: string | null } | null)?.first_name
      || data.user.email?.split('@')[0]
      || 'there'

    setLoading(false)
    onSuccess(name)
  }

  return (
    <div className="auth-form">
      <div className="form-switch-top">
        <span className="switch-q">
          New here?{' '}
          <button className="link-btn" onClick={onSwitch}>Create account →</button>
        </span>
      </div>

      <h1 className="auth-head display">Welcome back</h1>
      <p className="auth-sub">Continue learning with your tutors.</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 'var(--s3)' }}>
        <div className={`field ${errors.email ? 'field--err' : ''}`}>
          <label htmlFor="si-email">Email</label>
          <div className="input-wrap">
            <input
              id="si-email" type="email" placeholder="you@example.com"
              autoComplete="email" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(x => ({ ...x, email: '' })); setApiError('') }}
            />
          </div>
          {errors.email && <p className="hint hint--error">{errors.email}</p>}
        </div>

        <div className={`field ${errors.password ? 'field--err' : ''}`}>
          <label htmlFor="si-password">Password</label>
          <div className="input-wrap">
            <input
              id="si-password" type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password" value={password}
              onChange={e => { setPassword(e.target.value); setErrors(x => ({ ...x, password: '' })); setApiError('') }}
            />
            <button type="button" className="toggle-pw"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw(s => !s)}
            >
              {showPw
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.2 3.2M6.6 6.6A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.4-1.6M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          {errors.password && <p className="hint hint--error">{errors.password}</p>}
        </div>

        <div className="opt-row">
          <label className="checkbox">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span className="box">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
            </span>
            Remember me
          </label>
          <button type="button" className="forgot" onClick={handleReset} disabled={resetting}>
            {resetting ? 'Sending…' : 'Forgot password?'}
          </button>
        </div>

        {resetNote && <p className="hint" role="status" style={{ marginBottom: 'var(--s2)' }}>{resetNote}</p>}
        {apiError && <p className="hint hint--error" role="alert" style={{ marginBottom: 'var(--s2)' }}>{apiError}</p>}

        <button type="submit" className={`btn btn-primary submit${loading ? ' loading' : ''}`} disabled={loading}>
          Sign in
          {loading && <span className="spin"><span className="spinner" aria-label="Signing in…" /></span>}
        </button>
      </form>

      <div className="divider">OR</div>
      <SocialButtons mode="signin" onSuccess={onSuccess} onSwitchToRole={() => {}} compact />

      <p className="fp-switch">
        Don&rsquo;t have an account?{' '}
        <button className="link-btn" onClick={onSwitch}>Create account →</button>
      </p>

      <p className="fp-legal">
        By signing in you agree to our terms of use.
      </p>
    </div>
  )
}
