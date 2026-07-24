import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { colorIndexFromName, initialsOf, fmtPrice } from '../lib/catalog'

/* ══════════════════════════════════════════════════════════════════════════════
   Everything the student dashboard shows, derived from real rows.

   Sessions are not stored individually — a course carries a weekly recurrence
   (days_of_week + class_times), so the next occurrences are projected forward
   from the enrolment. That is a computation over real data, not a placeholder.
══════════════════════════════════════════════════════════════════════════════ */

export type UpcomingSession = {
  key:        string
  initials:   string
  color:      number
  name:       string
  subject:    string
  date:       string
  time:       string
  status:     'soon' | 'confirmed' | 'demo'
  statusText: string
  meetLink:   string | null
  at:         Date | null
}

export type DashTutor = {
  id:       string
  initials: string
  color:    number
  name:     string
  subject:  string
  desc:     string
  courseId: string
}

export type DashNotification = {
  id:       string
  initials: string
  color:    number
  name:     string
  time:     string
  text:     string
  unread:   boolean
  url:      string | null
}

export type DashRecommendation = {
  courseId: string
  initials: string
  color:    number
  name:     string
  sub:      string
  meta:     string
}

export type DashStat = {
  value: string
  label: string
  tone:  'ever' | 'saff' | 'succ' | 'terr'
  icon:  'calendar' | 'users' | 'check' | 'star'
}

export type StudentDashboard = {
  loading:        boolean
  isNew:          boolean
  stats:          DashStat[]
  sessions:       UpcomingSession[]
  nextSession:    UpcomingSession | null
  tutors:         DashTutor[]
  notifications:  DashNotification[]
  unreadCount:    number
  recommendation: DashRecommendation | null
  tutorCount:     number
}

/* ── Time helpers ───────────────────────────────────────────────────────────── */

const DAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

/** Next time this weekday + "HH:MM" comes round, starting from now. */
function nextOccurrence(dayAbbr: string, time: string | undefined): Date | null {
  const target = DAY_INDEX[dayAbbr]
  if (target === undefined) return null

  const [h, m] = (time ?? '00:00').split(':').map(n => parseInt(n, 10))
  if (Number.isNaN(h)) return null

  const now = new Date()
  const d = new Date(now)
  d.setHours(h, m || 0, 0, 0)

  let delta = (target - d.getDay() + 7) % 7
  if (delta === 0 && d.getTime() <= now.getTime()) delta = 7
  d.setDate(d.getDate() + delta)
  return d
}

