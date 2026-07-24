import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import './MyDemos.css'

type DemoStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'

type Row = {
  id: string
  course_id: string
  status: DemoStatus
  preferred_time: string | null
  meet_link: string | null
  scheduled_at: string | null
  created_at: string
  courses: { title: string; subject: string; level: string; demo_duration_min: number } | null
  teacher: { first_name: string | null; last_name: string | null; avatar_url: string | null } | null
}

const LABEL: Record<DemoStatus, string> = {
  pending:   'Awaiting teacher',
  accepted:  'Confirmed',
  declined:  'Declined',
  completed: 'Ready to enrol',
  cancelled: 'Cancelled',
}

function teacherName(t: Row['teacher']): string {
  return [t?.first_name, t?.last_name].filter(Boolean).join(' ') || 'the teacher'
}

export default function MyDemos({ userId }: { userId: string | null }) {
  const [rows,    setRows]    = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let alive = true

    supabase
      .from('demo_requests')
      .select(`
        id, course_id, status, preferred_time, meet_link, scheduled_at, created_at,
        courses ( title, subject, level, demo_duration_min ),
        teacher:profiles!teacher_id ( first_name, last_name, avatar_url )
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

  async function cancel(id: string) {
    setBusyId(id)
    const { error } = await supabase
      .from('demo_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
    setBusyId(null)
    if (!error) {
      setRows(rs => rs.map(r => (r.id === id ? { ...r, status: 'cancelled' } : r)))
    }
  }

  if (loading || rows.length === 0) return null

  const LIVE = ['pending', 'accepted', 'completed']
  const live = rows.filter(r => LIVE.includes(r.status))
  const past = rows.filter(r => !LIVE.includes(r.status))

  return (
    <section className="mydemos" aria-label="Your demo classes">
      <div className="mydemos-head">
        <h2>Your demo classes</h2>
        <Link to="/tutors" className="mydemos-link">Find another tutor →</Link>
      </div>

      <div className="mydemos-list">
        {[...live, ...past].map(r => (
          <article key={r.id} className={`mydemo mydemo--${r.status}`}>
            <div className="mydemo-main">
              <div className="mydemo-top">
                <span className={`mydemo-pill mydemo-pill--${r.status}`}>{LABEL[r.status]}</span>
                {r.courses && <span className="mydemo-level">{r.courses.level}</span>}
              </div>

              <h3 className="mydemo-title">
                {r.course_id ? (
                  <Link to={`/courses/${r.course_id}`}>{r.courses?.title ?? 'Course'}</Link>
                ) : (
                  r.courses?.title ?? 'Course'
                )}
              </h3>

              <p className="mydemo-meta">
                with {teacherName(r.teacher)}
                {r.courses?.demo_duration_min ? ` · free ${r.courses.demo_duration_min}-min demo` : ''}
              </p>

              <p className="mydemo-time">
                {r.status === 'completed'
                  ? 'Demo done — register to start weekly classes'
                  : r.scheduled_at
                  ? new Date(r.scheduled_at).toLocaleString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'short',
                      hour: 'numeric', minute: '2-digit',
                    })
                  : r.preferred_time
                    ? `You asked for: ${r.preferred_time}`
                    : 'Time to be confirmed'}
              </p>
            </div>

            <div className="mydemo-actions">
              {r.status === 'accepted' && r.meet_link && (
                <a className="btn btn-primary btn-sm" href={r.meet_link} target="_blank" rel="noopener noreferrer">
                  Join class
                </a>
              )}
              {r.status === 'accepted' && !r.meet_link && (
                <span className="mydemo-wait">Link coming from the teacher</span>
              )}
              {r.status === 'pending' && (
                <button
                  className="btn btn-outline btn-sm"
                  disabled={busyId === r.id}
                  onClick={() => cancel(r.id)}
                >
                  {busyId === r.id ? 'Cancelling…' : 'Cancel request'}
                </button>
              )}
              {r.status === 'completed' && (
                <Link className="btn btn-primary btn-sm" to={`/courses/${r.course_id}/enroll`}>
                  Register for course
                </Link>
              )}
              {r.status === 'declined' && (
                <Link className="btn btn-outline btn-sm" to="/tutors">Find another tutor</Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
