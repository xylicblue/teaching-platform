import { useRef, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { PROFILES, AVATAR_COLORS } from '../../data/profileData'
import type { TutorProfile, AvailDay, Credential } from '../../data/profileData'
import Navbar         from '../../components/Navbar/Navbar'
import Breadcrumb     from '../../components/profile/Breadcrumb/Breadcrumb'
import StickyBar      from '../../components/profile/StickyBar/StickyBar'
import ProfileHero    from '../../components/profile/ProfileHero/ProfileHero'
import BookingCard    from '../../components/profile/BookingCard/BookingCard'
import {
  ProfileAbout,
  ProfileSubjects,
  ProfileResults,
  ProfileCredentials,
} from '../../components/profile/ProfileSections/ProfileSections'
import ProfileReviews from '../../components/profile/ProfileReviews/ProfileReviews'
import ProfileFAQ     from '../../components/profile/ProfileFAQ/ProfileFAQ'
import SimilarTutors  from '../../components/profile/SimilarTutors/SimilarTutors'
import Footer         from '../../components/Footer/Footer'
import './TutorProfilePage.css'

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const DAYS_ORDER = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function colorIndexFromName(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h % AVATAR_COLORS.length
}

function initials(first: string, last: string | null): string {
  return ((first[0] ?? '') + (last?.[0] ?? '')).toUpperCase()
}

/** Convert "17:30" → "5:30pm", "09:00" → "9:00am" */
function fmt24(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === '00' ? `${h12}${suffix}` : `${h12}:${m}${suffix}`
}

/** Build availability week from multiple courses' days_of_week + class_times */
function buildAvailability(
  courses: { days_of_week: string[]; class_times: Record<string, string> }[]
): AvailDay[] {
  const dayMap: Record<string, Set<string>> = {}
  DAYS_ORDER.forEach(d => { dayMap[d] = new Set() })

  for (const course of courses) {
    const days = course.days_of_week ?? []
    const times = course.class_times ?? {}
    for (const day of days) {
      if (!dayMap[day]) continue
      const t = times.all ? times.all : times[day]
      if (t) dayMap[day].add(fmt24(t))
    }
  }

  return DAYS_ORDER.map(day => ({
    has:   dayMap[day].size > 0,
    times: Array.from(dayMap[day]),
  }))
}

/** Build headline from courses or subjects_interest */
function buildHeadline(
  courses: { subject: string; level: string; exam_board: string }[],
  subjectsInterest: { name: string; exam_boards: string[] }[]
): string {
  if (courses.length > 0) {
    const c = courses[0]
    const board = c.exam_board !== 'N/A' ? ` · ${c.exam_board}` : ''
    return `${c.level} ${c.subject} Specialist${board}`
  }
  if (subjectsInterest.length > 0) {
    const s = subjectsInterest[0]
    const board = s.exam_boards?.[0] ? ` · ${s.exam_boards[0]}` : ''
    return `${s.name} Tutor${board}`
  }
  return 'Private Tutor'
}

/** Build credentials from education array */
function buildCredentials(
  education: { degree: string; field: string; institution: string; year: string }[],
  hasCnic: boolean
): Credential[] {
  const creds: Credential[] = (education ?? []).map(e => ({
    icon:  'degree' as const,
    title: [e.degree, e.field].filter(Boolean).join(' — '),
    sub:   [e.institution, e.year].filter(Boolean).join(' · '),
  }))
  if (hasCnic) {
    creds.push({ icon: 'id', title: 'National ID verified', sub: 'CNIC submitted and checked' })
  }
  return creds
}

const DEFAULT_FAQ = [
  { q: 'How does the free demo class work?',
    a: "Request any open slot — no payment needed. You'll get a Google Meet link by email. The demo is a chance for the teacher to assess where you are and show you how they teach. No obligation to continue." },
  { q: 'Can lessons be recorded?',
    a: "Yes. Sessions can be recorded on Google Meet and saved to your own Google Drive folder so you can rewatch any explanation at any time." },
  { q: 'What happens after the demo?',
    a: "If it felt right, you book your first paid lesson and pick a regular weekly time. If not, you owe nothing." },
]

/* ── Fetch live teacher profile ────────────────────────────────────────────── */
async function fetchTeacherProfile(teacherId: string): Promise<TutorProfile | null> {
  // Profile row (includes editable bio)
  const { data: prof } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, role, bio')
    .eq('id', teacherId)
    .single()

  if (!prof || !['teacher', 'admin'].includes(prof.role)) return null

  // Teacher application
  const { data: app } = await supabase
    .from('teacher_applications')
    .select('bio, years_exp, education, city, country, subjects_interest, teaching_levels, cnic_number')
    .eq('user_id', teacherId)
    .maybeSingle()

  // Approved active courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, subject, level, exam_board, rate_per_hour, currency, days_of_week, class_times, teaching_bullets, demo_duration_min')
    .eq('teacher_id', teacherId)
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const liveCourses  = (courses ?? []) as {
    id: string; title: string; subject: string; level: string; exam_board: string
    rate_per_hour: number; currency: string; days_of_week: string[]
    class_times: Record<string, string>; teaching_bullets: string[]
    demo_duration_min: number
  }[]

  const education    = (app?.education ?? []) as { degree: string; field: string; institution: string; year: string }[]
  const subjectsInt  = (app?.subjects_interest ?? []) as { name: string; exam_boards: string[] }[]
  const name         = [prof.first_name, prof.last_name].filter(Boolean).join(' ') || 'Teacher'
  const yearsExp     = app?.years_exp ?? 1
  // prefer profiles.bio (teacher-editable); fall back to application snapshot
  const bio          = prof.bio || app?.bio || ''
  const city         = app?.city ?? ''
  const country      = app?.country ?? ''
  const location     = [city, country].filter(Boolean).join(', ') || 'Pakistan'
  const hasCnic      = !!(app?.cnic_number)

  // availability: merge across all courses
  const availability = liveCourses.length > 0
    ? buildAvailability(liveCourses)
    : DAYS_ORDER.map(() => ({ has: false, times: [] }))

  const firstPrice = liveCourses[0]?.rate_per_hour ?? 0
  const firstCurr  = liveCourses[0]?.currency ?? 'PKR'
  const demoMins   = liveCourses[0]?.demo_duration_min ?? 30

  // teaching bullets from all courses, deduplicated
  const allBullets = Array.from(
    new Set(liveCourses.flatMap(c => c.teaching_bullets ?? []).filter(Boolean))
  ).slice(0, 6)

  return {
    id:           teacherId,
    name,
    initials:     initials(prof.first_name ?? '', prof.last_name ?? null),
    colorIndex:   colorIndexFromName(name),
    avatarUrl:    prof.avatar_url ?? null,
    headline:     buildHeadline(liveCourses, subjectsInt),
    location,
    languages:    ['English', 'Urdu'],
    online:       false,
    rating:       0,
    reviews:      0,
    lessons:      0,
    responseTime: '< 24 hrs',
    yearsExp,
    price:        firstPrice,
    quote:        bio.slice(0, 180).replace(/\.$/, '') || `I help students understand the subject and perform under exam conditions.`,
    aboutShort:   bio || `${name} is an experienced tutor specialising in ${buildHeadline(liveCourses, subjectsInt)}.`,
    aboutLong:    allBullets.length > 0
      ? `My approach: ${allBullets.join('. ')}.`
      : '',
    aboutFacts: [
      yearsExp > 0  && { value: `${yearsExp} yrs`, label: 'Teaching experience' },
      firstCurr === 'PKR' && firstPrice > 0
        ? { value: `PKR ${firstPrice.toLocaleString('en-PK')}`, label: 'per hour · demo is free' }
        : firstPrice > 0
        ? { value: `USD ${firstPrice}`, label: 'per hour · demo is free' }
        : null,
      demoMins > 0  && { value: `${demoMins} min`, label: 'free demo session' },
    ].filter(Boolean) as { value: string; label: string }[],
    subjects: liveCourses.map(c => ({
      id:       c.id,
      code:     c.exam_board !== 'N/A' ? c.exam_board : c.level,
      name:     c.title,
      rating:   0,
      students: 0,
      price:    c.rate_per_hour,
    })),
    results:     [],
    credentials: buildCredentials(education, hasCnic),
    reviewList:  [],
    faq:         DEFAULT_FAQ,
    similar:     [],
    availability,
    watching:    '',
    trustBadges: [
      'Qualifications submitted',
      hasCnic ? 'Identity verified' : null,
      liveCourses.length > 0 ? 'Active courses' : null,
    ].filter(Boolean) as string[],
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const heroRef = useRef<HTMLDivElement>(null)

  const isMock = !!(id && PROFILES[id])

  const [profile,  setProfile]  = useState<TutorProfile | null>(isMock ? PROFILES[id!] : null)
  const [loading,  setLoading]  = useState(!isMock)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isMock || !id) return
    fetchTeacherProfile(id).then(p => {
      if (p) setProfile(p)
      else setNotFound(true)
      setLoading(false)
    })
  }, [id, isMock])

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-loading">
          <div className="profile-loading-inner">
            <div className="profile-loading-av" />
            <div className="profile-loading-lines">
              <div className="pll pll--name" />
              <div className="pll pll--sub" />
              <div className="pll pll--sub2" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  /* ── Not found ── */
  if (notFound || !profile) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-notfound">
          <h1 className="display">Tutor not found</h1>
          <p>This profile doesn't exist or has been removed.</p>
          <Link className="btn btn-primary" to="/tutors">Browse tutors</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const subject = profile.headline.split('·')[0].trim().replace(' Specialist', '').replace(' Tutor', '')
  const hasLiveData = !isMock
  const hasReviews  = profile.reviewList.length > 0
  const hasResults  = profile.results.length > 0
  const hasSimilar  = profile.similar.length > 0

  return (
    <div className="profile-page">
      <Navbar />
      <StickyBar profile={profile} heroRef={heroRef} />
      <Breadcrumb tutorName={profile.name} subject={subject} />

      <main className="wrap profile">
        <div className="pcols">
          {/* ── Left column ── */}
          <div className="pmain" ref={heroRef as React.RefObject<HTMLDivElement>}>
            <ProfileHero profile={profile} />
            <hr className="block-divider" />
            <ProfileAbout profile={profile} />
            <hr className="block-divider" />
            {profile.subjects.length > 0 && (
              <>
                <ProfileSubjects profile={profile} />
              </>
            )}
            {hasResults && (
              <>
                <ProfileResults profile={profile} />
                <hr className="block-divider" />
              </>
            )}
            {profile.credentials.length > 0 && (
              <>
                <hr className="block-divider" />
                <ProfileCredentials profile={profile} />
              </>
            )}
            {hasReviews && (
              <>
                <hr className="block-divider" />
                <ProfileReviews profile={profile} />
              </>
            )}
            {!hasReviews && hasLiveData && (
              <>
                <hr className="block-divider" />
                <section className="block">
                  <h2 className="display">Reviews</h2>
                  <p className="no-reviews-note">No reviews yet — be the first to book a demo.</p>
                </section>
              </>
            )}
            <hr className="block-divider" />
            <ProfileFAQ profile={profile} />
          </div>

          {/* ── Right column — sticky booking ── */}
          <aside className="aside" aria-label="Booking">
            <BookingCard profile={profile} />
          </aside>
        </div>
      </main>

      {hasSimilar && <SimilarTutors profile={profile} />}

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="mcta" aria-label="Quick actions">
        <div className="mcta-price">
          <span className="mono">
            {profile.price > 0
              ? `${profile.subjects[0]?.code === 'USD' ? 'USD' : 'Rs'} ${profile.price.toLocaleString()}`
              : 'Free demo'}
          </span>
          <span>free demo first</span>
        </div>
        <a className="btn btn-primary" href="#book" style={{ flex: 1 }}>
          Book free demo
        </a>
      </div>
    </div>
  )
}
