import React, { useState, useEffect, useRef } from 'react'
import type { TutorProfile, Credential } from '../../../data/profileData'
import './ProfileSections.css'

/* ── About ── */
export function ProfileAbout({ profile }: { profile: TutorProfile }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="block">
      <h2 className="display">About {profile.name}</h2>
      <div className="about-text">
        <p>{profile.aboutShort}</p>
        {expanded && <p>{profile.aboutLong}</p>}
      </div>
      <button className="readmore" onClick={() => setExpanded(e => !e)}>
        {expanded ? 'Show less' : `Read more about ${profile.name.split(' ')[0]}`}
      </button>
      <div className="about-grid">
        {profile.aboutFacts.map(f => (
          <div key={f.value} className="about-fact">
            <b className="display">{f.value}</b>
            <span>{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Subjects ── */
export function ProfileSubjects({ profile }: { profile: TutorProfile }) {
  return (
    <section className="block">
      <h2 className="display">Subjects taught</h2>
      <div className="subjects-grid">
        {profile.subjects.map(s => (
          <a key={s.code} className="subj-row" href="#book" aria-label={`${s.name}, Rs ${s.price.toLocaleString()} per hour`}>
            <span className="si mono">{s.code}</span>
            <div className="sr-main">
              <div className="sr-name display">{s.name}</div>
              <div className="sr-meta">
                <span className="rating" style={{ fontSize: 12 }}>
                  <span className="star">★</span>{s.rating.toFixed(1)}
                </span>
                <span>·</span>
                <span>{s.students.toLocaleString()} students</span>
              </div>
            </div>
            <div className="sr-price">
              <b className="mono">Rs {s.price.toLocaleString()}</b>
              <span>/hr</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ── Results ── */
export function ProfileResults({ profile }: { profile: TutorProfile }) {
  const ref = useRef<HTMLElement>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimated(true); io.disconnect() } },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="results block" ref={ref}>
      <span className="eyebrow" style={{ color: 'var(--saffron)' }}>Measured outcomes</span>
      <h2 className="display" style={{ marginTop: 8 }}>Results that show up on the certificate.</h2>
      <div className="results-grid">
        {profile.results.map(r => (
          <div key={r.value} className="result-stat">
            <b className="display">{r.value}</b>
            <div className="rs-bar">
              <i style={{ width: animated ? `${r.bar}%` : '0%' }} />
            </div>
            <span>{r.label}</span>
          </div>
        ))}
      </div>
      <div className="results-foot">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
        </svg>
        Outcomes self-reported by students and verified against uploaded results slips.
      </div>
    </section>
  )
}

/* ── Credentials ── */
const CRED_ICONS: Record<Credential['icon'], React.ReactElement> = {
  degree: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/></svg>,
  doc:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>,
  cert:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="m9 12-1 9 4-2 4 2-1-9"/></svg>,
  id:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h3M15 12h3M7 16h10"/></svg>,
}

const VCHECK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
  </svg>
)

export function ProfileCredentials({ profile }: { profile: TutorProfile }) {
  return (
    <section className="block">
      <h2 className="display">Verified credentials</h2>
      <div className="creds-grid">
        {profile.credentials.map(c => (
          <div key={c.title} className="cred">
            <span className="ci">{CRED_ICONS[c.icon]}</span>
            <div className="cc">
              <b>{c.title}</b>
              <span>{c.sub}</span>
            </div>
            <span className="vchk">{VCHECK}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
