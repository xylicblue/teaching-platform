import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import './SocialButtons.css'

type Props = {
  mode:           'signin' | 'signup'
  onSuccess:      (name: string) => void
  onSwitchToRole: () => void
  compact?:       boolean
}

const PROVIDERS = [
  {
    name: 'Google',
    logo: <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M45 24c0-1.6-.1-3.1-.4-4.6H24v9.3h11.8c-.5 2.8-2 5.1-4.4 6.7v5.6h7.1C42.7 37 45 31 45 24z"/><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.6c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.2 2 20.5 2 24s1 6.8 2.5 9.9l7.3-5.7z"/><path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"/></svg>,
    primary: true,
  },
  {
    name: 'Apple',
    logo: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.7 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.5-3.8zM14.8 5.5c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1 0 2.2-.6 2.9-1.3z"/></svg>,
    primary: true,
  },
  {
    name: 'Microsoft',
    logo: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#F25022" d="M2 2h9.5v9.5H2z"/><path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z"/><path fill="#00A4EF" d="M2 12.5h9.5V22H2z"/><path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z"/></svg>,
    primary: false,
  },
  {
    name: 'Facebook',
    logo: <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z"/></svg>,
    primary: false,
  },
  {
    name: 'LinkedIn',
    logo: <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.3a1.8 1.8 0 1 1 0-3.5 1.8 1.8 0 0 1 0 3.5zM19 19h-3v-4.7c0-1.1 0-2.5-1.5-2.5S12.8 13 12.8 14.2V19h-3v-9h2.9v1.2h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.7z"/></svg>,
    primary: false,
  },
]

export default function SocialButtons({ mode, onSuccess, onSwitchToRole, compact }: Props) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)

  async function handleClick(name: string) {
    if (loadingProvider) return

    // Google: use real Supabase OAuth when configured
    if (name === 'Google' && isSupabaseConfigured) {
      const redirect = new URLSearchParams(window.location.search).get('redirect')
      if (redirect) sessionStorage.setItem('postAuthRedirect', redirect)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      return
    }

    // Other providers: prototype mock
    setLoadingProvider(name)
    setTimeout(() => {
      setLoadingProvider(null)
      if (mode === 'signup') onSwitchToRole()
      else onSuccess('Ahmed')
    }, 1400)
  }

  const primary   = PROVIDERS.filter(p => p.primary)
  const secondary = PROVIDERS.filter(p => !p.primary)

  return (
    <div className="socials">
      {primary.map(p => (
        <button
          key={p.name}
          className={`social-btn ${loadingProvider === p.name ? 'loading' : ''}`}
          onClick={() => handleClick(p.name)}
          disabled={!!loadingProvider}
          aria-label={`Continue with ${p.name}`}
        >
          <span className="logo">{p.logo}</span>
          <span className="lbl">{compact ? p.name : `Continue with ${p.name}`}</span>
          {loadingProvider === p.name && (
            <span className="spin"><span className="spinner dark" aria-label="Loading…" /></span>
          )}
        </button>
      ))}

      <div className={`socials-more ${showMore ? 'open' : ''}`}>
        {secondary.map(p => (
          <button
            key={p.name}
            className={`social-btn ${loadingProvider === p.name ? 'loading' : ''}`}
            onClick={() => handleClick(p.name)}
            disabled={!!loadingProvider}
            aria-label={`Continue with ${p.name}`}
          >
            <span className="logo">{p.logo}</span>
            <span className="lbl">{compact ? p.name : `Continue with ${p.name}`}</span>
            {loadingProvider === p.name && (
              <span className="spin"><span className="spinner dark" /></span>
            )}
          </button>
        ))}
      </div>

      <button className="more-socials" onClick={() => setShowMore(s => !s)}>
        {showMore
          ? 'Fewer options'
          : `More ways to ${mode === 'signup' ? 'sign up' : 'sign in'}`}
      </button>
    </div>
  )
}
