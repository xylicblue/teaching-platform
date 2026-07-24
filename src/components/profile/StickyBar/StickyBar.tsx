import { useEffect, useState } from 'react'
import { AVATAR_COLORS } from '../../../lib/catalog'
import type { TutorProfile } from '../../../data/profileData'
import './StickyBar.css'

type Props = { profile: TutorProfile; heroRef: React.RefObject<HTMLDivElement | null> }

export default function StickyBar({ profile, heroRef }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setShow(!e.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [heroRef])

  return (
    <div className={`stickybar ${show ? 'show' : ''}`} aria-hidden={!show}>
      <div className="wrap stickybar-inner">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt=""
            aria-hidden="true"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <span
            className="av"
            style={{ width: 40, height: 40, fontSize: 14, background: AVATAR_COLORS[profile.colorIndex] }}
            aria-hidden="true"
          >
            {profile.initials}
          </span>
        )}
        <div>
          <div className="sb-name">{profile.name}</div>
          <div className="sb-meta">
            {profile.rating > 0 && (
              <>
                <span className="rating"><span className="star">★</span>{profile.rating.toFixed(1)}</span>
                <span>·</span>
                <span>{profile.reviews} reviews</span>
                <span>·</span>
              </>
            )}
            <span className="verified" style={{ fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
              </svg>
              Verified
            </span>
          </div>
        </div>
        <div className="sb-right">
          <div className="sb-price">
            Rs {profile.price.toLocaleString()}
            <span>per hour</span>
          </div>
          <a className="btn btn-primary" href="#book">Book free demo</a>
        </div>
      </div>
    </div>
  )
}
