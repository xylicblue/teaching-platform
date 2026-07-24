import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { sortLevels } from '../../lib/catalog'
import './Footer.css'

const BOARD_DESC: Record<string, string> = {
  CAIE:    'Cambridge Assessment',
  Edexcel: 'Pearson Edexcel',
  AQA:     'AQA',
  IB:      'International Baccalaureate',
  OCR:     'OCR',
}

export default function Footer() {
  const { courses } = useCatalog()

  /* Only link to filters that actually return tutors. */
  const subjects = Array.from(new Set(courses.map(c => c.subject))).sort()
  const boards   = Array.from(new Set(courses.map(c => c.exam_board))).filter(b => b !== 'N/A').sort()
  const levels   = sortLevels(Array.from(new Set(courses.map(c => c.level))))

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          {/* Subjects */}
          {subjects.length > 0 && (
            <div className="footer__col">
              <h3 className="footer__col-heading">Subjects</h3>
              <ul className="footer__list">
                {subjects.map(s => (
                  <li key={s}>
                    <Link to={`/tutors?subject=${encodeURIComponent(s)}`} className="footer__link">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exam boards */}
          {boards.length > 0 && (
            <div className="footer__col">
              <h3 className="footer__col-heading">Exam boards</h3>
              <ul className="footer__list">
                {boards.map(b => (
                  <li key={b}>
                    <Link to={`/tutors?board=${encodeURIComponent(b)}`} className="footer__link">
                      {b}
                      {BOARD_DESC[b] && <span className="footer__link-sub">{BOARD_DESC[b]}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Levels */}
          {levels.length > 0 && (
            <div className="footer__col">
              <h3 className="footer__col-heading">Levels</h3>
              <ul className="footer__list">
                {levels.map(l => (
                  <li key={l}>
                    <Link to={`/tutors?level=${encodeURIComponent(l)}`} className="footer__link">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ustaad */}
          <div className="footer__col">
            <h3 className="footer__col-heading">Ustaad</h3>
            <ul className="footer__list">
              <li><Link to="/tutors" className="footer__link">Browse all tutors</Link></li>
              <li><Link to="/#how-it-works" className="footer__link">How it works</Link></li>
              <li><Link to="/#parents" className="footer__link">For parents</Link></li>
              <li><Link to="/apply" className="footer__link">Apply to teach</Link></li>
              <li><Link to="/signin" className="footer__link">Sign in</Link></li>
              <li>
                <a href="mailto:hello@ustaad.pk" className="footer__link">
                  Contact
                  <span className="footer__link-sub">hello@ustaad.pk</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="footer__bottom-rule" aria-hidden="true" />
          <div className="footer__bottom-row">
            <Link to="/" className="footer__wordmark" aria-label="Ustaad — home">Ustaad</Link>
            <p className="footer__tagline">Made in Lahore. Built for South Asian students.</p>
          </div>
          <p className="footer__copyright">
            © {new Date().getFullYear()} Ustaad. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
