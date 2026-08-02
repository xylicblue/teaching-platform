import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { AVATAR_COLORS, colorIndexFromName, initialsOf, fmtPrice, fmtTime } from '../../lib/catalog'
import PaymentPanel from '../../components/payment/PaymentPanel/PaymentPanel'
import './EnrollPage.css'

/* ── Types ──────────────────────────────────────────────────────────────────── */
type Course = {
  id: string
  teacher_id: string
  title: string
  subject: string
  level: string
  exam_board: string
  rate_per_hour: number
  currency: string
  class_duration_min: number
  days_of_week: string[]
  class_times: Record<string, string>
  course_type: 'recurring' | 'fixed'
  duration_months: number | null
  topics: { heading: string; plan: string }[]
}

type Teacher = {
  name: string
  initials: string
  colorIndex: number
  avatarUrl: string | null
}

type Enrollment = {
  id: string
  status: 'pending_payment' | 'awaiting_verification' | 'active' | 'paused' | 'cancelled' | 'completed'
  first_month_total: number
  currency: string
  start_date: string | null
}

const DAY_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

/** Next occurrence of a weekday, as a yyyy-mm-dd string. */
function nextDateFor(days: string[]): string {
  const idx = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const wanted = new Set(days.map(d => idx.indexOf(d)).filter(i => i >= 0))
  const d = new Date()
  for (let i = 1; i <= 14; i++) {
    const cand = new Date(d.getTime() + i * 86400000)
    if (wanted.size === 0 || wanted.has(cand.getDay())) {
      return cand.toISOString().slice(0, 10)
    }
  }
  return new Date(d.getTime() + 86400000).toISOString().slice(0, 10)
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function EnrollPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [userId,   setUserId]   = useState<string | null>(null)

  const [course,   setCourse]   = useState<Course | null>(null)
  const [teacher,  setTeacher]  = useState<Teacher | null>(null)
  const [demoDone, setDemoDone] = useState<boolean | null>(null)
  const [existing, setExisting] = useState<Enrollment | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [startDate,  setStartDate]  = useState('')
  const [note,       setNote]       = useState('')
  const [agreed,     setAgreed]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')
  const [created,    setCreated]    = useState<Enrollment | null>(null)

  /* ── Signed-in only ──────────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return
      if (!session) {
        navigate(`/signin?redirect=${encodeURIComponent(`/courses/${id}/enroll`)}`, { replace: true })
        return
      }
      setUserId(session.user.id)
      setChecking(false)
    })
    return () => { alive = false }
  }, [id, navigate])

  /* ── Course + gate on a completed demo ───────────────────────────────────── */
  useEffect(() => {
    if (!id || !userId) return
    let alive = true

    async function load() {
      const { data: c } = await supabase
        .from('courses')
        .select('id, teacher_id, title, subject, level, exam_board, rate_per_hour, currency, class_duration_min, days_of_week, class_times, course_type, duration_months, topics')
        .eq('id', id!)
        .eq('status', 'approved')
        .eq('is_active', true)
        .maybeSingle()

      if (!alive) return
      if (!c) { setNotFound(true); return }
      setCourse(c as Course)
      setStartDate(nextDateFor(c.days_of_week ?? []))

      const [profRes, demoRes, enrRes] = await Promise.all([
        supabase.from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', c.teacher_id).single(),
        supabase.from('demo_requests')
          .select('id')
          .eq('course_id', id!)
          .eq('student_id', userId!)
          .eq('status', 'completed')
          .limit(1),
        supabase.from('enrollments')
          .select('id, status, first_month_total, currency, start_date')
          .eq('course_id', id!)
          .eq('student_id', userId!)
          .in('status', ['pending_payment', 'awaiting_verification', 'active', 'paused'])
          .maybeSingle(),
      ])

      if (!alive) return

      const p = profRes.data
      const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || 'Teacher'
      setTeacher({
        name,
        initials:   initialsOf(p?.first_name ?? null, p?.last_name ?? null),
        colorIndex: colorIndexFromName(name),
        avatarUrl:  p?.avatar_url ?? null,
      })
      setDemoDone((demoRes.data?.length ?? 0) > 0)
      setExisting((enrRes.data as Enrollment) ?? null)
    }

    load()
    return () => { alive = false }
  }, [id, userId])

  /* ── What they're signing up for ─────────────────────────────────────────── */
  const plan = useMemo(() => {
    if (!course) return null
    const sessions = (course.days_of_week ?? []).length
    const hours    = course.class_duration_min / 60
    const perWeek  = course.rate_per_hour * hours * sessions
    return {
      sessions,
      hoursPerWeek: hours * sessions,
      perSession:   course.rate_per_hour * hours,
      perWeek,
      perMonth:     perWeek * 4,
      schedule: (course.days_of_week ?? []).map(day => {
        const raw = course.class_times?.all ?? course.class_times?.[day]
        return { day: DAY_FULL[day] ?? day, time: raw ? fmtTime(raw) : 'Time to be agreed' }
      }),
    }
  }, [course])

  async function handleSubmit() {
    if (!course || !userId || !agreed || submitting) return
    setSubmitting(true)
    setApiError('')

    // Only these four fields are client-supplied — teacher, pricing and
    // schedule are written server-side by the trigger in migration 011.
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        course_id:    course.id,
        student_id:   userId,
        start_date:   startDate || null,
        student_note: note.trim() || null,
      })
      .select('id, status, first_month_total, currency, start_date')
      .single()

    setSubmitting(false)

    if (error) {
      setApiError(
        error.code === '23505'
          ? 'You are already registered for this course.'
          : error.code === '42501'
            ? 'You need a completed demo class for this course before you can register.'
            : 'Something went wrong. Please try again.'
      )
      return
    }
    setCreated(data as Enrollment)
  }

  /* ── States ──────────────────────────────────────────────────────────────── */
  if (checking) return <Shell><div className="en-loading">Checking your account…</div></Shell>

  if (notFound) {
    return (
      <Shell>
        <div className="en-notfound">
          <h1 className="display">Course not available</h1>
          <p>This course may have been removed or is no longer accepting students.</p>
          <Link className="btn btn-primary" to="/tutors">Browse tutors</Link>
        </div>
      </Shell>
    )
  }

  if (!course || !teacher || !plan || demoDone === null) {
    return <Shell><div className="en-loading">Loading course…</div></Shell>
  }

  /* ── Payment: manual bank transfer, verified by an admin ─────────────────── */
  const unpaid = created ?? (
    existing && (existing.status === 'pending_payment' || existing.status === 'awaiting_verification')
      ? existing
      : null
  )

  if (unpaid) {
    return (
      <Shell>
        <div className="en-crumb">
          <Link to="/tutors">Tutors</Link>
          <span className="sep">/</span>
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
          <span className="sep">/</span>
          <span className="cur">Payment</span>
        </div>

        <PaymentPanel
          enrollmentId={unpaid.id}
          studentId={userId!}
          courseId={course.id}
          courseTitle={course.title}
          teacherName={teacher.name}
          amount={unpaid.first_month_total}
          currency={unpaid.currency}
          startDate={unpaid.start_date}
          status={unpaid.status}
          // Re-read the enrollment so the panel flips to "awaiting verification".
          onSubmitted={() => {
            setCreated(null)
            setExisting({ ...unpaid, status: 'awaiting_verification' })
          }}
        />
      </Shell>
    )
  }

  if (existing) {
    return (
      <Shell>
        <div className="en-panel">
          <span className="en-step-pill en-step-pill--ok">Enrolled</span>
          <h1 className="display">You&rsquo;re already on this course.</h1>
          <p className="en-lede">Your registration for <b>{course.title}</b> is {existing.status}.</p>
          <div className="en-panel-foot">
            <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
          </div>
        </div>
      </Shell>
    )
  }

  /* ── Gate: no completed demo ─────────────────────────────────────────────── */
  if (!demoDone) {
    return (
      <Shell>
        <div className="en-panel">
          <span className="en-step-pill en-step-pill--wait">Demo first</span>
          <h1 className="display">Sit the free demo first.</h1>
          <p className="en-lede">
            Registration for <b>{course.title}</b> opens once {teacher.name.split(' ')[0]} has
            taught your free demo class and marked it complete. It costs nothing and there&rsquo;s
            no obligation to continue.
          </p>
          <div className="en-panel-foot">
            <Link className="btn btn-primary" to={`/courses/${course.id}/demo`}>Book the free demo</Link>
            <Link className="btn btn-outline" to={`/courses/${course.id}`}>Back to course</Link>
          </div>
        </div>
      </Shell>
    )
  }

  /* ── Registration form ───────────────────────────────────────────────────── */
  return (
    <Shell>
      <div className="en-crumb">
        <Link to="/tutors">Tutors</Link>
        <span className="sep">/</span>
        <Link to={`/courses/${course.id}`}>{course.title}</Link>
        <span className="sep">/</span>
        <span className="cur">Register</span>
      </div>

      <div className="en-grid">
        <div className="en-main">
          <p className="eyebrow">Demo complete · Step 2 of 3</p>
          <h1 className="en-title display">Register for {course.title}.</h1>
          <p className="en-lede">
            You&rsquo;ve sat the demo with {teacher.name.split(' ')[0]}. Confirm when you want to
            start and you&rsquo;ll be taken to payment.
          </p>

          {/* Schedule */}
          <section className="en-step">
            <div className="en-step-head">
              <span className="en-num mono">01</span>
              <div>
                <h2>Your weekly schedule</h2>
                <p>These are fixed by the course — the same slots every week.</p>
              </div>
            </div>
            <div className="en-schedule">
              {plan.schedule.map(s => (
                <div key={s.day} className="en-sched-row">
                  <b>{s.day}</b>
                  <span>{s.time}</span>
                  <span className="en-sched-dur">{course.class_duration_min} min</span>
                </div>
              ))}
              {plan.schedule.length === 0 && (
                <p className="en-sched-empty">
                  No fixed schedule — you&rsquo;ll agree times with {teacher.name.split(' ')[0]} directly.
                </p>
              )}
            </div>
          </section>

          {/* Start date */}
          <section className="en-step">
            <div className="en-step-head">
              <span className="en-num mono">02</span>
              <div>
                <h2>When do you want to start?</h2>
                <p>We&rsquo;ve picked the next class day. Change it if you need longer.</p>
              </div>
            </div>
            <input
              className="en-input"
              type="date"
              value={startDate}
              min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
              aria-label="Start date"
              onChange={e => setStartDate(e.target.value)}
            />
          </section>

          {/* Note */}
          <section className="en-step">
            <div className="en-step-head">
              <span className="en-num mono">03</span>
              <div>
                <h2>Anything the teacher should know?</h2>
                <p>Optional — exam dates, topics to prioritise, weeks you&rsquo;ll be away.</p>
              </div>
            </div>
            <textarea
              className="en-textarea"
              rows={4}
              maxLength={600}
              value={note}
              placeholder="e.g. My exam is in May and I'll be away the first week of April."
              aria-label="Note for the teacher"
              onChange={e => setNote(e.target.value)}
            />
            <span className="en-count">{note.length}/600</span>
          </section>

          {/* Confirm */}
          <label className="en-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span>
              I understand this reserves my place on the course at{' '}
              <b>{fmtPrice(plan.perMonth, course.currency)} per month</b>, and that classes
              begin once payment is complete.
            </span>
          </label>

          {apiError && <div className="en-error" role="alert">{apiError}</div>}

          <div className="en-submit">
            <button
              className="btn btn-primary btn-lg"
              disabled={!agreed || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Registering…' : 'Register and continue to payment'}
            </button>
            <span className="en-submit-note">You won&rsquo;t be charged on this step.</span>
          </div>
        </div>

        {/* ── Cost rail ── */}
        <aside className="en-aside" aria-label="Cost summary">
          <div className="en-card">
            <div className="en-card-head">
              {teacher.avatarUrl ? (
                <img src={teacher.avatarUrl} alt="" className="en-av en-av--img" />
              ) : (
                <span className="en-av" style={{ background: AVATAR_COLORS[teacher.colorIndex] }} aria-hidden="true">
                  {teacher.initials}
                </span>
              )}
              <div>
                <div className="en-card-title">{course.title}</div>
                <div className="en-card-sub">with {teacher.name}</div>
              </div>
            </div>

            <div className="en-card-chips">
              <span className="en-chip">{course.level}</span>
              {course.exam_board !== 'N/A' && <span className="en-chip">{course.exam_board}</span>}
              <span className="en-chip">
                {course.course_type === 'fixed' && course.duration_months
                  ? `${course.duration_months} months`
                  : 'Ongoing'}
              </span>
            </div>

            <dl className="en-breakdown">
              <div>
                <dt>Rate</dt>
                <dd>{fmtPrice(course.rate_per_hour, course.currency)} / hour</dd>
              </div>
              <div>
                <dt>Per class</dt>
                <dd>{fmtPrice(plan.perSession, course.currency)}</dd>
              </div>
              <div>
                <dt>Classes a week</dt>
                <dd>{plan.sessions}</dd>
              </div>
              <div>
                <dt>Hours a week</dt>
                <dd>{plan.hoursPerWeek}</dd>
              </div>
            </dl>

            <div className="en-total">
              <span>Due at checkout</span>
              <b>{fmtPrice(plan.perMonth, course.currency)}</b>
              <span className="en-total-sub">first month · 4 weeks of classes</span>
            </div>

            <p className="en-card-note">
              The demo was free and stays free. Nothing is charged until you complete payment.
            </p>
          </div>
        </aside>
      </div>
    </Shell>
  )
}

/* ── Page chrome ───────────────────────────────────────────────────────────── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="en-page">
      <Navbar />
      <main className="wrap en-wrap">{children}</main>
      <Footer />
    </div>
  )
}
