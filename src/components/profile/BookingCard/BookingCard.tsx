import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { TutorProfile } from '../../../data/profileData'
import './BookingCard.css'

const DOW = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

type Props = { profile: TutorProfile }

export default function BookingCard({ profile }: Props) {
  const today = new Date()
  const [selDay,  setSelDay]  = useState(0)
  const [selTime, setSelTime] = useState<string | null>(
    profile.availability[0].times[0] ?? null
  )

  function dayDate(offset: number) {
    const d = new Date(today.getTime() + offset * 86400000)
    return d.getDate()
  }

  function dayLabel(offset: number) {
    if (offset === 0) return 'Today'
    if (offset === 1) return 'Tomorrow'
    const d = new Date(today.getTime() + offset * 86400000)
    return DOW[(d.getDay() + 6) % 7] // Mon-indexed
  }

  const confirmLabel = selTime
    ? `Book free demo — ${dayLabel(selDay)} ${selTime}`
    : 'Book free demo'

  /* subjects[] are the teacher's live courses; the first is the default booking. */
  const bookableCourseId = profile.subjects.find(s => s.id)?.id ?? null

  return (
    <div className="bookcard" id="book">
      {/* Price + demo banner */}
      <div className="bookcard-head">
        <div className="bc-price">
          <b className="display">Rs {profile.price.toLocaleString()}</b>
          <span className="per">/ hour</span>
          {profile.subjects[0] && <span className="from">{profile.subjects[0].code}</span>}
        </div>
        <div className="bc-demo">
          <span className="pin" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3v18l7-5 7 5V3z" />
            </svg>
          </span>
          <div>
            <b>First class is free</b>
            <span>30-minute demo · no commitment</span>
          </div>
        </div>
      </div>

      {/* Availability calendar */}
      <div className="bc-avail">
        <div className="avail-head">
          <span className="lbl">Availability</span>
          {profile.online && (
            <span className="today-tag">
              <span className="dot-live anim" aria-hidden="true" />
              Available today
            </span>
          )}
        </div>

        {/* Week grid */}
        <div className="cal" role="group" aria-label="Select a day">
          {DOW.map(d => <div key={d} className="dow" aria-hidden="true">{d}</div>)}
          {profile.availability.map((day, i) => (
            <button
              key={i}
              className={[
                'day',
                day.has ? 'has' : 'none',
                i === 0 ? 'is-today' : '',
                i === selDay ? 'sel' : '',
              ].filter(Boolean).join(' ')}
              disabled={!day.has}
              aria-pressed={i === selDay}
              aria-label={`${dayLabel(i)}, ${day.has ? `${day.times.length} slots available` : 'unavailable'}`}
              onClick={() => {
                setSelDay(i)
                setSelTime(day.times[0] ?? null)
              }}
            >
              {dayDate(i)}
              {day.has && <span className="availdot" aria-hidden="true" />}
            </button>
          ))}
        </div>

        {/* Time slots */}
        {profile.availability[selDay].times.length > 0 && (
          <div className="avail-times" role="group" aria-label="Select a time">
            {profile.availability[selDay].times.map(t => (
              <button
                key={t}
                className="tslot"
                aria-pressed={selTime === t}
                onClick={() => setSelTime(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="bookcard-foot">
        {bookableCourseId ? (
          <Link className="btn btn-primary btn-block btn-lg" to={`/courses/${bookableCourseId}/demo`}>
            {confirmLabel}
          </Link>
        ) : (
          <span className="btn btn-primary btn-block btn-lg" aria-disabled="true" style={{ opacity: .5 }}>
            No courses open yet
          </span>
        )}
        <div className="bc-trustnote">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          No payment required to request a demo.
        </div>
        <div className="bc-meta-row">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            Replies in {profile.responseTime}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 12.5 11 15.5 16 9" />
            </svg>
            Verified tutor
          </span>
        </div>
      </div>

      {/* Social proof nudge — only when we have something real to say */}
      {profile.watching && (
        <div className="watching">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {profile.watching}
        </div>
      )}
    </div>
  )
}
