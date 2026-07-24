import { Link } from 'react-router-dom'
import './ForParents.css'

const CLAIMS = [
  "Every tutor's ID and qualifications are verified before they teach a single session.",
  "All session recordings are stored in Google Drive and accessible to parents at any time.",
  "A full refund is available if you're unsatisfied after the first paid session.",
  "Our admin team monitors enrollments and can be reached directly for any concern.",
]

export default function ForParents() {
  return (
    <section className="for-parents" id="parents" aria-label="For parents">
      <div className="for-parents__inner">
        {/* Left */}
        <div className="for-parents__left">
          <p className="for-parents__eyebrow">For parents</p>
          <h2 className="for-parents__heading">A note for parents.</h2>
          <p className="for-parents__body">
            We know you're the one making this decision, and we take that seriously.
            Every tutor on our platform has submitted proof of identity and academic
            qualifications — reviewed and approved by our team before their first session.
            You can monitor session recordings, communicate directly with the tutor
            through your child's workspace, and raise any concern with us through
            a direct support line. If the first paid session doesn't meet your expectations,
            we refund it. No forms, no delays.
          </p>
          <Link to="/tutors" className="for-parents__link">
            Browse verified tutors
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Right — chits */}
        <div className="for-parents__right">
          {CLAIMS.map((claim, i) => (
            <div key={i} className="for-parents__chit">
              <p className="for-parents__chit-text">{claim}</p>
              <span className="for-parents__chit-rule" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
