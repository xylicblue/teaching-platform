import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SignInForm    from '../../components/auth/SignInForm/SignInForm'
import SignUpForm    from '../../components/auth/SignUpForm/SignUpForm'
import RoleSelection from '../../components/auth/RoleSelection/RoleSelection'
import SuccessScreen from '../../components/auth/SuccessScreen/SuccessScreen'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCatalog } from '../../hooks/useCatalog'
import { AVATAR_COLORS, catalogStats } from '../../lib/catalog'
import './AuthPage.css'

type View = 'signin' | 'signup' | 'role'
type SuccessState = { name: string; role?: string; isSignIn: boolean }

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams]  = useSearchParams()
  const redirectAfterAuth = searchParams.get('redirect') ?? undefined
  const [view,    setView]    = useState<View>('signin')
  const [success, setSuccess] = useState<SuccessState | null>(null)

  const { teachers, courses } = useCatalog()
  const stats = catalogStats({ teachers, courses })

  // Redirect already-authenticated users
  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(redirectAfterAuth ?? '/dashboard', { replace: true })
    })
  }, [navigate, redirectAfterAuth])

  const showPanel = view !== 'role'

  return (
    <>
      <div className="auth-wrap">
        <div className={`auth-body${showPanel ? ' auth-body--split' : ' auth-body--center'}`}>

          {/* ── Editorial sidebar ── */}
          {showPanel && (
            <aside className="auth-editorial">
              <div className="ae-brand">
                <Link className="ae-wordmark display" to="/">Ustaad</Link>
                <Link className="ae-back" to="/tutors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Browse tutors
                </Link>
              </div>

              <div className="ae-content">
                <span className="ae-eyebrow">O &amp; A Level tutoring</span>
                <h2 className="ae-headline display">
                  The right teacher<br />changes <em>everything.</em>
                </h2>
                <p className="ae-blurb">
                  Verified O &amp; A level tutors, matched to your exact syllabus and exam board.
                </p>
                <div className="ae-rule" aria-hidden="true" />
                <div className="ae-stats">
                  <div className="ae-stat">
                    <b>{stats.tutors}</b>
                    <span>verified {stats.tutors === 1 ? 'tutor' : 'tutors'}</span>
                  </div>
                  <div className="ae-stat">
                    <b>{stats.courses}</b>
                    <span>{stats.courses === 1 ? 'course' : 'courses'}</span>
                  </div>
                  <div className="ae-stat">
                    <b>Free</b>
                    <span>first demo class</span>
                  </div>
                </div>
              </div>

              {teachers.length > 0 && (
                <div className="ae-foot">
                  <div className="ae-av-row" aria-hidden="true">
                    {teachers.slice(0, 5).map(t => (
                      t.avatarUrl
                        ? <img key={t.id} className="ae-av" src={t.avatarUrl} alt="" style={{ objectFit: 'cover' }} />
                        : <span key={t.id} className="ae-av" style={{ background: AVATAR_COLORS[t.colorIndex] }}>{t.initials}</span>
                    ))}
                  </div>
                  <span className="ae-av-label">
                    <b>{stats.tutors} verified {stats.tutors === 1 ? 'tutor' : 'tutors'}</b> teaching right now
                  </span>
                </div>
              )}
            </aside>
          )}

          {/* ── Form column ── */}
          <div className="auth-form-col">
            {!showPanel && (
              <Link className="ae-wordmark display auth-role-mark" to="/">Ustaad</Link>
            )}

            <div className="auth-form-card">
              {view === 'signin' && (
                <SignInForm
                  onSwitch={() => setView('signup')}
                  onSuccess={name => setSuccess({ name, isSignIn: true })}
                />
              )}
              {view === 'signup' && (
                <SignUpForm
                  onSwitch={() => setView('signin')}
                  onToRole={() => setView('role')}
                />
              )}
              {view === 'role' && (
                <RoleSelection
                  onSuccess={(name, role) => setSuccess({ name, role, isSignIn: false })}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {success && (
        <SuccessScreen
          name={success.name}
          role={success.role}
          isSignIn={success.isSignIn}
          redirectTo={redirectAfterAuth}
        />
      )}
    </>
  )
}
