import { useState } from 'react'
import { AVATAR_COLORS } from '../../../data/profileData'
import type { TutorProfile, ReviewItem } from '../../../data/profileData'
import './ProfileReviews.css'

const FILTERS = [
  { label: 'Most recent',   key: 'recent'  },
  { label: 'Highest rated', key: 'rated'   },
  { label: 'A-Level',       key: 'A-Level' },
  { label: 'IGCSE',         key: 'IGCSE'   },
  { label: 'O-Level',       key: 'O-Level' },
]

const BARS = [5,4,3,2,1]
const BAR_PCTS = [91,7,2,0,0]

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('')
}

function isGradeJump(grade: string) {
  return grade.includes('→')
}

function applyFilter(list: ReviewItem[], filter: string): ReviewItem[] {
  const sorted = [...list]
  if (filter === 'recent') return sorted.sort((a, b) => a.recency - b.recency)
  if (filter === 'rated')  return sorted.sort((a, b) => b.r - a.r || a.recency - b.recency)
  return sorted.filter(r => r.lvl === filter)
}

type Props = { profile: TutorProfile }

export default function ProfileReviews({ profile }: Props) {
  const [filter, setFilter] = useState('recent')
  const shown = applyFilter(profile.reviewList, filter).slice(0, 6)

  return (
    <section className="block" id="reviews">
      <h2 className="display">What students &amp; parents say</h2>

      {/* Summary bar */}
      <div className="rev-summary">
        <div className="rev-score">
          <b className="display">{profile.rating.toFixed(1)}</b>
          <div className="stars">{stars(Math.round(profile.rating))}</div>
          <div className="cnt">{profile.reviews} reviews</div>
        </div>
        <div className="rev-bars">
          {BARS.map((n, i) => (
            <div key={n} className="rev-bar">
              <span className="lab">{n} ★</span>
              <span className="track"><i style={{ width: `${BAR_PCTS[i]}%` }} /></span>
              <span className="pct">{BAR_PCTS[i]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div className="rev-filters filters" role="group" aria-label="Filter reviews">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className="filter"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Review cards */}
      <div className="review-list">
        {shown.map((rv, i) => (
          <article key={i} className="rev-card">
            <div className="rc-top">
              <span
                className="av"
                style={{ width: 42, height: 42, fontSize: 14, background: AVATAR_COLORS[rv.c], borderRadius: '50%' }}
                aria-hidden="true"
              >
                {initials(rv.n)}
              </span>
              <div>
                <div className="rc-name">{rv.n}</div>
                <div className="rc-sub">{rv.sub}</div>
              </div>
              <div className="rc-date">{rv.date}</div>
            </div>

            <div className="rc-stars" aria-label={`${rv.r} out of 5 stars`}>{stars(rv.r)}</div>

            {isGradeJump(rv.grade) ? (
              <span className="rc-grade">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17 17 7"/><path d="M9 7h8v8"/>
                </svg>
                {rv.grade}
              </span>
            ) : (
              <span className="rc-grade">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 12.5 11 15.5 16 9"/>
                </svg>
                {rv.grade}
              </span>
            )}

            <p className="rc-text">{rv.t}</p>
          </article>
        ))}
      </div>

      <div className="reviews-more">
        <a className="btn btn-outline" href="/reviews">Read all {profile.reviews} reviews</a>
      </div>
    </section>
  )
}
