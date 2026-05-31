import { useState } from 'react'
import { TUTORS, AVATAR_COLORS } from '../../data/tutors'
import './FeaturedTutors.css'

const GROUPS = ['All', 'Sciences', 'Mathematics', 'Commerce', 'Humanities']

function TCard({ t }: { t: typeof TUTORS[0] }) {
  const [saved, setSaved] = useState(false)
  const urgent = t.slots <= 2

  return (
    <article className="tcard">
      <div className="tcard-media">
        <span
          className="av-lg"
          style={{ background: AVATAR_COLORS[t.c] }}
          aria-hidden="true"
        >
          {t.i}
        </span>
        {t.online && (
          <span className="badge-online">
            <span className="dot-live anim" aria-hidden="true" />
            Online now
          </span>
        )}
        <button
          className="fav"
          aria-label={saved ? 'Unsave tutor' : 'Save tutor'}
          onClick={() => setSaved(s => !s)}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#B0532A' : 'none'} stroke={saved ? '#B0532A' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5C2 13 7 16.5 12 21c2-1.8 4-3.5 5.5-5" />
          </svg>
        </button>
        <span className="price-chip mono">Rs {t.price.toLocaleString()}/hr</span>
      </div>

      <div className="tcard-body">
        <div className="tc-top">
          <div>
            <div className="tc-name display">{t.n}</div>
            <div className="tc-subj">{t.subj}</div>
          </div>
          <div className="tc-rating">
            <span className="rating">
              <span className="star">★</span>{t.r.toFixed(1)}
            </span>
            <span className="rc">{t.rev} reviews</span>
          </div>
        </div>

        <div className="tc-cred">
          <b>{t.board} specialist.</b> {t.cred}
        </div>

        <div className="tc-avail">
          {urgent ? (
            <span className="urgent">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
              Only {t.slots} slots left this week
            </span>
          ) : (
            <span className="verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
              </svg>
              {t.slots} slots open this week
            </span>
          )}
        </div>
      </div>

      <div className="tcard-foot">
        <a className="btn btn-primary btn-sm" href="/demo">Book free demo</a>
        <span className="resp">Replies in {t.resp}</span>
      </div>
    </article>
  )
}

export default function FeaturedTutors() {
  const [group, setGroup] = useState('All')

  const list = group === 'All' ? TUTORS : TUTORS.filter(t => t.g === group)

  return (
    <section className="featured" id="featured" aria-label="Browse tutors">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Our tutors</p>
            <h2 className="display">
              {group === 'All' ? 'Find your tutor.' : `${group} tutors.`}
            </h2>
            <p>Verified credentials. Real exam experience. Available this week.</p>
          </div>
          <a href="/tutors" className="tlink">
            Browse all 247
            <svg className="ar" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Filter tabs */}
        <div className="filters" role="group" aria-label="Filter by subject group">
          {GROUPS.map(g => (
            <button
              key={g}
              className="filter"
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Tutor grid */}
        <div className="tutor-grid">
          {list.slice(0, 12).map((t) => (
            <TCard key={t.n} t={t} />
          ))}
        </div>

        {list.length > 12 && (
          <div className="featured-more">
            <a href="/tutors" className="btn btn-outline">
              See all {list.length} tutors
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
