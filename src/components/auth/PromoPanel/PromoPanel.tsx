import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PromoPanel.css'

const CARDS = [
  {
    type: 'tutor' as const,
    tutor: {
      initials: 'HR', color: '#2E5A4A',
      name: 'Mr Hassan', sub: 'A-Level Physics · CAIE Examiner',
      rating: '5.0', reviews: '(128 reviews)',
      quote: 'I help students understand Physics instead of memorising it.',
      lessons: '1,240 lessons', price: 'Rs 3,000/hr',
    },
  },
  {
    type: 'review' as const,
    review: {
      stars: '★★★★★',
      text: 'My tutor helped me go from a C to an A in Physics. I finally understood what I was actually doing.',
      name: 'Hira A.', initials: 'HA', color: '#1F4A3D',
      sub: 'A-Level student · now at LUMS',
    },
  },
  {
    type: 'story' as const,
    story: {
      from: 'D', to: 'A',
      name: 'Daniyal R.', subject: 'A-Level Physics · 8 months',
      quote: 'I was failing mocks in September. By June, nothing on the paper surprised me.',
      tutor: 'Mr Hassan',
    },
  },
  {
    type: 'review' as const,
    review: {
      stars: '★★★★★',
      text: 'Booked a free demo on Sunday and enrolled the same evening. Total peace of mind as a parent.',
      name: 'Mrs. Khan', initials: 'MK', color: '#5C544A',
      sub: 'Parent · Lahore',
    },
  },
]

const PROMO_AVATARS = [
  { initials: 'AK', color: '#1F4A3D' },
  { initials: 'HR', color: '#2E5A4A' },
  { initials: 'FS', color: '#A8741C' },
  { initials: 'NM', color: '#3B6E54' },
]

export default function PromoPanel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setIdx(i => (i + 1) % CARDS.length), 4200)
    return () => clearInterval(timer)
  }, [])

  return (
    <aside className="promo" aria-label="Why students choose Ilm">
      <div className="promo-grain" aria-hidden="true" />

      <div className="promo-top">
        <Link className="wordmark promo-wordmark" to="/">Ilm</Link>
        <Link className="promo-back" to="/tutors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to browsing
        </Link>
      </div>

      <div className="promo-body">
        <span className="promo-eyebrow">Trusted by thousands of families</span>
        <h2 className="promo-head display">
          The right teacher changes <span className="it">everything.</span>
        </h2>

        {/* Rotating stage */}
        <div className="stage" aria-live="polite" aria-atomic="true">
          {CARDS.map((c, i) => (
            <div key={i} className={`pcard ${i === idx ? 'active' : ''}`} aria-hidden={i !== idx}>
              {c.type === 'tutor' && (
                <div className="pc-tutor">
                  <div className="pt-top">
                    <span className="av pt-av" style={{ background: c.tutor.color }} aria-hidden="true">
                      {c.tutor.initials}
                    </span>
                    <div>
                      <div className="pt-name display">{c.tutor.name}</div>
                      <div className="pt-sub">{c.tutor.sub}</div>
                      <span className="pt-rating">
                        <span className="star">★</span>{c.tutor.rating}
                        <span className="rc"> {c.tutor.reviews}</span>
                      </span>
                    </div>
                  </div>
                  <p className="pt-quote">&ldquo;{c.tutor.quote}&rdquo;</p>
                  <div className="pt-foot">
                    <span className="verified">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
                      </svg>
                      Verified · {c.tutor.lessons}
                    </span>
                    <span className="mono price">{c.tutor.price}</span>
                  </div>
                </div>
              )}
              {c.type === 'review' && (
                <div className="pc-review">
                  <div className="stars">{c.review.stars}</div>
                  <p className="rq display">&ldquo;{c.review.text}&rdquo;</p>
                  <div className="rw">
                    <span className="av rw-av" style={{ background: c.review.color }} aria-hidden="true">
                      {c.review.initials}
                    </span>
                    <div>
                      <div className="wn">{c.review.name}</div>
                      <div className="wt">{c.review.sub}</div>
                    </div>
                  </div>
                </div>
              )}
              {c.type === 'story' && (
                <div className="pc-story">
                  <div className="gj">
                    <span className="grade from">{c.story.from}</span>
                    <span className="arr" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                    <span className="grade to">{c.story.to}</span>
                    <div className="lbl">
                      <b>{c.story.name}</b>
                      {c.story.subject}
                    </div>
                  </div>
                  <p className="sq display">&ldquo;{c.story.quote}&rdquo;</p>
                  <p className="sw">Matched with <b>{c.story.tutor}</b> · verified outcome</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dot navigation */}
        <div className="promo-dots" role="tablist" aria-label="Navigate testimonials">
          {CARDS.map((_, i) => (
            <button
              key={i}
              className={i === idx ? 'on' : ''}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Show card ${i + 1}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="promo-stats">
          <div className="ps"><b className="display"><span className="star">★</span> 4.9</b><span>average rating</span></div>
          <div className="ps"><b className="display">600+</b><span>verified tutors</span></div>
          <div className="ps"><b className="display">12,000+</b><span>lessons delivered</span></div>
        </div>
      </div>

      {/* Footer */}
      <div className="promo-foot">
        <div className="av-row">
          {PROMO_AVATARS.map(a => (
            <span key={a.initials} className="av pf-av" style={{ background: a.color }} aria-hidden="true">
              {a.initials}
            </span>
          ))}
        </div>
        <span className="pf-text"><b>214 tutors</b> online right now · <b>85%</b> continue after their free demo</span>
      </div>
    </aside>
  )
}
