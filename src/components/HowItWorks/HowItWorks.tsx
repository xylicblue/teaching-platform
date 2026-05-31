import './HowItWorks.css'

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works" aria-label="How it works">
      <div className="how-it-works__inner">
        <div className="how-it-works__layout">
          {/* Left — label column */}
          <aside className="how-it-works__aside">
            <p className="how-it-works__label">How it works</p>
          </aside>

          {/* Right — editorial narrative */}
          <div className="how-it-works__narrative">
            <div className="how-it-works__text">
              <p className="how-it-works__story how-it-works__story--dropcap">
                Hira's mother messaged us in September. Her daughter's CIE A-levels were eight
                months out and she was failing Physics mocks. We matched her with Mr. Hassan,
                who has tutored A-level Physics on the CAIE syllabus since 2015. They met for
                a free 30-minute demo class on a Sunday. By the end of the session, Hira asked
                her mother if they could book the next one.
              </p>
              <p className="how-it-works__story">
                In June, Hira sat 9702/22. She scored an A.
              </p>
            </div>

            <div className="how-it-works__divider" aria-hidden="true" />

            <p className="how-it-works__caption">
              This is what we do. You message us. We match you. You meet your tutor.
              You take it from there.
            </p>

            {/* Process steps — minimal, not numbered boxes */}
            <div className="how-it-works__steps">
              <div className="how-it-works__step">
                <span className="how-it-works__step-marker" aria-hidden="true">01</span>
                <div>
                  <p className="how-it-works__step-title">Browse and pick a tutor</p>
                  <p className="how-it-works__step-desc">Filter by subject, exam board, year, and availability. Read their profile and past student reviews.</p>
                </div>
              </div>
              <div className="how-it-works__step">
                <span className="how-it-works__step-marker" aria-hidden="true">02</span>
                <div>
                  <p className="how-it-works__step-title">Request a free demo class</p>
                  <p className="how-it-works__step-desc">30 minutes, no commitment. The tutor confirms a slot. You meet on Google Meet.</p>
                </div>
              </div>
              <div className="how-it-works__step">
                <span className="how-it-works__step-marker" aria-hidden="true">03</span>
                <div>
                  <p className="how-it-works__step-title">Enroll and begin</p>
                  <p className="how-it-works__step-desc">Book sessions, share materials, receive assignments — all from your workspace on the platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
