import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { StudentDashboard } from '../../../hooks/useStudentDashboard'

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

/** "in 2 hours" / "in 35 minutes" / "tomorrow" */
function countdown(at: Date): string {
  const mins = Math.round((at.getTime() - Date.now()) / 60000)
  if (mins <= 0)   return 'now'
  if (mins < 60)   return `in ${mins} minute${mins === 1 ? '' : 's'}`
  const hrs = Math.round(mins / 60)
  if (hrs < 24)    return `in ${hrs} hour${hrs === 1 ? '' : 's'}`
  const days = Math.round(hrs / 24)
  return days === 1 ? 'tomorrow' : `in ${days} days`
}

export default function PopulatedView({ data }: { data: StudentDashboard }) {
  const [joining, setJoining] = useState(false)
  const { sessions, nextSession, tutors, notifications, recommendation, tutorCount } = data

  function handleJoin(link: string | null) {
    if (joining) return
    if (link) { window.open(link, '_blank', 'noopener'); return }
    setJoining(true)
    setTimeout(() => setJoining(false), 1200)
  }

  return (
    <div className="dash-grid">
      {/* LEFT COLUMN */}
      <div className="col-stack">

        {/* Upcoming sessions */}
        <section>
          <div className="dsec-head">
            <h2>Upcoming sessions</h2>
            <Link className="h-link" to="/tutors">Find more <Arrow /></Link>
          </div>
          <div className="card">
            {nextSession?.at && (
              <div className="next-banner">
                <span className="nb-dot" />
                <span className="nb-text">
                  <b>
                    Your next {nextSession.status === 'demo' ? 'demo class' : 'lesson'} starts{' '}
                    {countdown(nextSession.at)}.
                  </b>{' '}
                  <span className="muted">{nextSession.subject} with {nextSession.name}.</span>
                </span>
                <button
                  className="btn btn-saffron btn-sm"
                  onClick={() => handleJoin(nextSession.meetLink)}
                  disabled={joining}
                >
                  {nextSession.meetLink
                    ? 'Join lesson'
                    : joining ? 'Link not ready' : 'Link pending'}
                </button>
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="session">
                <div className="se-main">
                  <div className="se-name">No sessions scheduled</div>
                  <div className="se-subj">
                    Book a free demo class and your weekly schedule will appear here.
                  </div>
                </div>
              </div>
            ) : (
              sessions.map(s => (
                <div className="session" key={s.key}>
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
              ))
            )}

            <div className="session-foot">
              <Link className="btn btn-outline btn-sm" to="/tutors">Browse tutors</Link>
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
            {tutors.map(t => (
              <article className="tmini" key={t.id}>
                <div className="tmini-top">
                  <span className={`av av-c${t.color}`} aria-hidden="true">{t.initials}</span>
                  <div>
                    <div className="tm-name">{t.name}</div>
                    <div className="tm-subj">{t.subject}</div>
                  </div>
                </div>
                <p className="tm-desc">{t.desc}</p>
                <div className="tmini-foot">
                  <Link className="btn btn-outline btn-sm" to={`/tutors/${t.id}`}>Profile</Link>
                  <Link className="btn btn-primary btn-sm" to={`/courses/${t.courseId}`}>Course</Link>
                </div>
              </article>
            ))}
            <Link className="tmini tmini-add" to="/tutors">
              <span className="tmini-add-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
              <b>Find a new tutor</b>
              <span>
                {tutorCount > 0
                  ? `Browse ${tutorCount} verified ${tutorCount === 1 ? 'specialist' : 'specialists'}`
                  : 'Browse verified specialists'}
              </span>
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
            <Link className="qa" to="/tutors">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg></span>
              Book a demo lesson
            </Link>
            <Link className="qa" to="/">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg></span>
              How Ustaad works
            </Link>
            <Link className="qa" to="/apply">
              <span className="qi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg></span>
              Teach on Ustaad
            </Link>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <div className="col-stack">
        {/* Activity — real notification rows */}
        {notifications.length > 0 && (
          <div className="widget">
            <h3>Recent activity</h3>
            {notifications.map(n => {
              const inner = (
                <>
                  <span className={`av av-c${n.color}`} aria-hidden="true">{n.initials}</span>
                  <div className="m-main">
                    <div className="m-top">
                      <span className="m-name">{n.name}</span>
                      <span className="m-time">{n.time}</span>
                    </div>
                    <div className="m-text">{n.text}</div>
                  </div>
                </>
              )
              return n.url
                ? <Link className={`msg${n.unread ? ' unread' : ''}`} to={n.url} key={n.id}>{inner}</Link>
                : <div className={`msg${n.unread ? ' unread' : ''}`} key={n.id}>{inner}</div>
            })}
          </div>
        )}

        {/* Recommended — a real course they haven't touched */}
        {recommendation && (
          <div className="widget">
            <h3>Recommended for you</h3>
            <div className="rec">
              <span className={`av av-c${recommendation.color}`} aria-hidden="true">{recommendation.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="rec-name">{recommendation.name}</div>
                <div className="rec-sub">{recommendation.sub}</div>
                <div className="rec-rating">{recommendation.meta}</div>
              </div>
            </div>
            <Link
              className="btn btn-outline btn-sm btn-block"
              to={`/courses/${recommendation.courseId}`}
              style={{ marginTop: 14 }}
            >
              View course
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
