import type { TutorProfile } from '../../../data/profileData'
import './ProfileFAQ.css'

type Props = { profile: TutorProfile }

export default function ProfileFAQ({ profile }: Props) {
  return (
    <section className="block">
      <h2 className="display">Frequently asked</h2>
      <div className="faq-list">
        {profile.faq.map((item, i) => (
          <details key={i} className="faq" open={i === 0}>
            <summary>
              {item.q}
              <span className="pm" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </summary>
            <div className="faq-body">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  )
}
