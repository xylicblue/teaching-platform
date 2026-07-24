import { Link } from 'react-router-dom'
import { useCatalog } from '../../../hooks/useCatalog'
import { colorIndexFromName, initialsOf, fmtPrice } from '../../../lib/catalog'

const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12.5 11 15.5 16 9"/><circle cx="12" cy="12" r="9.2"/></svg>,
    title: 'Verified tutors only',
    text: "Every tutor's ID and qualifications are checked before they teach.",
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4"/></svg>,
    title: 'Lessons on Google Meet',
    text: 'Every session is recorded to your own Google Drive to revisit anytime.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
    title: 'No commitment',
    text: 'Start with a free 30-minute demo. Only continue if it feels right.',
  },
]

const FCARD_POS = ['fc-1', 'fc-2', 'fc-3']

export default function EmptyView() {
  const { teachers, courses } = useCatalog()

  /* Three real courses for the floating cards. */
  const cards = courses.slice(0, 3).map(c => {
    const teacher = teachers.find(t => t.id === c.teacher_id)
    const name = teacher?.name ?? 'Teacher'
    return {
      key:      c.id,
      courseId: c.id,
      initials: teacher?.initials ?? initialsOf(name, null),
      color:    colorIndexFromName(name),
      name,
      sub:      `${c.level} ${c.subject}`,
      price:    `${fmtPrice(c.rate_per_hour, c.currency)}/hr`,
      board:    c.exam_board !== 'N/A' ? c.exam_board : c.level,
    }
  })

  return (
    <div className="empty-wrap">
      <div className="empty-hero">
        <div className="eh-left">
          <span className="eh-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5z"/></svg>
            Your first lesson is free
          </span>
          <h2>Book your first lesson</h2>
          <p>Explore expert tutors and schedule a free demo session to begin. No payment needed to start.</p>
          <div className="eh-cta">
            <Link className="btn btn-primary btn-lg" to="/tutors">Browse tutors</Link>
            <Link className="btn btn-outline btn-lg" to="/#how">How it works</Link>
          </div>
          <div className="eh-steps">
            <span className="eh-step"><span className="n">1</span>Pick a tutor</span>
            <span className="eh-step"><span className="n">2</span>Book a free demo</span>
            <span className="eh-step"><span className="n">3</span>Meet on Google Meet</span>
          </div>
        </div>

        <div className="eh-art">
          <div className="art-grain" />
          <svg className="spark" style={{ top: 30, right: '46%' }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>
          <svg className="spark" style={{ bottom: 40, right: '38%' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
          {cards.map((t, i) => (
            <div className={`fcard ${FCARD_POS[i]}`} key={t.key}>
              <div className="fc-head">
                <span className={`av av-c${t.color}`} aria-hidden="true">{t.initials}</span>
                <div>
                  <div className="fc-name">{t.name}</div>
                  <div className="fc-sub">{t.sub}</div>
                </div>
              </div>
              <div className="fc-rate">
                <span>{t.board}</span>
                <span className="price">{t.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="empty-mini-grid">
        {FEATURES.map((f, i) => (
          <div className="empty-mini" key={i}>
            <div className="em-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
