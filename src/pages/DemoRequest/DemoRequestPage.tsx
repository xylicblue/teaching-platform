import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { AVATAR_COLORS, colorIndexFromName, initialsOf, fmtPrice, fmtTime } from '../../lib/catalog'
import './DemoRequestPage.css'

/* ── Types ──────────────────────────────────────────────────────────────────── */
type Course = {
  id: string
  teacher_id: string
  title: string
  subject: string
  level: string
  exam_board: string
  description: string | null
  rate_per_hour: number
  currency: string
  demo_duration_min: number
  class_duration_min: number
  days_of_week: string[]
  class_times: Record<string, string>
  topics: { heading: string; plan: string }[]
}

type Teacher = {
  id: string
  name: string
  initials: string
  colorIndex: number
  avatarUrl: string | null
  yearsExp: number | null
  city: string | null
}

type Existing = {
  id: string
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'
  preferred_time: string | null
  meet_link: string | null
}

const DAY_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function DemoRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [userId,   setUserId]   = useState<string | null>(null)
  const [role,     setRole]     = useState<string | null>(null)

  const [course,   setCourse]   = useState<Course | null>(null)
  const [teacher,  setTeacher]  = useState<Teacher | null>(null)
  const [existing, setExisting] = useState<Existing | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [slot,       setSlot]       = useState<string | null>(null)
  const [otherTime,  setOtherTime]  = useState('')
  const [note,       setNote]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')
  const [done,       setDone]       = useState(false)

  /* ── Gate: you must be signed in to request a demo ───────────────────────── */
  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return
      if (!session) {
        // Come straight back here once they're in.
        navigate(`/signin?redirect=${encodeURIComponent(`/courses/${id}/demo`)}`, { replace: true })
        return
      }
      setUserId(session.user.id)
      supabase
        .from('profiles').select('role').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (!alive) return
          setRole(data?.role ?? 'student')
          setChecking(false)
        })
    })
    return () => { alive = false }
  }, [id, navigate])

  /* ── Load the course, its teacher, and any request already in flight ──────── */
  useEffect(() => {
    if (!id || !userId) return
    let alive = true

    async function load() {
      const { data: c } = await supabase
        .from('courses')
        .select('id, teacher_id, title, subject, level, exam_board, description, rate_per_hour, currency, demo_duration_min, class_duration_min, days_of_week, class_times, topics')
        .eq('id', id!)
        .eq('status', 'approved')
        .eq('is_active', true)
        .maybeSingle()

      if (!alive) return
      if (!c) { setNotFound(true); return }
      setCourse(c as Course)

      const [profRes, pubRes, existingRes] = await Promise.all([
        supabase.from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', c.teacher_id).single(),
        supabase.from('teacher_public')
          .select('years_exp, city')
          .eq('id', c.teacher_id).maybeSingle(),
        supabase.from('demo_requests')
          .select('id, status, preferred_time, meet_link')
          .eq('course_id', id!)
          .eq('student_id', userId!)
          .in('status', ['pending', 'accepted'])
          .maybeSingle(),
      ])

      if (!alive) return

      const p = profRes.data
      const name = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || 'Teacher'
      setTeacher({
        id:         c.teacher_id,
        name,
        initials:   initialsOf(p?.first_name ?? null, p?.last_name ?? null),
        colorIndex: colorIndexFromName(name),
        avatarUrl:  p?.avatar_url ?? null,
        yearsExp:   pubRes.data?.years_exp ?? null,
        city:       pubRes.data?.city ?? null,
      })
      setExisting((existingRes.data as Existing) ?? null)
    }

    load()
    return () => { alive = false }
  }, [id, userId])

  /* ── The course's real weekly slots ───────────────────────────────────────── */
  const slots = useMemo(() => {
    if (!course) return []
    return (course.days_of_week ?? []).map(day => {
      const raw = course.class_times?.all ?? course.class_times?.[day]
      return {
        key:   day,
        day:   DAY_FULL[day] ?? day,
        time:  raw ? fmtTime(raw) : null,
        label: raw ? `${DAY_FULL[day] ?? day} at ${fmtTime(raw)}` : (DAY_FULL[day] ?? day),
      }
    })
  }, [course])

  const preferredTime = slot === '__other'
    ? otherTime.trim()
    : slots.find(s => s.key === slot)?.label ?? ''

  const isOwnCourse = !!(teacher && userId && teacher.id === userId)
  const canSubmit   = !!preferredTime && !submitting && !isOwnCourse

  async function handleSubmit() {
    if (!course || !userId || !canSubmit) return
    setSubmitting(true)
    setApiError('')

    const { error } = await supabase.from('demo_requests').insert({
      course_id:      course.id,
      teacher_id:     course.teacher_id,
      student_id:     userId,
      student_note:   note.trim() || null,
      preferred_time: preferredTime,
    })

    setSubmitting(false)

    if (error) {
      // 23505 = the "one open request per course" unique index
      setApiError(
        error.code === '23505'
          ? 'You already have a demo request open for this course.'
          : 'Something went wrong sending your request. Please try again.'
      )
      return
    }
    setDone(true)
  }

  /* ── States ──────────────────────────────────────────────────────────────── */
  if (checking) {
    return <Shell><div className="dr-loading">Checking your account…</div></Shell>
  }

  if (notFound) {
    return (
      <Shell>
        <div className="dr-notfound">
          <h1 className="display">Course not available</h1>
          <p>This course may have been removed or is no longer accepting students.</p>
          <Link className="btn btn-primary" to="/tutors">Browse tutors</Link>
        </div>
      </Shell>
    )
  }

  if (!course || !teacher) {
    return <Shell><div className="dr-loading">Loading course…</div></Shell>
  }

  const price = fmtPrice(course.rate_per_hour, course.currency)

  /* ── Already requested ───────────────────────────────────────────────────── */
  if (existing && !done) {
    return (
      <Shell>
        <div className="dr-panel dr-panel--status">
          <span className={`dr-pill dr-pill--${existing.status}`}>
            {existing.status === 'accepted' ? 'Confirmed' : 'Awaiting the teacher'}
          </span>
          <h1 className="display">
            {existing.status === 'accepted'
              ? 'Your demo class is confirmed.'
              : 'Your request is with the teacher.'}
          </h1>
          <p className="dr-lede">
            {existing.status === 'accepted'
              ? `${teacher.name} accepted your demo for ${course.title}.`
              : `${teacher.name} has your request for ${course.title} and usually replies within a day.`}
          </p>

          {existing.preferred_time && (
            <div className="dr-rowfact">
              <span>Requested time</span>
              <b>{existing.preferred_time}</b>
            </div>
          )}

          {existing.status === 'accepted' && existing.meet_link && (
            <a className="btn btn-primary btn-lg" href={existing.meet_link} target="_blank" rel="noopener noreferrer">
              Join the class link
            </a>
          )}

          <div className="dr-panel-foot">
            <Link className="btn btn-outline" to="/dashboard">Go to my dashboard</Link>
            <Link className="btn btn-outline" to={`/courses/${course.id}`}>Back to course</Link>
          </div>
        </div>
      </Shell>
    )
  }

  /* ── Submitted ───────────────────────────────────────────────────────────── */
  if (done) {
    return (
      <Shell>
        <div className="dr-panel dr-panel--done">
          <span className="dr-check" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="display">Request sent to {teacher.name.split(' ')[0]}.</h1>
          <p className="dr-lede">
            Your free {course.demo_duration_min}-minute demo for <b>{course.title}</b> is
            waiting on the teacher to confirm. Nothing is charged either way.
          </p>

          <ol className="dr-next">
            <li><b>The teacher reviews it.</b> You'll see the decision on your dashboard, by email and on WhatsApp.</li>
            <li><b>You get a Google Meet link.</b> Sent as soon as the slot is confirmed.</li>
            <li><b>You sit the demo.</b> Continue only if it felt right — no obligation.</li>
          </ol>

          <div className="dr-panel-foot">
            <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
            <Link className="btn btn-outline" to="/tutors">Browse more tutors</Link>
          </div>
        </div>
      </Shell>
    )
  }

  /* ── Request form ────────────────────────────────────────────────────────── */
  return (
    <Shell>
      <div className="dr-crumb">
        <Link to="/tutors">Tutors</Link>
        <span className="sep">/</span>
        <Link to={`/courses/${course.id}`}>{course.title}</Link>
        <span className="sep">/</span>
        <span className="cur">Book a demo</span>
      </div>

      <div className="dr-grid">
        {/* ── Form column ── */}
        <div className="dr-main">
          <p className="eyebrow">Free demo class</p>
          <h1 className="dr-title display">
            Book your {course.demo_duration_min} minutes with {teacher.name.split(' ')[0]}.
          </h1>
          <p className="dr-lede">
            No payment, no card, no commitment. Pick the time that suits you and tell the
            teacher what you want to work on.
          </p>

          {isOwnCourse && (
            <div className="dr-warn">
              This is your own course — you can&rsquo;t request a demo on it.
            </div>
          )}

          {role === 'teacher' && !isOwnCourse && (
            <div className="dr-note">
              You&rsquo;re signed in as a teacher. The request will be sent from this account.
            </div>
          )}

          {/* Step 1 — time */}
          <section className="dr-step">
            <div className="dr-step-head">
              <span className="dr-num mono">01</span>
              <div>
                <h2>Pick a time</h2>
                <p>These are the slots {teacher.name.split(' ')[0]} already teaches this course.</p>
              </div>
            </div>

            {slots.length > 0 ? (
              <div className="dr-slots" role="group" aria-label="Preferred demo time">
                {slots.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    className="dr-slot"
                    aria-pressed={slot === s.key}
                    onClick={() => setSlot(s.key)}
                  >
                    <b>{s.day}</b>
                    <span>{s.time ?? 'Time to be agreed'}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="dr-slot dr-slot--other"
                  aria-pressed={slot === '__other'}
                  onClick={() => setSlot('__other')}
                >
                  <b>Another time</b>
                  <span>Suggest your own</span>
                </button>
              </div>
            ) : (
              <p className="dr-empty-slots">
                This course has no fixed weekly schedule yet — suggest a time that works for you.
              </p>
            )}

            {(slot === '__other' || slots.length === 0) && (
              <input
                className="dr-input"
                type="text"
                value={otherTime}
                maxLength={120}
                placeholder="e.g. Weekday evenings after 7pm, or Saturday morning"
                aria-label="Your preferred time"
                onChange={e => setOtherTime(e.target.value)}
              />
            )}
          </section>

          {/* Step 2 — note */}
          <section className="dr-step">
            <div className="dr-step-head">
              <span className="dr-num mono">02</span>
              <div>
                <h2>What do you want help with?</h2>
                <p>Optional, but it lets the teacher plan the 30 minutes properly.</p>
              </div>
            </div>
            <textarea
              className="dr-textarea"
              rows={4}
              maxLength={600}
              value={note}
              placeholder="e.g. I'm sitting CAIE A-Level in May. Mechanics is fine but I lose marks on circular motion and I've never done a full past paper under time."
              aria-label="What you want help with"
              onChange={e => setNote(e.target.value)}
            />
            <span className="dr-count">{note.length}/600</span>

            {course.topics?.length > 0 && (
              <div className="dr-topics">
                <span className="dr-topics-label">Topics on this course</span>
                <div className="dr-topic-chips">
                  {course.topics.slice(0, 8).map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      className="dr-topic"
                      onClick={() =>
                        setNote(n => (n.includes(t.heading) ? n : `${n ? n.trim() + ' ' : ''}${t.heading}. `))
                      }
                    >
                      + {t.heading}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {apiError && <div className="dr-error" role="alert">{apiError}</div>}

          <div className="dr-submit">
            <button
              className="btn btn-primary btn-lg"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {submitting ? 'Sending request…' : 'Send demo request'}
            </button>
            <span className="dr-submit-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              No payment is taken to request a demo.
            </span>
          </div>
        </div>

        {/* ── Summary rail ── */}
        <aside className="dr-aside" aria-label="Course summary">
          <div className="dr-card">
            <div className="dr-card-head">
              {teacher.avatarUrl ? (
                <img src={teacher.avatarUrl} alt="" className="dr-av dr-av--img" />
              ) : (
                <span className="dr-av" style={{ background: AVATAR_COLORS[teacher.colorIndex] }} aria-hidden="true">
                  {teacher.initials}
                </span>
              )}
              <div>
                <div className="dr-card-title">{course.title}</div>
                <div className="dr-card-sub">with {teacher.name}</div>
              </div>
            </div>

            <div className="dr-card-chips">
              <span className="dr-chip">{course.level}</span>
              {course.exam_board !== 'N/A' && <span className="dr-chip">{course.exam_board}</span>}
              <span className="dr-chip">{course.subject}</span>
            </div>

            <dl className="dr-facts">
              <div>
                <dt>Demo class</dt>
                <dd><b>Free</b> · {course.demo_duration_min} min</dd>
              </div>
              <div>
                <dt>After the demo</dt>
                <dd>{price} / hour</dd>
              </div>
              <div>
                <dt>Regular class</dt>
                <dd>{course.class_duration_min} min</dd>
              </div>
              {teacher.yearsExp ? (
                <div>
                  <dt>Experience</dt>
                  <dd>{teacher.yearsExp} {teacher.yearsExp === 1 ? 'year' : 'years'} teaching</dd>
                </div>
              ) : null}
            </dl>

            <div className="dr-selected">
              <span>Your slot</span>
              <b>{preferredTime || 'Not chosen yet'}</b>
            </div>

            <Link className="dr-card-link" to={`/courses/${course.id}`}>
              View the full course
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </aside>
      </div>
    </Shell>
  )
}

/* ── Page chrome ───────────────────────────────────────────────────────────── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dr-page">
      <Navbar />
      <main className="wrap dr-wrap">{children}</main>
      <Footer />
    </div>
  )
}
