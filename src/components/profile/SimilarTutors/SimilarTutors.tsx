import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AVATAR_COLORS } from '../../../data/profileData'
import type { TutorProfile } from '../../../data/profileData'
import './SimilarTutors.css'

type Props = { profile: TutorProfile }

export default function SimilarTutors({ profile }: Props) {
  return (
    <section className="similar sec-sm" aria-label="Similar tutors">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Students also viewed</span>
            <h2 className="display">Compare similar tutors.</h2>
          </div>
          <Link className="tlink" to="/tutors">
            See all tutors
            <span className="ar" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="similar-grid">
          {profile.similar.map(t => (
            <SimilarCard key={t.id} tutor={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SimilarCard({ tutor }: { tutor: TutorProfile['similar'][0] }) {
  const [saved, setSaved] = useState(false)
  const urgent = tutor.slots <= 2

  return (
    <article className="tcard">
      <div className="tcard-media">
        <span
          className="av-lg"
          style={{ background: AVATAR_COLORS[tutor.c] }}
          aria-hidden="true"
        >
          {tutor.i}
        </span>
        {tutor.online && (
          <span className="badge-online">
            <span className="dot-live anim" aria-hidden="true" />
            Online now
          </span>
        )}
        <button className="fav" aria-label={saved ? 'Unsave' : 'Save tutor'} onClick={() => setSaved(s => !s)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#B0532A' : 'none'} stroke={saved ? '#B0532A' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5C2 13 7 16.5 12 21c2-1.8 4-3.5 5.5-5" />
          </svg>
        </button>
        <span className="price-chip mono">Rs {tutor.price.toLocaleString()}/hr</span>
      </div>

      <div className="tcard-body">
        <div className="tc-top">
          <div>
            <div className="tc-name display">{tutor.n}</div>
            <div className="tc-subj">{tutor.subj}</div>
          </div>
          <div className="tc-rating">
            <span className="rating"><span className="star">★</span>{tutor.r.toFixed(1)}</span>
            <span className="rc">{tutor.rev} reviews</span>
          </div>
        </div>
        <div className="tc-avail" style={{ marginTop: 12 }}>
          {urgent ? (
            <span className="urgent">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
              </svg>
              {tutor.slots} slots left
            </span>
          ) : (
            <span className="verified">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12.5 11 15.5 16 9"/>
              </svg>
              {tutor.slots} slots open
            </span>
          )}
        </div>
      </div>

      <div className="tcard-foot">
        <Link className="btn btn-outline btn-sm btn-block" to={`/tutors/${tutor.id}`}>
          View profile
        </Link>
      </div>
    </article>
  )
}
