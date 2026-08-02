import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { fmtTime } from '../../lib/catalog'
import './StudentsView.css'

/* ══════════════════════════════════════════════════════════════════════════════
   Everyone this teacher is working with — grouped by person, not by row.

   A student can hold several courses with the same teacher, so the unit here is
   the student; their courses sit inside their card.
══════════════════════════════════════════════════════════════════════════════ */

type EnrollStatus =
  | 'pending_payment' | 'awaiting_verification' | 'active'
  | 'paused' | 'cancelled' | 'completed'

type EnrollRow = {
  id: string
  course_id: string
  status: EnrollStatus
  start_date: string | null
  sessions_per_week: number
  class_duration_min: number
  created_at: string
  student: {
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
  courses: {
    title: string
    level: string
    subject: string
    days_of_week: string[]
    class_times: Record<string, string>
  } | null
}

/** The subset of a demo request this view needs (passed down, already loaded). */
export type DemoLite = {
  id: string
  course_id: string
  status: string
  student_whatsapp: string | null
  scheduled_at: string | null
  preferred_time: string | null
  courses: { title: string; level: string } | null
  student: { first_name: string; last_name: string | null; avatar_url: string | null } | null
}

type CourseLine = {
  key: string
  title: string
  level: string
  status: EnrollStatus | 'demo'
  schedule: string
  startDate: string | null
  courseId: string
}

type StudentCard = {
  key: string
  name: string
  avatarUrl: string | null
  whatsapp: string | null
  courses: CourseLine[]
  /** Highest-priority state across their courses — drives the card accent. */
  headline: 'active' | 'payment' | 'demo'
  since: string
}

const STATUS_LABEL: Record<string, string> = {
  active:                'Enrolled',
  pending_payment:       'Payment due',
  awaiting_verification: 'Verifying payment',
  paused:                'Paused',
  completed:             'Finished',
  cancelled:             'Cancelled',
  demo:                  'Demo booked',
}

const DAY_ORDER = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function scheduleOf(c: EnrollRow['courses']): string {
  if (!c || (c.days_of_week ?? []).length === 0) return 'Schedule to be agreed'
  const days = DAY_ORDER.filter(d => c.days_of_week.includes(d))
  const one  = c.class_times?.all ?? (days.length === 1 ? c.class_times?.[days[0]] : undefined)
  return one ? `${days.join(' · ')} at ${fmtTime(one)}` : days.join(' · ')
}

function nameOf(p: { first_name: string | null; last_name: string | null } | null | undefined) {
  return [p?.first_name, p?.last_name].filter(Boolean).join(' ') || 'Student'
}

function initials(n: string) {
  return n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

const AV = ['av-c0','av-c1','av-c2','av-c3','av-c4','av-c7']
function avColor(n: string) {
  let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AV[h % AV.length]
}

export default function StudentsView({
  teacherId, demos, demosLoading,
}: {
  teacherId: string | null
  demos: DemoLite[]
  demosLoading: boolean
}) {
  const [rows,    setRows]    = useState<EnrollRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'all' | 'active' | 'payment' | 'demo'>('all')

  useEffect(() => {
    if (!teacherId) return
    let alive = true
    supabase
      .from('enrollments')
      .select(`
        id, course_id, status, start_date, sessions_per_week, class_duration_min, created_at,
        student:profiles!student_id ( id, first_name, last_name, avatar_url ),
        courses ( title, level, subject, days_of_week, class_times )
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!alive) return
        setRows((data as unknown as EnrollRow[]) ?? [])
        setLoading(false)
      })
    return () => { alive = false }
  }, [teacherId])

  /* ── Fold enrolments + demos into one card per person ────────────────────── */
  const students = useMemo<StudentCard[]>(() => {
    const byStudent = new Map<string, StudentCard>()

    // A student's number lives on their demo request; index it for lookup.
    const waByStudent = new Map<string, string>()
    for (const d of demos) {
      const key = nameOf(d.student)
      if (d.student_whatsapp && !waByStudent.has(key)) waByStudent.set(key, d.student_whatsapp)
    }

    for (const e of rows) {
      if (!e.student) continue
      const id   = e.student.id
      const name = nameOf(e.student)
      const card = byStudent.get(id) ?? {
        key: id,
        name,
        avatarUrl: e.student.avatar_url,
        whatsapp:  waByStudent.get(name) ?? null,
        courses:   [],
        headline:  'demo' as const,
        since:     e.created_at,
      }
      card.courses.push({
        key:       e.id,
        title:     e.courses?.title ?? 'Course',
        level:     e.courses?.level ?? '',
        status:    e.status,
        schedule:  scheduleOf(e.courses),
        startDate: e.start_date,
        courseId:  e.course_id,
      })
      if (e.status === 'active') card.headline = 'active'
      else if (
        (e.status === 'pending_payment' || e.status === 'awaiting_verification') &&
        card.headline !== 'active'
      ) card.headline = 'payment'
      if (e.created_at < card.since) card.since = e.created_at
      byStudent.set(id, card)
    }

    // Demo-stage prospects: accepted or completed demos with no enrolment yet.
    for (const d of demos) {
      if (!['accepted', 'completed'].includes(d.status)) continue
      const name = nameOf(d.student)
      const key  = `demo:${name}`
      const already = Array.from(byStudent.values()).some(c => c.name === name)
      if (already) continue
      const card = byStudent.get(key) ?? {
        key,
        name,
        avatarUrl: d.student?.avatar_url ?? null,
        whatsapp:  d.student_whatsapp,
        courses:   [],
        headline:  'demo' as const,
        since:     d.scheduled_at ?? new Date().toISOString(),
      }
      card.courses.push({
        key:       d.id,
        title:     d.courses?.title ?? 'Course',
        level:     d.courses?.level ?? '',
        status:    'demo',
        schedule:  d.scheduled_at
          ? new Date(d.scheduled_at).toLocaleString('en-GB', {
              weekday: 'long', day: 'numeric', month: 'short',
              hour: 'numeric', minute: '2-digit',
            })
          : d.preferred_time || 'Time to be confirmed',
        startDate: null,
        courseId:  d.course_id,
      })
      byStudent.set(key, card)
    }

    const order = { active: 0, payment: 1, demo: 2 }
    return Array.from(byStudent.values())
      .sort((a, b) => order[a.headline] - order[b.headline] || a.name.localeCompare(b.name))
  }, [rows, demos])

  const counts = {
    all:     students.length,
    active:  students.filter(s => s.headline === 'active').length,
    payment: students.filter(s => s.headline === 'payment').length,
    demo:    students.filter(s => s.headline === 'demo').length,
  }

  const shown = filter === 'all' ? students : students.filter(s => s.headline === filter)
  const busy  = loading || demosLoading

  return (
    <div>
      <div className="td-page-head">
        <div>
          <h1 className="td-page-title">My Students</h1>
          <p className="td-page-sub">
            {busy
              ? 'Loading…'
              : counts.all === 0
                ? 'No students yet'
                : `${counts.active} enrolled · ${counts.payment} awaiting payment · ${counts.demo} at demo stage`}
          </p>
        </div>
      </div>

      {!busy && students.length > 0 && (
        <div className="td-filters">
          {([
            ['all',     'Everyone'],
            ['active',  'Enrolled'],
            ['payment', 'Awaiting payment'],
            ['demo',    'Demo stage'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              className={`td-filter${filter === k ? ' active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {label}
              <span className="td-filter-n">{counts[k]}</span>
            </button>
          ))}
        </div>
      )}

      {busy ? (
        <div className="td-loading">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="td-empty">
          <div className="td-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/>
            </svg>
          </div>
          <h3>{students.length === 0 ? 'No students yet' : `No ${filter === 'payment' ? 'students awaiting payment' : filter === 'demo' ? 'students at demo stage' : 'enrolled students'}`}</h3>
          <p>
            {students.length === 0
              ? 'Once a student books a demo and enrols, they will appear here with their schedule and contact details.'
              : 'Try another filter to see the rest of your students.'}
          </p>
        </div>
      ) : (
        <div className="sv-list">
          {shown.map(s => (
            <article key={s.key} className={`sv-card sv-card--${s.headline}`}>
              <div className="sv-card-head">
                {s.avatarUrl
                  ? <img className={`sv-av av ${avColor(s.name)}`} src={s.avatarUrl} alt="" />
                  : <span className={`sv-av av ${avColor(s.name)}`} aria-hidden="true">{initials(s.name)}</span>}

                <div className="sv-id">
                  <div className="sv-name">{s.name}</div>
                  <div className="sv-since">
                    {s.headline === 'demo'
                      ? 'Prospective student'
                      : `Since ${new Date(s.since).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
                  </div>
                </div>

                {s.whatsapp ? (
                  <a
                    className="sv-wa"
                    href={`https://wa.me/${s.whatsapp.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2A10 10 0 0 0 3.5 17.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .9.9-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>
                      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.2-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/>
                    </svg>
                    <span className="sv-wa-num">{s.whatsapp}</span>
                  </a>
                ) : (
                  <span className="sv-nowa">No contact on file</span>
                )}
              </div>

              <div className="sv-courses">
                {s.courses.map(c => (
                  <div key={c.key} className="sv-course">
                    <div className="sv-course-main">
                      <Link to={`/courses/${c.courseId}`} className="sv-course-title">
                        {c.title}
                      </Link>
                      <div className="sv-course-sched">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>
                        </svg>
                        {c.schedule}
                      </div>
                      {c.startDate && c.status !== 'demo' && (
                        <div className="sv-course-start">
                          Starts {new Date(c.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                        </div>
                      )}
                    </div>
                    <span className={`sv-status sv-status--${c.status}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
