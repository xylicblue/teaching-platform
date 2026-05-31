import { useState } from 'react'
import { TUTORS, AVATAR_COLORS } from '../../data/tutors'
import './BookingWidget.css'

const STEPS = [
  { n:'01', title:'Browse and pick a tutor',    desc:'Filter by subject, exam board, year, and availability. Read reviews and credentials.' },
  { n:'02', title:'Request a free demo class',  desc:'30 minutes, no payment needed. The tutor confirms a slot — you meet on Google Meet.' },
  { n:'03', title:'Enroll and get to work',     desc:'Book sessions, share files, track progress, receive assignments — all in one workspace.' },
]

const SLOTS = [
  { time:'Mon 4pm',  avail:true  },
  { time:'Mon 6pm',  avail:true  },
  { time:'Tue 3pm',  avail:false },
  { time:'Tue 5pm',  avail:true  },
  { time:'Wed 4pm',  avail:true  },
  { time:'Wed 7pm',  avail:true  },
  { time:'Thu 5pm',  avail:false },
  { time:'Fri 4pm',  avail:true  },
]

const FEATURED = TUTORS[0] // Ayesha Khan for the demo card

export default function BookingWidget() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <section className="booking" id="book" aria-label="Book a demo class">
      <div className="wrap">
        <div className="booking-grid">

          {/* Left — evergreen copy */}
          <div className="booking-left">
            <p className="booking-eyebrow">Get started</p>
            <h2 className="display">Book your first session.</h2>
            <div className="b-steps">
              {STEPS.map(s => (
                <div key={s.n} className="b-step">
                  <span className="b-num mono">{s.n}</span>
                  <div>
                    <b>{s.title}</b>
                    <span>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — booking card */}
          <div className="book-card">
            {/* Tutor preview */}
            <div className="bc-top">
              <span
                className="av"
                style={{ width: 52, height: 52, fontSize: 18, background: AVATAR_COLORS[FEATURED.c] }}
                aria-hidden="true"
              >
                {FEATURED.i}
              </span>
              <div>
                <div className="bc-name display">{FEATURED.n}</div>
                <div className="bc-sub">{FEATURED.subj}</div>
                <span className="rating" style={{ marginTop: 4, display:'inline-flex' }}>
                  <span className="star">★</span> {FEATURED.r.toFixed(1)}
                  <span className="rc"> · {FEATURED.rev} reviews</span>
                </span>
              </div>
            </div>

            {/* Slots */}
            <p className="bc-label">Available this week</p>
            <div className="slots" role="group" aria-label="Available time slots">
              {SLOTS.map((s, i) => (
                <button
                  key={i}
                  className="slot"
                  aria-pressed={selected === i}
                  disabled={!s.avail}
                  onClick={() => setSelected(i)}
                  aria-label={s.avail ? `Select ${s.time}` : `${s.time} — unavailable`}
                >
                  {s.time}
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="bc-cta">
              <a href="/demo" className="btn btn-primary btn-lg btn-block">
                {selected !== null ? `Book demo — ${SLOTS[selected].time}` : 'Book free demo'}
              </a>
            </div>
            <p className="bc-note">30-min demo · No payment needed · Cancel any time</p>
          </div>
        </div>
      </div>
    </section>
  )
}