function fmtDayLabel(d: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const that  = new Date(d); that.setHours(0, 0, 0, 0)
  const days  = Math.round((that.getTime() - today.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fmtClock(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?([ap])m/i, ' $1m')
}

function fmtRange(start: Date, durationMin: number): string {
  const end = new Date(start.getTime() + durationMin * 60000)
  return `${fmtClock(start)} – ${fmtClock(end)}`
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1)    return 'now'
  if (mins < 60)   return `${mins}m`
  if (mins < 1440) return `${Math.floor(mins / 60)}h`
  if (mins < 2880) return 'Yesterday'
  return `${Math.floor(mins / 1440)}d`
}

/* ── Row shapes ─────────────────────────────────────────────────────────────── */

type CourseLite = {
  id: string
  title: string
  subject: string
  level: string
  exam_board: string
  rate_per_hour: number
  currency: string
  class_duration_min: number
  days_of_week: string[]
  class_times: Record<string, string>
}

type TeacherLite = {
  first_name: string | null
  last_name: string | null
  bio: string | null
}

type EnrollmentRow = {
  id: string
  course_id: string
  teacher_id: string
  status: string
  sessions_per_week: number
  courses: CourseLite | null
  teacher: TeacherLite | null
}

type DemoRow = {
  id: string
  course_id: string
  teacher_id: string
  status: string
  scheduled_at: string | null
  preferred_time: string | null
  meet_link: string | null
  courses: { title: string; level: string; demo_duration_min: number } | null
  teacher: TeacherLite | null
}

type NotificationRow = {
  id: string
  type: string
  title: string
  body: string | null
  action_url: string | null
  read_at: string | null
  created_at: string
}

function nameOf(t: TeacherLite | null): string {
  return [t?.first_name, t?.last_name].filter(Boolean).join(' ') || 'Your teacher'
}

/* ══════════════════════════════════════════════════════════════════════════════
   HOOK
══════════════════════════════════════════════════════════════════════════════ */
export function useStudentDashboard(userId: string | null): StudentDashboard {
  const [state, setState] = useState<StudentDashboard>({
    loading: true, isNew: true, stats: [], sessions: [], nextSession: null,
    tutors: [], notifications: [], unreadCount: 0, recommendation: null, tutorCount: 0,
  })

  useEffect(() => {
    if (!userId) return
    let alive = true

    async function load() {
      const [enrRes, demoRes, notifRes, catalogRes] = await Promise.all([
        supabase.from('enrollments')
          .select(`
            id, course_id, teacher_id, status, sessions_per_week,
            courses ( id, title, subject, level, exam_board, rate_per_hour, currency,
                      class_duration_min, days_of_week, class_times ),
            teacher:profiles!teacher_id ( first_name, last_name, bio )
          `)
          .eq('student_id', userId!),
        supabase.from('demo_requests')
          .select(`
            id, course_id, teacher_id, status, scheduled_at, preferred_time, meet_link,
            courses ( title, level, demo_duration_min ),
            teacher:profiles!teacher_id ( first_name, last_name, bio )
          `)
          .eq('student_id', userId!)
          .order('created_at', { ascending: false }),
        supabase.from('notifications')
          .select('id, type, title, body, action_url, read_at, created_at')
          .eq('user_id', userId!)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('courses')
          .select(`
            id, teacher_id, title, subject, level, exam_board, rate_per_hour, currency,
            teacher:profiles!teacher_id ( first_name, last_name )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(24),
      ])

      if (!alive) return

      const enrollments = (enrRes.data  as unknown as EnrollmentRow[])  ?? []
      const demos       = (demoRes.data as unknown as DemoRow[])        ?? []
      const notifRows   = (notifRes.data as NotificationRow[])          ?? []
      const catalog     = (catalogRes.data as unknown as (CourseLite & {
        teacher_id: string
        teacher: { first_name: string | null; last_name: string | null } | null
      })[]) ?? []

      const liveEnrollments = enrollments.filter(e =>
        e.status === 'active' || e.status === 'pending_payment' || e.status === 'paused')

      /* ── Upcoming sessions ────────────────────────────────────────────────
         Weekly classes projected from each live enrolment, plus any confirmed
         demo class. */
      const sessions: UpcomingSession[] = []

      for (const e of liveEnrollments) {
        const c = e.courses
        if (!c) continue
        const teacher = nameOf(e.teacher)
        for (const day of c.days_of_week ?? []) {
          const time = c.class_times?.all ?? c.class_times?.[day]
          const at = nextOccurrence(day, time)
          if (!at) continue
          const soon = at.getTime() - Date.now() < 2 * 3600_000
          sessions.push({
            key:        `${e.id}-${day}`,
            initials:   initialsOf(e.teacher?.first_name ?? null, e.teacher?.last_name ?? null),
            color:      colorIndexFromName(teacher),
            name:       teacher,
            subject:    `${c.level} ${c.subject} · ${c.title}`,
            date:       fmtDayLabel(at),
            time:       fmtRange(at, c.class_duration_min || 60),
            status:     soon ? 'soon' : 'confirmed',
            statusText: soon ? 'Starts soon' : e.status === 'pending_payment' ? 'Awaiting payment' : 'Confirmed',
            meetLink:   null,
            at,
          })
        }
      }

      for (const d of demos.filter(x => x.status === 'accepted')) {
        const teacher = nameOf(d.teacher)
        const at = d.scheduled_at ? new Date(d.scheduled_at) : null
        sessions.push({
          key:        d.id,
          initials:   initialsOf(d.teacher?.first_name ?? null, d.teacher?.last_name ?? null),
          color:      colorIndexFromName(teacher),
          name:       teacher,
          subject:    `${d.courses?.level ?? ''} ${d.courses?.title ?? 'Course'} · Free demo class`.trim(),
          date:       at ? fmtDayLabel(at) : 'Time to confirm',
          time:       at
            ? fmtRange(at, d.courses?.demo_duration_min || 30)
            : d.preferred_time || 'Teacher will confirm',
          status:     'demo',
          statusText: 'Free demo',
          meetLink:   d.meet_link,
          at,
        })
      }

      // Soonest first; anything without a fixed time sits at the end.
      sessions.sort((a, b) => {
        if (!a.at) return 1
        if (!b.at) return -1
        return a.at.getTime() - b.at.getTime()
      })

      /* ── Tutors the student is actually working with ─────────────────────── */
      const tutorMap = new Map<string, DashTutor>()

      for (const e of liveEnrollments) {
        if (!e.courses || tutorMap.has(e.teacher_id)) continue
        const name = nameOf(e.teacher)
        const weekly = e.sessions_per_week
        tutorMap.set(e.teacher_id, {
          id:       e.teacher_id,
          initials: initialsOf(e.teacher?.first_name ?? null, e.teacher?.last_name ?? null),
          color:    colorIndexFromName(name),
          name,
          subject:  `${e.courses.level} ${e.courses.subject}`,
          desc:     `${e.courses.title} · ${weekly} ${weekly === 1 ? 'class' : 'classes'} a week.` +
                    (e.status === 'pending_payment' ? ' Starts once payment is complete.' : ''),
          courseId: e.course_id,
        })
      }

      for (const d of demos) {
        if (tutorMap.has(d.teacher_id)) continue
        if (!['accepted', 'completed', 'pending'].includes(d.status)) continue
        const name = nameOf(d.teacher)
        tutorMap.set(d.teacher_id, {
          id:       d.teacher_id,
          initials: initialsOf(d.teacher?.first_name ?? null, d.teacher?.last_name ?? null),
          color:    colorIndexFromName(name),
          name,
          subject:  `${d.courses?.level ?? ''} ${d.courses?.title ?? ''}`.trim() || 'Course',
          desc:     d.status === 'completed'
            ? 'Demo class done — you can register for the course.'
            : d.status === 'accepted'
              ? 'Demo class confirmed. You have not enrolled yet.'
              : 'Demo requested — waiting for the teacher to confirm.',
          courseId: d.course_id,
        })
      }

      const tutors = Array.from(tutorMap.values())

      /* ── Notifications ───────────────────────────────────────────────────── */
      const notifications: DashNotification[] = notifRows.map(n => ({
        id:       n.id,
        initials: (n.title[0] ?? 'U').toUpperCase(),
        color:    colorIndexFromName(n.type),
        name:     n.title,
        time:     timeAgo(n.created_at),
        text:     n.body ?? '',
        unread:   !n.read_at,
        url:      n.action_url,
      }))

      /* ── A course they haven't touched yet ───────────────────────────────── */
      const seen = new Set([
        ...enrollments.map(e => e.course_id),
        ...demos.map(d => d.course_id),
      ])
      const candidate = catalog.find(c => !seen.has(c.id)) ?? null
      const recommendation: DashRecommendation | null = candidate
        ? {
            courseId: candidate.id,
            initials: initialsOf(
              candidate.teacher?.first_name ?? null,
              candidate.teacher?.last_name ?? null
            ),
            color: colorIndexFromName(
              [candidate.teacher?.first_name, candidate.teacher?.last_name]
                .filter(Boolean).join(' ') || candidate.title
            ),
            name: [candidate.teacher?.first_name, candidate.teacher?.last_name]
              .filter(Boolean).join(' ') || 'Teacher',
            sub:  `${candidate.level} ${candidate.subject}` +
                  (candidate.exam_board !== 'N/A' ? ` · ${candidate.exam_board}` : ''),
            meta: `${fmtPrice(candidate.rate_per_hour, candidate.currency)}/hr · free demo first`,
          }
        : null

      /* ── Stat chips ──────────────────────────────────────────────────────── */
      const completedDemos = demos.filter(d => d.status === 'completed').length
      const stats: DashStat[] = [
        { value: String(sessions.length),        label: sessions.length === 1 ? 'upcoming session' : 'upcoming sessions', tone: 'ever', icon: 'calendar' },
        { value: String(tutors.length),          label: tutors.length === 1 ? 'tutor' : 'tutors',                          tone: 'saff', icon: 'users'    },
        { value: String(liveEnrollments.length), label: liveEnrollments.length === 1 ? 'course enrolled' : 'courses enrolled', tone: 'succ', icon: 'check' },
        { value: String(completedDemos),         label: completedDemos === 1 ? 'demo completed' : 'demos completed',       tone: 'terr', icon: 'star'     },
      ]

      setState({
        loading:      false,
        isNew:        liveEnrollments.length === 0 && demos.length === 0,
        stats,
        sessions:     sessions.slice(0, 6),
        nextSession:  sessions.find(s => s.at !== null) ?? null,
        tutors,
        notifications,
        unreadCount:  notifications.filter(n => n.unread).length,
        recommendation,
        tutorCount:   new Set(catalog.map(c => c.teacher_id)).size,
      })
    }

    load()
    return () => { alive = false }
  }, [userId])

  return state
}
