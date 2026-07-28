import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'
import './Navbar.css'

function getDisplayName(user: User): string {
  return (
    user.user_metadata?.first_name ||
    user.user_metadata?.name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'You'
  )
}

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [user,       setUser]       = useState<User | null>(null)
  const [dropOpen,   setDropOpen]   = useState(false)
  const [appStatus,  setAppStatus]  = useState<string | null>(null)
  const [userRole,   setUserRole]   = useState<string | null>(null)
  const [query,      setQuery]      = useState('')
  const dropRef  = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Body scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch teacher application status whenever user changes.
  // Show cached value immediately so the dot doesn't flash away on remount.
  useEffect(() => {
    if (!user) {
      setAppStatus(null)
      setUserRole(null)
      sessionStorage.removeItem('_ust_app_status')
      sessionStorage.removeItem('_ust_role_v2')
      return
    }
    const cached = sessionStorage.getItem('_ust_app_status')
    if (cached) setAppStatus(cached)
    const cachedRole = sessionStorage.getItem('_ust_role_v2')
    if (cachedRole) setUserRole(cachedRole)

    supabase
      .from('teacher_applications')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const s = data?.status ?? null
        setAppStatus(s)
        if (s) sessionStorage.setItem('_ust_app_status', s)
        else   sessionStorage.removeItem('_ust_app_status')
      })

    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const r = data?.role ?? null
        setUserRole(r)
        if (r) sessionStorage.setItem('_ust_role_v2', r)
        else   sessionStorage.removeItem('_ust_role_v2')
      })
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropOpen) return
    function onOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [dropOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    sessionStorage.removeItem('_ust_app_status')
    sessionStorage.removeItem('_ust_role_v2')
    setDropOpen(false)
    setMenuOpen(false)
    window.location.href = '/'
  }

  // An admin approved as a teacher keeps role 'admin' but is still a teacher.
  // "Teacher" therefore means: role is teacher, OR an approved application.
  const isTeacher = userRole === 'teacher' || appStatus === 'approved'
  const displayName = user ? getDisplayName(user) : null
  const avatarUrl   = user?.user_metadata?.avatar_url as string | undefined

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <Link to="/" className="navbar__wordmark" aria-label="Ustaad — home">Ustaad</Link>

          <form
            className="navbar__search"
            role="search"
            onSubmit={e => {
              e.preventDefault()
              const q = query.trim()
              navigate(q ? `/tutors?subject=${encodeURIComponent(q)}` : '/tutors')
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11.5 11.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search by subject, tutor, or exam board…"
              aria-label="Search tutors"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </form>

          <nav className="navbar__nav" aria-label="Main navigation">
            <Link to="/tutors"          className="navbar__nav-link">Browse</Link>
            <Link to="/#how-it-works"   className="navbar__nav-link">How it works</Link>
            <Link to="/#parents"        className="navbar__nav-link">For parents</Link>
            <Link to="/apply"           className="navbar__nav-link">Teach with us</Link>
          </nav>

          <div className="navbar__actions">
            {user ? (
              /* ── Logged-in user chip ── */
              <div className="navbar__user" ref={dropRef}>
                <button
                  className="navbar__user-chip"
                  onClick={() => setDropOpen(s => !s)}
                  aria-expanded={dropOpen}
                  aria-haspopup="menu"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="navbar__av" />
                  ) : (
                    <span className="navbar__av navbar__av--initials" aria-hidden="true">
                      {displayName!.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="navbar__user-name">{displayName}</span>
                  {isTeacher ? (
                    <span className="navbar__verified-dot" title="Verified teacher" />
                  ) : appStatus === 'pending' ? (
                    <span className="navbar__pending-dot" title="Teaching application pending" />
                  ) : null}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`navbar__drop-caret${dropOpen ? ' open' : ''}`}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {dropOpen && (
                  <div className="navbar__dropdown" role="menu">
                    {userRole === 'admin' && (
                      <Link className="navbar__drop-item navbar__drop-item--admin" to="/admin" onClick={() => setDropOpen(false)} role="menuitem">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        Admin dashboard
                      </Link>
                    )}
                    <Link className="navbar__drop-item" to="/dashboard" onClick={() => setDropOpen(false)} role="menuitem">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                      My dashboard
                    </Link>
                    {isTeacher ? (
                      <div className="navbar__drop-item navbar__drop-item--status navbar__drop-item--verified" role="status">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>
                        {userRole === 'admin' ? 'Admin & teacher' : 'Verified teacher'}
                        <span className="navbar__drop-badge navbar__drop-badge--verified">Verified</span>
                      </div>
                    ) : appStatus === 'pending' ? (
                      <div className="navbar__drop-item navbar__drop-item--status" role="status">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Application pending
                        <span className="navbar__drop-badge">Under review</span>
                      </div>
                    ) : (
                      <Link className="navbar__drop-item" to="/apply" onClick={() => setDropOpen(false)} role="menuitem">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
                        Apply to teach
                      </Link>
                    )}
                    <div className="navbar__drop-sep" role="separator" />
                    <button className="navbar__drop-item navbar__drop-item--danger" onClick={handleSignOut} role="menuitem">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Logged-out actions ── */
              <>
                <Link to="/signin" className="navbar__signin">Sign in</Link>
                <Link to="/tutors" className="navbar__cta">Find a tutor</Link>
              </>
            )}
          </div>

          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      <div
        className={`navbar__mobile-overlay ${menuOpen ? 'navbar__mobile-overlay--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="navbar__mobile-header">
          <Link to="/" className="navbar__wordmark navbar__wordmark--dark" onClick={() => setMenuOpen(false)}>Ustaad</Link>
          <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="navbar__mobile-nav">
          {[
            ['Browse',        '/tutors'],
            ['How it works',  '/#how-it-works'],
            ['For parents',   '/#parents'],
            ['Teach with us', '/apply'],
          ].map(([label, to]) => (
            <Link key={label} to={to} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </nav>

        <div className="navbar__mobile-actions">
          {user ? (
            <>
              <div className="navbar__mobile-user">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="navbar__av navbar__av--lg" />
                ) : (
                  <span className="navbar__av navbar__av--initials navbar__av--lg" aria-hidden="true">
                    {displayName!.charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="navbar__mobile-user-name">{displayName}</div>
                  <div className="navbar__mobile-user-email">{user.email}</div>
                </div>
              </div>
              {userRole === 'admin' && (
                <Link to="/admin" className="navbar__cta navbar__cta--large navbar__cta--admin" onClick={() => setMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  Admin dashboard
                </Link>
              )}
              <Link to="/dashboard" className="navbar__cta navbar__cta--large" onClick={() => setMenuOpen(false)}>
                My dashboard
              </Link>
              {/* Already a teacher (incl. an admin who teaches) → no apply prompt */}
              {!isTeacher && appStatus !== 'pending' && (
                <Link to="/apply" className="navbar__mobile-signin" onClick={() => setMenuOpen(false)}>
                  Apply to teach →
                </Link>
              )}
              <button className="navbar__mobile-signout" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="navbar__mobile-signin" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/tutors" className="navbar__cta navbar__cta--large" onClick={() => setMenuOpen(false)}>Find a tutor</Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
