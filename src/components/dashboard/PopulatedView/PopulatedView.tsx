import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  SESSIONS, MINI_TUTORS, PROGRESS, MESSAGES, RECOMMENDED,
} from '../../../data/dashboardData'

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
)

function StatusBadge({ status, text }: { status: string; text: string }) {
  if (status === 'soon')
    return <span className="badge-status badge-soon"><span className="dot-live anim" />{text}</span>
  if (status === 'confirmed')
    return (
      <span className="badge-status badge-confirmed">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        {text}
      </span>
    )
  return <span className="badge-status badge-demo">{text}</span>
}

export default function PopulatedView() {
  const [joining, setJoining]   = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Animate progress bars on mount
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bars = trackRef.current?.querySelectorAll<HTMLElement>('.ptrack i')
    if (!bars) return
    bars.forEach(bar => { bar.style.width = '0' })
    const id = requestAnimationFrame(() => {
      setTimeout(() => {
        bars.forEach(bar => { bar.style.width = `${bar.dataset.w}%` })
      }, 60)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  function handleJoin() {
    if (joining) return
    setJoining(true)
    setTimeout(() => setJoining(false), 1600)
  }

  return (
    <div className="dash-grid">
      {/* LEFT COLUMN */}
      <div className="col-stack">

        {/* Upcoming sessions */}
        <section>
          <div className="dsec-head">
            <h2>Upcoming sessions</h2>
            <a className="h-link" href="#">View all <Arrow /></a>
          </div>
          <div className="card">
            <div className="next-banner">
              <span className="nb-dot" />
              <span className="nb-text">
                <b>Your next lesson starts in 2 hours.</b>{' '}
                <span className="muted">A-Level Physics with Mr Hassan.</span>
              </span>
              <button className="btn btn-saffron btn-sm" onClick={handleJoin} disabled={joining}>
                {joining ? 'Opening Meet…' : 'Join lesson'}
              </button>
            </div>

            {SESSIONS.map((s, i) => (
              <div className="session" key={i}>
                <span className={`av av-c${s.color}`} aria-hidden="true">{s.initials}</span>
                <div className="se-main">
                  <div className="se-name">{s.name}</div>
                  <div className="se-subj">{s.subject}</div>
                </div>
                <div className="se-when">
                  <div className="se-date">{s.date}</div>
                  <div className="se-time">{s.time}</div>
                </div>
                <StatusBadge status={s.status} text={s.statusText} />
              </div>
            ))}

            <div className="session-foot">
              <button className="btn btn-outline btn-sm">Reschedule</button>
              <a className="btn btn-outline btn-sm" href="#">Add to calendar</a>
            </div>
          </div>
        </section>

        {/* Your tutors */}
        <section>
          <div className="dsec-head">
            <h2>Your tutors</h2>
            <Link className="h-link" to="/tutors">Find more <Arrow /></Link>
          </div>
          <div className="tutor-mini-grid">
            {MINI_TUTORS.map((t, i) => (
              <article className="tmini" key={i}>
                <div className="tmini-top">
                  <span className={`av av-c${t.color}`} aria-hidden="true">{t.initials}</span>
                  <div>
                    <div className="tm-name">{t.name}</div>
                    <div className="tm-subj">{t.subject}</div>
                  </div>
                  <span className="tm-rating"><span className="star">★</span>{t.rating}</span>
                </div>
                <p className="tm-desc">{t.desc}</p>
                <div className="tmini-foot">
                  <a className="btn btn-outline btn-sm" href="#">Message</a>
                  <a className="btn btn-primary btn-sm" href="#">Book</a>
                </div>
              </article>
            ))}
            <Link className="tmini tmini-add" to="/tutors">
              <span className="tmini-add-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
              <b>Find a new tutor</b>
              <span>Browse 600+ verified specialists</span>
            </Link>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <div className="dsec-head"><h2>Quick actions</h2></div>
          <div className="qa-grid">
            <Link className="qa" to="/tutors">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>
              Browse tutors
            </Link>
            <a className="qa" href="#">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg></span>
              Book a demo lesson
            </a>
            <a className="qa" href="#">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
              Message a tutor
            </a>
            <a className="qa" href="#">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg></span>
              Update profile
            </a>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <div className="col-stack" ref={trackRef}>
        {/* Progress */}
        <div className="widget">
          <h3>Your progress</h3>
          {PROGRESS.map((p, i) => (
            <div className="progress-item" key={i}>
              <div className="pi-top"><b>{p.subject}</b><span className="pi-grade">{p.grade}</span></div>
              <div className="ptrack"><i className={p.saffron ? 'saff' : ''} data-w={p.width} /></div>
              <div className="pi-note">{p.note}</div>
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="widget">
          <h3>Messages <a className="h-link" href="#">Open inbox</a></h3>
          {MESSAGES.map((m, i) => (
            <div className={`msg${m.unread ? ' unread' : ''}`} key={i}>
              <span className={`av av-c${m.color}`} aria-hidden="true">{m.initials}</span>
              <div className="m-main">
                <div className="m-top"><span className="m-name">{m.name}</span><span className="m-time">{m.time}</span></div>
                <div className="m-text">{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended */}
        <div className="widget">
          <h3>Recommended for you</h3>
          <div className="rec">
            <span className={`av av-c${RECOMMENDED.color}`} aria-hidden="true">{RECOMMENDED.initials}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="rec-name">{RECOMMENDED.name}</div>
              <div className="rec-sub">{RECOMMENDED.sub}</div>
              <div className="rec-rating"><span className="star">★</span> {RECOMMENDED.rating}</div>
            </div>
          </div>
          <Link className="btn btn-outline btn-sm btn-block" to="/tutors" style={{ marginTop: 14 }}>View profile</Link>
        </div>
      </div>
    </div>
  )
}
