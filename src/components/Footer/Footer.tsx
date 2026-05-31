import './Footer.css'

const SUBJECTS = [
  'Accounting', 'Arabic', 'Biology', 'Business Studies',
  'Chemistry', 'Computer Science', 'Economics', 'English',
  'Further Mathematics', 'Geography', 'History', 'Law',
  'Mathematics', 'Physics', 'Psychology', 'Sociology', 'Urdu',
]

const BOARDS = [
  { name: 'CAIE', desc: 'Cambridge Assessment' },
  { name: 'Edexcel', desc: 'Pearson Edexcel' },
  { name: 'AQA', desc: 'AQA A-levels' },
  { name: 'OCR', desc: 'OCR A-levels' },
  { name: 'IB', desc: 'International Baccalaureate' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* 4-column grid */}
        <div className="footer__grid">
          {/* Subjects */}
          <div className="footer__col">
            <h3 className="footer__col-heading">Subjects</h3>
            <ul className="footer__list">
              {SUBJECTS.map((s) => (
                <li key={s}>
                  <a href={`/tutors?subject=${encodeURIComponent(s)}`} className="footer__link">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Exam boards */}
          <div className="footer__col">
            <h3 className="footer__col-heading">Exam Boards</h3>
            <ul className="footer__list">
              {BOARDS.map((b) => (
                <li key={b.name}>
                  <a href={`/tutors?board=${encodeURIComponent(b.name)}`} className="footer__link">
                    {b.name}
                    <span className="footer__link-sub">{b.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For students & parents */}
          <div className="footer__col">
            <h3 className="footer__col-heading">For Students & Parents</h3>
            <ul className="footer__list">
              {['How it works', 'Pricing', 'Safety & safeguarding', 'FAQs', 'Refund policy', 'Student reviews', 'Demo class'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} className="footer__link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="footer__col">
            <h3 className="footer__col-heading">Company</h3>
            <ul className="footer__list">
              {['About us', 'Apply to teach', 'Careers', 'Press', 'Contact', 'Blog'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="footer__link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-rule" aria-hidden="true" />
          <div className="footer__bottom-row">
            <a href="/" className="footer__wordmark" aria-label="Ilm — home">Ilm</a>
            <p className="footer__tagline">Made in Lahore. Built for South Asian students.</p>
            <div className="footer__bottom-right">
              <div className="footer__lang-switcher">
                <button className="footer__lang footer__lang--active">English</button>
                <span className="footer__lang-sep" aria-hidden="true">|</span>
                <button className="footer__lang">اردو</button>
              </div>
            </div>
          </div>
          <p className="footer__copyright">
            © {new Date().getFullYear()} Ilm Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
