import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { AVATAR_COLORS, fmtPrice, fmtTime } from '../../lib/catalog'
import './BookingWidget.css'

const STEPS = [
  { n:'01', title:'Browse and pick a course',   desc:'Filter by subject, exam board, level and schedule. Read the syllabus and the teacher’s credentials.' },
  { n:'02', title:'Request a free demo class',  desc:'No payment needed. The teacher confirms a slot — you meet on Google Meet.' },
  { n:'03', title:'Enroll and get to work',     desc:'Book sessions, share files, track progress, receive assignments — all in one workspace.' },
]

export default function BookingWidget() {
  const { teachers, courses, loading } = useCatalog()
  const [selected, setSelected] = useState<string | null>(null)

  /* Feature the course with the most weekly sessions — the one a student is
     most likely to find a workable slot in. */
  const featured = useMemo(() => {
    if (courses.length === 0) return null
    const course = [...courses].sort(
      (a, b) => (b.days_of_week?.length ?? 0) - (a.days_of_week?.length ?? 0)
    )[0]
    const teacher = teachers.find(t => t.id === course.teacher_id)
    return teacher ? { course, teacher } : null
  }, [courses, teachers])

  /* Real weekly slots straight off the course record. */
  const slots = useMemo(() => {
    if (!featured) return []
    const { days_of_week, class_times } = featured.course
    return (days_of_week ?? []).map(day => {
      const raw = class_times?.all ?? class_times?.[day]
      return { day, label: raw ? `${day} ${fmtTime(raw)}` : day }
    })
  }, [featured])

  if (loading || !featured) return null

  const { course, teacher } = featured
  const selectedSlot = slots.find(s => s.day === selected)

  return (
    <section className="booking" id="book" aria-label="Book a demo class">
      <div className="wrap">
        <div className="booking-grid">

          {/* Left — evergreen copy */}
          <div className="booking-left">
            <p className="booking-eyebrow">Get started</p>
            <h2 className="display">Book your first session.</h2>
            <div className="b-steps">
              {STEPS.map(s => (
                <div key={s.n} className="b-step">
                  <span className="b-num mono">{s.n}</span>
                  <div>
                    <b>{s.title}</b>
                    <span>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — booking card for a real course */}
          <div className="book-card">
            <div className="bc-top">
              {teacher.avatarUrl ? (
                <img
                  src={teacher.avatarUrl}
                  alt=""
                  className="av bc-av--img"
                  style={{ width: 52, height: 52 }}
                />
              ) : (
                <span
                  className="av"
                  style={{ width: 52, height: 52, fontSize: 18, background: AVATAR_COLORS[teacher.colorIndex] }}
                  aria-hidden="true"
                >
                  {teacher.initials}
                </span>
              )}
              <div>
                <div className="bc-name display">{course.title}</div>
                <div className="bc-sub">with {teacher.name}</div>
                <span className="bc-chips">
                  <span className="bc-chip">{course.level}</span>
                  {course.exam_board !== 'N/A' && (
                    <span className="bc-chip">{course.exam_board}</span>
                  )}
                  <span className="bc-chip bc-chip--price mono">
                    {fmtPrice(course.rate_per_hour, course.currency)}/hr
                  </span>
                </span>
              </div>
            </div>

            {slots.length > 0 ? (
              <>
                <p className="bc-label">Weekly class times</p>
                <div className="slots" role="group" aria-label="Class times">
                  {slots.map(s => (
                    <button
                      key={s.day}
                      className="slot"
                      aria-pressed={selected === s.day}
                      onClick={() => setSelected(s.day)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="bc-label">Schedule agreed with the teacher after your demo.</p>
            )}

            <div className="bc-cta">
              <Link to={`/courses/${course.id}/demo`} className="btn btn-primary btn-lg btn-block">
                {selectedSlot ? `Book demo — ${selectedSlot.label}` : 'Book free demo'}
              </Link>
            </div>
            <p className="bc-note">
              {course.demo_duration_min}-min demo · No payment needed · Cancel any time
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
