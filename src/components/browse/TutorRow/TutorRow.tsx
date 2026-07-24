import { Link } from 'react-router-dom'
import { AVATAR_COLORS, fmtPrice, fmtTime } from '../../../lib/catalog'
import type { CatalogTeacher } from '../../../lib/catalog'
import './TutorRow.css'

type Props = { tutor: CatalogTeacher; featured?: boolean }

/** "Mon · Wed at 5:30pm" across everything this teacher runs. */
function weeklyLabel(tutor: CatalogTeacher): string | null {
  const days = new Set<string>()
  const times = new Set<string>()
  for (const c of tutor.courses) {
    for (const d of c.days_of_week ?? []) days.add(d)
    const t = c.class_times?.all
    if (t) times.add(fmtTime(t))
    else for (const d of c.days_of_week ?? []) {
      const dt = c.class_times?.[d]
      if (dt) times.add(fmtTime(dt))
    }
  }
  if (days.size === 0) return null
  const order = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const dayPart = order.filter(d => days.has(d)).join(' · ')
  return times.size === 1 ? `${dayPart} at ${[...times][0]}` : dayPart
}

export default function TutorRow({ tutor, featured = false }: Props) {
  const schedule = weeklyLabel(tutor)
  const demoMin  = Math.min(...tutor.courses.map(c => c.demo_duration_min || 30))

  return (
    <article className={`trow${featured ? ' featured' : ''}`}>
      {/* Media column */}
      <div className="trow-media">
        {tutor.avatarUrl ? (
          <img src={tutor.avatarUrl} alt="" className="av-lg trow-av--img" />
        ) : (
          <span
            className="av-lg"
            style={{ background: AVATAR_COLORS[tutor.colorIndex] }}
            aria-hidden="true"
          >
            {tutor.initials}
          </span>
        )}
        {featured && <span className="feat-tag">★ Featured</span>}
      </div>

      {/* Body column */}
      <div className="trow-body">
        <div className="tb-head-line">
          <h3 className="tb-name display">{tutor.name}</h3>
        </div>
        <div className="tb-spec">{tutor.headline}</div>

        <div className="tb-cred">
          {tutor.credential && (
            <span className="tb-credchip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
              </svg>
              {tutor.credential}
            </span>
          )}
          {tutor.idVerified && (
            <span className="tb-credchip examiner">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 12.5 11 15.5 16 9" />
              </svg>
              Identity verified
            </span>
          )}
        </div>

        {tutor.bio && <p className="tb-quote">&ldquo;{tutor.bio.slice(0, 180)}&rdquo;</p>}

        <div className="tb-stats">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {tutor.courses.length} {tutor.courses.length === 1 ? 'course' : 'courses'}
          </span>
          {tutor.yearsExp ? (
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
              {tutor.yearsExp} {tutor.yearsExp === 1 ? 'yr' : 'yrs'} teaching
            </span>
          ) : null}
          <span>{tutor.location}</span>
        </div>

        <div className="tb-subjects">
          {tutor.courses.slice(0, 4).map(c => (
            <Link key={c.id} to={`/courses/${c.id}`} className="tb-subj">
              {c.level} {c.subject}
            </Link>
          ))}
          {tutor.courses.length > 4 && (
            <span className="tb-subj tb-subj--more">+{tutor.courses.length - 4} more</span>
          )}
        </div>
      </div>

      {/* CTA rail */}
      <div className="trow-cta">
        <div className="rail-boards">
          {tutor.boards.slice(0, 2).map(b => (
            <span key={b} className="rail-board">{b}</span>
          ))}
        </div>

        {schedule && (
          <span className="avail-line week">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" />
            </svg>
            {schedule}
          </span>
        )}

        <div className="price">
          <b className="display">{fmtPrice(tutor.minPrice, tutor.currency)}</b>
          <span>/hr</span>
          <span className="demo">Free {demoMin}-min demo</span>
        </div>

        <div className="cta-btns">
          <Link className="btn btn-primary btn-sm" to={`/tutors/${tutor.id}`}>View profile</Link>
          <Link
            className="btn btn-outline btn-sm"
            to={tutor.courses.length === 1 ? `/courses/${tutor.courses[0].id}/demo` : `/tutors/${tutor.id}#book`}
          >
            Book demo
          </Link>
        </div>
      </div>
    </article>
  )
}
