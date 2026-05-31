import './ForTeachers.css'

export default function ForTeachers() {
  return (
    <section className="for-teachers" id="teachers" aria-label="For teachers">
      <div className="for-teachers__inner">
        <div className="for-teachers__left">
          <p className="for-teachers__eyebrow">For teachers</p>
          <h2 className="for-teachers__heading">Teach with us.</h2>
          <p className="for-teachers__body">
            We're looking for tutors who know their subject deeply, have experience
            with the CAIE, Edexcel, or AQA syllabi, and genuinely care about the
            students who sit in front of them. If that's you, we'd like to hear from you.
            We handle scheduling, payments, and the workspace. You focus on teaching.
          </p>
          <p className="for-teachers__commission">
            Competitive rates, weekly payouts via JazzCash, Easypaisa, or bank transfer.
          </p>
        </div>

        <div className="for-teachers__right">
          <a href="/apply" className="for-teachers__cta">
            Apply to teach
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="/tutors/standards" className="for-teachers__secondary-link">
            What we look for in a tutor →
          </a>
        </div>
      </div>
    </section>
  )
}
