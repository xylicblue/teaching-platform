import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AVATAR_COLORS } from '../../../data/browseData'
import type { BrowseTutor } from '../../../data/browseData'
import './TutorRow.css'

type Props = { tutor: BrowseTutor; featured?: boolean }

export default function TutorRow({ tutor, featured = false }: Props) {
  const [saved, setSaved] = useState(false)

  const topTag = featured
    ? <span className="feat-tag">★ Featured</span>
    : tutor.online
      ? <span className="badge-online"><span className="dot-live anim" aria-hidden="true" />Online now</span>
      : null

  let availEl: React.ReactNode
  if (tutor.avail === 'today' && tutor.slots <= 2) {
    availEl = <span className="avail-line urgent"><span className="dot-live" aria-hidden="true" />Today · {tutor.slots} slot{tutor.slots > 1 ? 's' : ''} left</span>
  } else if (tutor.avail === 'today') {
    availEl = <span className="avail-line today"><span className="dot-live anim" aria-hidden="true" />Available today</span>
  } else {
    availEl = (
      <span className="avail-line week">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" />
        </svg>
        Available this week
      </span>
    )
  }

  return (
    <article className={`trow${featured ? ' featured' : ''}`}>
      {/* Media column */}
      <div className="trow-media">
        <span
          className="av-lg"
          style={{ background: AVATAR_COLORS[tutor.c] }}
          aria-hidden="true"
        >
          {tutor.i}
        </span>
        {topTag}
        <button
          className={`fav${saved ? ' on' : ''}`}
          aria-label={saved ? 'Unsave tutor' : 'Save tutor'}
          onClick={e => { e.preventDefault(); setSaved(s => !s) }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#B0532A' : 'none'} stroke={saved ? '#B0532A' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5C2 13 7 16.5 12 21c2-1.8 4-3.5 5.5-5" />
          </svg>
        </button>
      </div>

      {/* Body column */}
      <div className="trow-body">
        <div className="tb-head-line">
          <h3 className="tb-name display">{tutor.h}</h3>
        </div>
        <div className="tb-spec">{tutor.spec}</div>

        <div className="tb-cred">
          <span className="tb-credchip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
            </svg>
            {tutor.cred}
          </span>
          {tutor.examiner && (
            <span className="tb-credchip examiner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12.5 11 15.5 16 9" />
              </svg>
              {tutor.boards[0]} Examiner
            </span>
          )}
        </div>

        <p className="tb-quote">&ldquo;{tutor.quote}&rdquo;</p>

        <div className="tb-stats">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {tutor.lessons.toLocaleString()} lessons
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            Replies in &lt; 1 hr
          </span>
          <span>{tutor.langs.join(', ')}</span>
        </div>

        <div className="tb-subjects">
          {tutor.subjects.map(s => (
            <span key={s} className="tb-subj">{s}</span>
          ))}
        </div>
      </div>

      {/* CTA rail */}
      <div className="trow-cta">
        <div className="rating-big">
          <span className="star" aria-hidden="true">★</span>
          <b className="display">{tutor.r.toFixed(1)}</b>
          <span className="rc">({tutor.rev})</span>
        </div>

        {availEl}

        <div className="price">
          <b className="display">Rs {tutor.price.toLocaleString()}</b>
          <span>/hr</span>
          <span className="demo">Free demo first</span>
        </div>

        <div className="cta-btns">
          <Link className="btn btn-primary btn-sm" to={`/tutors/${tutor.id}`}>View profile</Link>
          <Link className="btn btn-outline btn-sm" to={`/tutors/${tutor.id}#book`}>Book demo</Link>
        </div>
      </div>
    </article>
  )
}
