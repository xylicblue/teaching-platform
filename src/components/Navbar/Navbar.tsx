import { useState, useEffect } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <a href="/" className="navbar__wordmark" aria-label="Ilm — home">Ilm</a>

          <div className="navbar__search" role="search">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11.5 11.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input type="search" placeholder="Search by subject, tutor, or exam board…" aria-label="Search tutors" />
          </div>

          <nav className="navbar__nav" aria-label="Main navigation">
            <a href="#subjects" className="navbar__nav-link">Browse</a>
            <a href="#how-it-works" className="navbar__nav-link">How it works</a>
            <a href="#parents" className="navbar__nav-link">For Parents</a>
            <a href="#teachers" className="navbar__nav-link">Teach with us</a>
          </nav>

          <div className="navbar__actions">
            <a href="/signin" className="navbar__signin">Sign in</a>
            <a href="/tutors" className="navbar__cta">Find a tutor</a>
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

      <div
        className={`navbar__mobile-overlay ${menuOpen ? 'navbar__mobile-overlay--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="navbar__mobile-header">
          <a href="/" className="navbar__wordmark navbar__wordmark--dark">Ilm</a>
          <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="navbar__mobile-nav">
          {[['Browse','#subjects'],['How it works','#how-it-works'],['For Parents','#parents'],['Teach with us','#teachers']].map(([label, href]) => (
            <a key={label} href={href} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="navbar__mobile-actions">
          <a href="/signin" className="navbar__mobile-signin">Sign in</a>
          <a href="/tutors" className="navbar__cta navbar__cta--large">Find a tutor</a>
        </div>
      </div>
    </>
  )
}
