import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Navbar  from '../../components/Navbar/Navbar'
import Footer  from '../../components/Footer/Footer'
import './CoursePage.css'

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface CourseData {
  id: string
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
  course_type: 'recurring' | 'fixed'
  duration_months: number | null
  topics: { heading: string; plan: string }[]
  teaching_bullets: string[]
  lesson_plan_url: string | null
  banner_url: string | null
  teacher_id: string
}

interface TeacherData {
  first_name: string
  last_name: string | null
  avatar_url: string | null
  bio: string | null
  years_exp: number | null
  city: string | null
  country: string | null
  education: { degree: string; field: string; institution: string; year: string }[]
}

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const DAY_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
}

function fmt24(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === '00' ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`
}

function fmtTimeRange(start: string, durationMin: number): string {
  const [hStr, mStr] = start.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr || '0', 10)
  const totalMin = h * 60 + m + durationMin
  const endH = Math.floor(totalMin / 60) % 24
  const endM = totalMin % 60
  const endStr = `${endH}:${endM.toString().padStart(2, '0')}`
  return `${fmt24(start)} – ${fmt24(endStr)}`
}

function fmtPrice(rate: number, currency: string): string {
  return currency === 'USD' ? `$${rate.toLocaleString()}` : `Rs ${rate.toLocaleString('en-PK')}`
}

function topicWeeks(i: number, total: number, dur: number | null): string {
  if (!dur) return `Week ${i + 1}`
  const wpt = dur / total
  const start = Math.round(i * wpt) + 1
  const end   = Math.round((i + 1) * wpt)
  return start === end ? `Week ${start}` : `Weeks ${start}–${end}`
}

/* time string for booking card: e.g. "Evenings 6:00pm · Sat 11:00am" */
function timeLabel(days: string[], times: Record<string, string>): string {
  if (!times || days.length === 0) return ''
  if (times.all) return `${fmt24(times.all)} each session`
  const parts = days.map(d => times[d] ? `${d} ${fmt24(times[d])}` : null).filter(Boolean)
  return parts.join(' · ')
}

/* ── Fetch ───────────────────────────────────────────────────────────────────── */
async function fetchCourse(courseId: string): Promise<{
  course: CourseData
  teacher: TeacherData
  enrolledCount: number
} | null> {
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('status', 'approved')
    .eq('is_active', true)
    .single()

  if (!course) return null

  const [profRes, appRes, enrollRes] = await Promise.all([
    supabase.from('profiles')
      .select('first_name, last_name, avatar_url, bio')
      .eq('id', course.teacher_id)
      .single(),
    // teacher_public (migration 009) — teacher_applications is RLS-locked to
    // self/admin, so an anonymous visitor would read nothing from it.
    supabase.from('teacher_public')
      .select('years_exp, city, country, education')
      .eq('id', course.teacher_id)
      .maybeSingle(),
    supabase.from('demo_requests')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .in('status', ['accepted', 'completed']),
  ])

  const prof = profRes.data
  const app  = appRes.data

  const teacher: TeacherData = {
    first_name: prof?.first_name ?? '',
    last_name:  prof?.last_name  ?? null,
    avatar_url: prof?.avatar_url ?? null,
    bio:        prof?.bio ?? null,
    years_exp:  app?.years_exp   ?? null,
    city:       app?.city        ?? null,
    country:    app?.country === 'PK' ? 'Pakistan' : (app?.country ?? null),
    education:  (app?.education ?? []) as TeacherData['education'],
  }

  return {
    course: course as CourseData,
    teacher,
    enrolledCount: enrollRes.count ?? 0,
  }
}

/* ── Avatar helpers ──────────────────────────────────────────────────────────── */
const AV_COLORS = ['av-c0','av-c1','av-c2','av-c3','av-c4','av-c7']
function avColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AV_COLORS[h % AV_COLORS.length]
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const heroRef = useRef<HTMLElement>(null)
  const [data,     setData]     = useState<Awaited<ReturnType<typeof fetchCourse>>>(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sbShow,   setSbShow]   = useState(false)

  useEffect(() => {
    if (!id) return
    fetchCourse(id).then(d => {
      if (d) setData(d)
      else setNotFound(true)
      setLoading(false)
    })
  }, [id])

  /* sticky bar on scroll past hero */
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setSbShow(!e.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [data])

  if (loading)  return <LoadingSkeleton />
  if (notFound || !data) return <NotFound />

  const { course, teacher, enrolledCount } = data
  const teacherName = [teacher.first_name, teacher.last_name].filter(Boolean).join(' ') || 'Teacher'
  const ini         = ((teacher.first_name[0] ?? '') + (teacher.last_name?.[0] ?? '')).toUpperCase()
  const avCls       = avColor(teacherName)
  const location    = [teacher.city, teacher.country].filter(Boolean).join(', ')
  const durationLabel = course.course_type === 'fixed' && course.duration_months
    ? `${course.duration_months * 4}-week course`
    : 'Ongoing weekly classes'
  const price       = fmtPrice(course.rate_per_hour, course.currency)
  const timeLbl     = timeLabel(course.days_of_week ?? [], course.class_times ?? {})
  const offDays     = ALL_DAYS.filter(d => !(course.days_of_week ?? []).includes(d))
  const profileHref = `/tutors/${course.teacher_id}`
  const bookHref    = `/courses/${course.id}/demo`

  /* enrolled avatar colours — pick 3 distinct ones */
  const enrollAvs = ['av-c0','av-c1','av-c7']

  return (
    <div className="cp-page">
      <Navbar />

      {/* ── Sticky compact bar ── */}
      <div className={`csticky${sbShow ? ' show' : ''}`} aria-hidden={!sbShow}>
        <div className="wrap csticky-inner">
          <div>
            <div className="csb-title">{course.title}</div>
            <div className="csb-meta">
              <span>with {teacher.first_name}</span>
              <span>·</span>
              <span>{durationLabel}</span>
            </div>
          </div>
          <div className="csb-right">
            <div className="csb-price">
              {price}
              <span>per hour</span>
            </div>
            <Link className="btn btn-primary btn-sm" to={bookHref}>Book free demo</Link>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="crumb-bar">
        <div className="wrap crumb-inner">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to="/tutors" className="hide-sm">Courses</Link>
          <span className="sep hide-sm">/</span>
          <Link to={profileHref} className="hide-sm">{course.subject}</Link>
          <span className="sep hide-sm">/</span>
          <span className="cur">{course.title}</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        className="chero"
        id="chero"
        ref={heroRef}
        style={course.banner_url ? { backgroundImage: `url(${course.banner_url})` } : undefined}
      >
        <div className="chero-grain" />
        {course.banner_url && <div className="chero-banner-scrim" />}
        <div className="wrap chero-inner">
          <div className="chero-chips">
            <span className="cchip level">{course.level}</span>
            {course.exam_board !== 'N/A' && (
              <span className="cchip board">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/></svg>
                {course.exam_board}
              </span>
            )}
            <span className="cchip type">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
              {durationLabel}
            </span>
          </div>

          <h1>{course.title}</h1>

          {course.description && (
            <p className="clede">{course.description}</p>
          )}

          <div className="chero-teacher">
            {teacher.avatar_url ? (
              <img src={teacher.avatar_url} alt="" className={`av ${avCls} chero-av-img`} />
            ) : (
              <span className={`av ${avCls}`} aria-hidden="true">{ini}</span>
            )}
            <div>
              <div className="ct-name">
                Taught by <Link to={profileHref}>{teacherName}</Link>
              </div>
              {(teacher.years_exp || location) && (
                <div className="ct-meta">
                  {[teacher.years_exp ? `${teacher.years_exp} years teaching` : null, location].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            {teacher.education?.length > 0 && (
              <>
                <span className="ct-div" />
                <div className="ct-fact">
                  <b>{teacher.education[0].institution}</b>
                  <span>{[teacher.education[0].degree, teacher.education[0].field].filter(Boolean).join(' ')}</span>
                </div>
              </>
            )}
          </div>

          <div className="chero-cta">
            <div className="price">
              <b>{price}</b>
              <span>/ hour</span>
            </div>
            <Link className="btn btn-saffron btn-lg" to={bookHref}>
              Book free demo →
            </Link>
            <span className="demo-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 12.5 11 15.5 16 9"/><circle cx="12" cy="12" r="9.2"/></svg>
              First {course.demo_duration_min || 30}-minute class is free
            </span>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <main className="wrap course">
        <div className="ccols">

          {/* ════ LEFT — MAIN ════ */}
          <div className="cmain">

            {/* METHODOLOGY */}
            {course.teaching_bullets?.length > 0 && (
              <section className="cblock">
                <h2>
                  <span className="hicon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>
                  </span>
                  How this course works
                </h2>
                <div className="method-list">
                  {course.teaching_bullets.map((b, i) => (
                    <div key={i} className="method-item">
                      <span className="mi-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                      </span>
                      <p>{b}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {course.teaching_bullets?.length > 0 && course.topics?.length > 0 && (
              <hr className="cblock-divider" />
            )}

            {/* SYLLABUS */}
            {course.topics?.length > 0 && (
              <section className="cblock">
                <h2>
                  <span className="hicon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </span>
                  What we'll cover
                </h2>
                <div className="syllabus">
                  {course.topics.map((t, i) => (
                    <div key={i} className="syl-item">
                      <span className="syl-num">{i + 1}</span>
                      <div className="syl-body">
                        <div className="syl-head">{t.heading}</div>
                        {t.plan && <p className="syl-note">{t.plan}</p>}
                        <div className="syl-weeks">
                          {topicWeeks(i, course.topics.length, course.duration_months ? course.duration_months * 4 : null)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {course.topics?.length > 0 && <hr className="cblock-divider" />}

            {/* SCHEDULE */}
            {course.days_of_week?.length > 0 && (
              <section className="cblock">
                <h2>
                  <span className="hicon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
                  </span>
                  Weekly schedule
                </h2>
                <div className="schedule">
                  {course.days_of_week.map(d => {
                    const rawT = course.class_times?.all || course.class_times?.[d] || null
                    const dur   = course.class_duration_min || 60
                    const tStr  = rawT
                      ? fmtTimeRange(rawT, dur)
                      : 'Time TBC'
                    return (
                      <div key={d} className="sched-row">
                        <span className="sd-day">{DAY_FULL[d] ?? d}</span>
                        <span className="sd-time">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                          {tStr}
                        </span>
                        <span className="sd-dur">{dur} min</span>
                      </div>
                    )
                  })}
                  {offDays.length > 0 && (
                    <div className="sched-row off">
                      <span className="sd-day">{offDays.join(' · ')}</span>
                      <span className="sd-time">No scheduled class</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {course.days_of_week?.length > 0 && <hr className="cblock-divider" />}

            {/* LESSON PLAN */}
            {course.lesson_plan_url && (
              <>
                <section className="cblock">
                  <h2>
                    <span className="hicon">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    </span>
                    Lesson plan
                  </h2>
                  <a className="lessonplan" href={course.lesson_plan_url} target="_blank" rel="noopener noreferrer" download>
                    <span className="lp-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg>
                    </span>
                    <div className="lp-main">
                      <div className="lp-name">{course.title} — Lesson Plan</div>
                      <div className="lp-meta">PDF · week-by-week breakdown with learning outcomes</div>
                    </div>
                    <span className="btn btn-outline btn-sm">Download</span>
                  </a>
                </section>
                <hr className="cblock-divider" />
              </>
            )}

            {/* ABOUT TEACHER */}
            <section className="cblock">
              <h2>
                <span className="hicon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </span>
                About the teacher
              </h2>
              <div className="teacher-card">
                <div className="tc-top">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacherName} className={`av ${avCls} tc-av-img`} />
                  ) : (
                    <span className={`av ${avCls}`} aria-hidden="true">{ini}</span>
                  )}
                  <div>
                    <div className="tct-name">{teacherName}</div>
                    <div className="tct-meta">
                      {teacher.years_exp && <span>{teacher.years_exp} years teaching</span>}
                      {teacher.years_exp && location && <span>·</span>}
                      {location && <span>{location}</span>}
                    </div>
                  </div>
                  <Link className="btn btn-outline btn-sm tct-link" to={profileHref}>
                    View full profile →
                  </Link>
                </div>

                {teacher.bio && (
                  <div className="tct-bio">
                    {teacher.bio.split('\n').filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

                {teacher.education?.length > 0 && (
                  <>
                    <div className="edu-label">Verified education</div>
                    <div className="edu-grid">
                      {teacher.education.map((e, i) => (
                        <div key={i} className="edu">
                          <span className="ei">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/></svg>
                          </span>
                          <div className="ed">
                            <b>{[e.degree, e.field].filter(Boolean).join(' ')}</b>
                            <span>{[e.institution, e.year].filter(Boolean).join(' · ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

          </div>

          {/* ════ RIGHT — STICKY BOOKING ════ */}
          <aside className="caside" aria-label="Book this course">
            <div className="bookcard">

              <div className="bc-head">
                <div className="bc-price">
                  <b>{price}</b>
                  <span className="per">/ hour</span>
                  {course.exam_board !== 'N/A' && (
                    <span className="typ">{course.level} · {course.exam_board}</span>
                  )}
                </div>
                <div className="bc-demo">
                  <span className="pin">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 3v18l7-5 7 5V3z"/></svg>
                  </span>
                  <div>
                    <b>First class is free</b>
                    <span>{course.demo_duration_min || 30}-minute demo · no commitment</span>
                  </div>
                </div>
              </div>

              <div className="bc-body">
                <div className="bc-label">Class days</div>
                <div className="day-chips">
                  {ALL_DAYS.map(d => (
                    <span
                      key={d}
                      className={`day-chip${(course.days_of_week ?? []).includes(d) ? ' on' : ''}`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                {timeLbl && (
                  <div className="bc-time">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                    {timeLbl}
                  </div>
                )}
                <div className="bc-dur">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
                  {durationLabel} · {course.days_of_week?.length ?? 0} {course.days_of_week?.length === 1 ? 'class' : 'classes'} per week
                </div>
              </div>

              <div className="bc-foot">
                <Link className="btn btn-primary btn-block btn-lg" to={bookHref}>
                  Book free demo
                </Link>
                <Link className="btn btn-outline btn-block" to={profileHref}>
                  View teacher profile
                </Link>
                <div className="bc-trust">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  No payment required to book a demo.
                </div>
              </div>

              {enrolledCount > 0 && (
                <div className="bc-enrolled">
                  <div className="av-row">
                    {enrollAvs.map(c => (
                      <span key={c} className={`av ${c}`} aria-hidden="true" />
                    ))}
                  </div>
                  <span><b>{enrolledCount} {enrolledCount === 1 ? 'student' : 'students'}</b> enrolled in this course</span>
                </div>
              )}

            </div>
          </aside>

        </div>
      </main>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="mcta" aria-label="Quick actions">
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', flex:'0 0 auto' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:500, lineHeight:1 }}>{price}</span>
          <span style={{ fontSize:11, color:'var(--slate)' }}>free demo first</span>
        </div>
        <Link className="btn btn-primary" to={bookHref} style={{ flex:1 }}>
          Book free demo
        </Link>
      </div>
    </div>
  )
}

/* ── Loading skeleton ─────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="cp-page">
      <Navbar />
      <div className="chero" style={{ minHeight: 340 }}>
        <div className="wrap chero-inner">
          <div className="cskel cskel--chips" />
          <div className="cskel cskel--title" />
          <div className="cskel cskel--sub" />
        </div>
      </div>
      <Footer />
    </div>
  )
}

/* ── Not found ────────────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div className="cp-page">
      <Navbar />
      <div className="cp-notfound">
        <h1>Course not found</h1>
        <p>This course may have been removed or is no longer available.</p>
        <Link className="btn btn-primary" to="/tutors">Browse tutors</Link>
      </div>
      <Footer />
    </div>
  )
}
