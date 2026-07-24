import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { fmtPrice } from '../../../lib/catalog'
import './MyEnrollments.css'

type Status = 'pending_payment' | 'active' | 'paused' | 'cancelled' | 'completed'

type Row = {
  id: string
  course_id: string
  status: Status
  first_month_total: number
  currency: string
  sessions_per_week: number
  class_duration_min: number
  start_date: string | null
  created_at: string
  courses: { title: string; level: string; exam_board: string } | null
  teacher: { first_name: string | null; last_name: string | null } | null
}

const LABEL: Record<Status, string> = {
  pending_payment: 'Payment pending',
  active:          'Active',
  paused:          'Paused',
  cancelled:       'Cancelled',
  completed:       'Finished',
}

export default function MyEnrollments({ userId }: { userId: string | null }) {
  const [rows,    setRows]    = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let alive = true

    supabase
      .from('enrollments')
      .select(`
        id, course_id, status, first_month_total, currency,
        sessions_per_week, class_duration_min, start_date, created_at,
        courses ( title, level, exam_board ),
        teacher:profiles!teacher_id ( first_name, last_name )
      `)
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!alive) return
        setRows((data as unknown as Row[]) ?? [])
        setLoading(false)
      })

    return () => { alive = false }
  }, [userId])

  if (loading || rows.length === 0) return null

  return (
    <section className="myenrol" aria-label="Your course registrations">
      <div className="myenrol-head">
        <h2>Your courses</h2>
      </div>

      <div className="myenrol-list">
        {rows.map(r => {
          const teacher = [r.teacher?.first_name, r.teacher?.last_name].filter(Boolean).join(' ') || 'your teacher'
          return (
            <article key={r.id} className={`myenrol-row myenrol-row--${r.status}`}>
              <div className="myenrol-main">
                <div className="myenrol-top">
                  <span className={`myenrol-pill myenrol-pill--${r.status}`}>{LABEL[r.status]}</span>
                  {r.courses && <span className="myenrol-level">{r.courses.level}</span>}
                </div>

                <h3 className="myenrol-title">
                  <Link to={`/courses/${r.course_id}`}>{r.courses?.title ?? 'Course'}</Link>
                </h3>

                <p className="myenrol-meta">
                  with {teacher} · {r.sessions_per_week}{' '}
                  {r.sessions_per_week === 1 ? 'class' : 'classes'} a week ·{' '}
                  {r.class_duration_min} min each
                </p>

                {r.status === 'pending_payment' && (
                  <p className="myenrol-note">
                    Your place is held. Nothing has been charged yet — we&rsquo;ll email you
                    when checkout opens.
                  </p>
                )}

                {r.start_date && r.status !== 'cancelled' && (
                  <p className="myenrol-start">
                    Starts {new Date(r.start_date).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })}
                  </p>
                )}
              </div>

              <div className="myenrol-side">
                <div className="myenrol-amount">
                  <b>{fmtPrice(r.first_month_total, r.currency)}</b>
                  <span>first month</span>
                </div>
                {r.status === 'pending_payment' && (
                  <Link className="btn btn-outline btn-sm" to={`/courses/${r.course_id}/enroll`}>
                    View details
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
