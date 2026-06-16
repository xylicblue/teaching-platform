import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Session } from '@supabase/supabase-js'

function routeAfterAuth(session: Session, navigate: ReturnType<typeof useNavigate>) {
  const stored = sessionStorage.getItem('postAuthRedirect')
  if (stored) {
    sessionStorage.removeItem('postAuthRedirect')
    navigate(stored, { replace: true })
    return
  }
  const user = session.user
  const createdAt  = new Date(user.created_at).getTime()
  const lastSignIn = new Date(user.last_sign_in_at ?? user.created_at).getTime()
  const isNewUser  = Math.abs(lastSignIn - createdAt) < 15000
  navigate(isNewUser ? '/' : '/dashboard', { replace: true })
}

export default function AuthCallback() {
  const navigate  = useNavigate()
  // useRef persists across React StrictMode's double-mount; a closure variable would reset.
  const routedRef = useRef(false)

  useEffect(() => {
    function routeOnce(session: Session) {
      if (routedRef.current) return
      routedRef.current = true
      routeAfterAuth(session, navigate)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        routeOnce(session)
      }
    })

    // Fallback: session already present on page refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) routeOnce(session)
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--paper)',
      fontFamily: 'var(--font-body)', color: 'var(--slate)', fontSize: 15,
    }}>
      Signing you in…
    </div>
  )
}
