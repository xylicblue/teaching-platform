import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { AVATAR_COLORS, fmtPrice, fmtTime } from '../../lib/catalog'
import './LatestCourses.css'

/** "Mon · Wed at 5:30pm" — pulled straight off the course's schedule. */
function scheduleLabel(days: string[], times: Record<string, string>): string {
  if (days.length === 0) return 'Schedule to be confirmed'
  const dayPart = days.join(' · ')
  const single = times.all ?? (days.length === 1 ? times[days[0]] : undefined)
  return single ? `${dayPart} at ${fmtTime(single)}` : dayPart
}

export default function LatestCourses() {
  const { teachers, courses, loading } = useCatalog()

  if (loading || courses.length === 0) return null

  const recent = courses.slice(0, 12)

  return (
    <section className="lcourses" aria-label="Courses open for enrolment">
      <div className="wrap">
        <div className="lcourses-head">
          <span className="live-label">
            <span className="dot-live anim" aria-hidden="true" />
            Open for enrolment
          </span>
          <Link to="/tutors" className="tlink">
            See all courses
            <svg className="ar" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="hscroll" role="list">
          {recent.map(course => {
            const teacher = teachers.find(t => t.id === course.teacher_id)
            if (!teacher) return null

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="mini"
                role="listitem"
              >
                <div className="mini-top">
                  <div className="mini-av-wrap">
                    {teacher.avatarUrl ? (
                      <img src={teacher.avatarUrl} alt="" className="mini-av mini-av--img" />
                    ) : (
                      <span
                        className="mini-av"
                        style={{ background: AVATAR_COLORS[teacher.colorIndex] }}
                        aria-hidden="true"
                      >
                        {teacher.initials}
                      </span>
                    )}
                  </div>
                  <div className="mini-id">
                    <div className="mn">{course.title}</div>
                    <div className="ms">{teacher.name}</div>
                  </div>
                </div>

                <div className="mini-tags">
                  <span className="mini-tag">{course.level}</span>
                  {course.exam_board !== 'N/A' && (
                    <span className="mini-tag">{course.exam_board}</span>
                  )}
                </div>

                <div className="mini-sched">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" />
                  </svg>
                  {scheduleLabel(course.days_of_week, course.class_times)}
                </div>

                <div className="mini-foot">
                  <span className="mini-demo">Free {course.demo_duration_min}-min demo</span>
                  <span className="mono price">{fmtPrice(course.rate_per_hour, course.currency)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
