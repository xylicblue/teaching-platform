import { AVATAR_COLORS } from '../../../data/profileData'
import type { TutorProfile } from '../../../data/profileData'
import './ProfileHero.css'

const CHECK_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
  </svg>
)

type Props = { profile: TutorProfile }

export default function ProfileHero({ profile }: Props) {
  return (
    <section className="phero block" id="phero">
      {/* Photo / avatar */}
      <div className="phero-photo">
        {profile.online && (
          <span className="live-pin">
            <span className="dot-live" aria-hidden="true" />
            Online now
          </span>
        )}
        <span
          className="av-lg phero-av"
          style={{ background: AVATAR_COLORS[profile.colorIndex] }}
          aria-label={`${profile.name} avatar`}
        >
          {profile.initials}
        </span>
        <div className="vbadge">
          {CHECK_ICON}
          Verified Tutor
        </div>
      </div>

      {/* Info */}
      <div className="phero-main">
        <h1 className="name display">{profile.name}</h1>
        <div className="headline">{profile.headline}</div>
        <div className="loc">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {profile.location} · Teaches online · Speaks {profile.languages.join(', ')}
        </div>

        {/* Stat row */}
        <div className="pstats">
          <div className="pstat">
            <b><span className="star">★</span>{profile.rating.toFixed(1)}</b>
            <span>{profile.reviews} reviews</span>
          </div>
          <div className="pstat">
            <b>{profile.lessons.toLocaleString()}</b>
            <span>lessons taught</span>
          </div>
          <div className="pstat">
            <b className="ok">{profile.responseTime}</b>
            <span>response time</span>
          </div>
          <div className="pstat">
            <b>{profile.yearsExp} yrs</b>
            <span>teaching since {new Date().getFullYear() - profile.yearsExp}</span>
          </div>
        </div>

        {/* Trust pills */}
        <div className="trust-row">
          {profile.trustBadges.map(badge => (
            <span key={badge} className="trust-pill">
              {CHECK_ICON}
              {badge}
            </span>
          ))}
        </div>

        {/* Intro quote */}
        <p className="phero-quote">&ldquo;{profile.quote}&rdquo;</p>
      </div>
    </section>
  )
}
