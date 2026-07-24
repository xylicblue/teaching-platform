import { supabase } from './supabase'

/* ══════════════════════════════════════════════════════════════════════════════
   CATALOG — the single source of live data for every public page.

   Everything here comes from the database:
     courses        → public read policy (approved + active only)
     profiles       → public read policy
     teacher_public → view added in 009_public_catalog.sql

   Nothing in this file invents ratings, review counts, lesson totals or
   presence. If we do not have the data, the UI omits the element.
══════════════════════════════════════════════════════════════════════════════ */

export const AVATAR_COLORS = [
  '#1F4A3D', '#A8741C', '#B0532A', '#5C544A',
  '#2E5A4A', '#8A5A2B', '#6B4A3A', '#3B6E54',
]

/* ── Types ──────────────────────────────────────────────────────────────────── */

export type CatalogCourse = {
  id:                 string
  teacher_id:         string
  title:              string
  subject:            string
  level:              string
  exam_board:         string
  description:        string | null
  rate_per_hour:      number
  currency:           string
  demo_duration_min:  number
  class_duration_min: number
  days_of_week:       string[]
  class_times:        Record<string, string>
  course_type:        'recurring' | 'fixed'
  duration_months:    number | null
  banner_url:         string | null
  topics:             { heading: string; plan: string }[]
  teaching_bullets:   string[]
  created_at:         string
}

export type EducationEntry = {
  degree:      string
  field:       string
  institution: string
  year:        string
}

export type CatalogTeacher = {
  id:          string
  name:        string
  firstName:   string
  initials:    string
  colorIndex:  number
  avatarUrl:   string | null
  bio:         string | null
  city:        string | null
  country:     string | null
  location:    string
  yearsExp:    number | null
  education:   EducationEntry[]
  idVerified:  boolean
  joinedAt:    string | null

  courses:     CatalogCourse[]
  subjects:    string[]
  levels:      string[]
  boards:      string[]
  minPrice:    number
  currency:    string
  classDays:   number      // distinct days per week across all their courses
  headline:    string      // "A-Level Mathematics · CAIE"
  credential:  string | null  // "MSc Mathematics — LUMS"
}

export type Catalog = {
  teachers: CatalogTeacher[]
  courses:  CatalogCourse[]
}

/* ── Subject taxonomy ───────────────────────────────────────────────────────── */
/* Not mock data — this is the fixed mapping from the subject list offered in the
   teacher's Add Course flow to the streams shown on the landing catalog. */

export type Stream = {
  name:   string
  color:  string
  bgTint: string
  blurb:  string
}

export const STREAMS: Stream[] = [
  { name: 'Sciences',     color: '#1A6B4A', bgTint: '#EBF4EF', blurb: 'Physics, Chemistry, Biology and Computer Science' },
  { name: 'Mathematics',  color: '#1F4A3D', bgTint: '#EBF4EF', blurb: 'Pure Maths, Further Maths, Statistics and Mechanics' },
  { name: 'Commerce',     color: '#3B5A78', bgTint: '#EBF0F5', blurb: 'Economics, Business Studies and Accounting' },
  { name: 'Humanities',   color: '#7B4F3A', bgTint: '#F5EDE8', blurb: 'History, Geography, Psychology and Sociology' },
  { name: 'Languages',    color: '#C9923B', bgTint: '#FDF5E8', blurb: 'English Language, English Literature and Urdu' },
  { name: 'Arts & Other', color: '#6B3A7D', bgTint: '#F2EBF5', blurb: 'Art & Design, Physical Education and everything else' },
]

const SUBJECT_STREAM: Record<string, string> = {
  'Mathematics':         'Mathematics',
  'Further Mathematics': 'Mathematics',
  'Statistics':          'Mathematics',
  'Physics':             'Sciences',
  'Chemistry':           'Sciences',
  'Biology':             'Sciences',
  'Computer Science':    'Sciences',
  'Economics':           'Commerce',
  'Business Studies':    'Commerce',
  'Accounting':          'Commerce',
  'English Language':    'Languages',
  'English Literature':  'Languages',
  'Urdu':                'Languages',
  'Islamiat':            'Humanities',
  'Pakistan Studies':    'Humanities',
  'History':             'Humanities',
  'Geography':           'Humanities',
  'Psychology':          'Humanities',
  'Sociology':           'Humanities',
  'Art & Design':        'Arts & Other',
  'Physical Education':  'Arts & Other',
}

export function streamOf(subject: string): string {
  return SUBJECT_STREAM[subject] ?? 'Arts & Other'
}

/** Display order for levels, so tabs never come out shuffled. */
const LEVEL_ORDER = ['O-Level', 'IGCSE', 'A-Level', 'IB', 'Primary', 'Other']

export function sortLevels(levels: string[]): string[] {
  return [...levels].sort((a, b) => {
    const ia = LEVEL_ORDER.indexOf(a), ib = LEVEL_ORDER.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
}

/* ── Small helpers ──────────────────────────────────────────────────────────── */

export function colorIndexFromName(name: string): number {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h % AVATAR_COLORS.length
}

export function initialsOf(first: string | null, last: string | null): string {
  const a = first?.trim()?.[0] ?? ''
  const b = last?.trim()?.[0] ?? ''
  return (a + b).toUpperCase() || (a || '?').toUpperCase()
}

export function fmtPrice(rate: number, currency = 'PKR'): string {
  return currency === 'USD'
    ? `$${rate.toLocaleString()}`
    : `Rs ${Number(rate).toLocaleString('en-PK')}`
}

/** "17:30" → "5:30pm" */
export function fmtTime(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h = parseInt(hStr, 10)
  if (Number.isNaN(h)) return t
  const m = mStr ?? '00'
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === '00' ? `${h12}${suffix}` : `${h12}:${m}${suffix}`
}

/** Every distinct weekday a teacher runs a class on. */
function distinctDays(courses: CatalogCourse[]): number {
  const set = new Set<string>()
  for (const c of courses) for (const d of c.days_of_week ?? []) set.add(d)
  return set.size
}

function uniq(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[]))
}

/* ── Row shapes coming back from Supabase ───────────────────────────────────── */

type ProfileRow = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  bio: string | null
  country: string | null
  role: string
}

type TeacherPublicRow = {
  id: string
  years_exp: number | null
  city: string | null
  education: EducationEntry[] | null
  id_verified: boolean | null
  created_at: string | null
}

/* ── Fetch ──────────────────────────────────────────────────────────────────── */

const COURSE_COLUMNS =
  'id, teacher_id, title, subject, level, exam_board, description, rate_per_hour, ' +
  'currency, demo_duration_min, class_duration_min, days_of_week, class_times, ' +
  'course_type, duration_months, banner_url, topics, teaching_bullets, created_at'

/**
 * The whole public catalog: every approved + active course, grouped into the
 * teachers who run them. A teacher with no live course is not in the catalog —
 * there would be nothing for a student to book.
 */
export async function fetchCatalog(): Promise<Catalog> {
  const { data: courseRows, error } = await supabase
    .from('courses')
    .select(COURSE_COLUMNS)
    .eq('status', 'approved')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !courseRows || courseRows.length === 0) {
    return { teachers: [], courses: [] }
  }

  const courses = (courseRows as unknown as CatalogCourse[]).map(c => ({
    ...c,
    rate_per_hour:    Number(c.rate_per_hour),
    days_of_week:     c.days_of_week ?? [],
    class_times:      c.class_times ?? {},
    topics:           c.topics ?? [],
    teaching_bullets: c.teaching_bullets ?? [],
  }))

  const teacherIds = uniq(courses.map(c => c.teacher_id))

  const [profRes, pubRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, bio, country, role')
      .in('id', teacherIds),
    // Added in migration 009. If it has not been run yet the catalog still
    // works — it just renders without experience / education chips.
    supabase
      .from('teacher_public')
      .select('id, years_exp, city, education, id_verified, created_at')
      .in('id', teacherIds),
  ])

  const profiles = new Map<string, ProfileRow>(
    ((profRes.data ?? []) as ProfileRow[]).map(p => [p.id, p])
  )
  const extras = new Map<string, TeacherPublicRow>(
    ((pubRes.data ?? []) as TeacherPublicRow[]).map(t => [t.id, t])
  )

  const teachers: CatalogTeacher[] = teacherIds
    .map(id => buildTeacher(id, profiles.get(id), extras.get(id), courses.filter(c => c.teacher_id === id)))
    .filter((t): t is CatalogTeacher => t !== null)

  return { teachers, courses }
}

function buildTeacher(
  id: string,
  prof: ProfileRow | undefined,
  extra: TeacherPublicRow | undefined,
  own: CatalogCourse[]
): CatalogTeacher | null {
  if (!prof || own.length === 0) return null

  const name = [prof.first_name, prof.last_name].filter(Boolean).join(' ').trim() || 'Teacher'
  const education = (extra?.education ?? []).filter(e => e && (e.degree || e.institution))
  const first = own[0]
  const city = extra?.city ?? null
  const country = prof.country ?? null

  const topEdu = education[0]
  const credential = topEdu
    ? [[topEdu.degree, topEdu.field].filter(Boolean).join(' '), topEdu.institution]
        .filter(Boolean).join(' — ')
    : null

  return {
    id,
    name,
    firstName:  prof.first_name?.trim() || name.split(' ')[0],
    initials:   initialsOf(prof.first_name, prof.last_name),
    colorIndex: colorIndexFromName(name),
    avatarUrl:  prof.avatar_url,
    bio:        prof.bio,
    city,
    country,
    location:   [city, country === 'PK' ? 'Pakistan' : country].filter(Boolean).join(', ') || 'Pakistan',
    yearsExp:   extra?.years_exp ?? null,
    education,
    idVerified: extra?.id_verified ?? false,
    joinedAt:   extra?.created_at ?? null,

    courses:    own,
    subjects:   uniq(own.map(c => c.subject)),
    levels:     sortLevels(uniq(own.map(c => c.level))),
    boards:     uniq(own.map(c => c.exam_board)).filter(b => b !== 'N/A'),
    minPrice:   Math.min(...own.map(c => c.rate_per_hour)),
    currency:   first.currency,
    classDays:  distinctDays(own),
    headline:   headlineFor(own),
    credential,
  }
}

/** "A-Level Mathematics · CAIE" — built from the teacher's own live courses. */
function headlineFor(courses: CatalogCourse[]): string {
  const subjects = uniq(courses.map(c => c.subject))
  const levels   = sortLevels(uniq(courses.map(c => c.level)))
  const boards   = uniq(courses.map(c => c.exam_board)).filter(b => b !== 'N/A')

  const subjectPart = subjects.length <= 2
    ? subjects.join(' & ')
    : `${subjects.slice(0, 2).join(', ')} +${subjects.length - 2}`
  const levelPart = levels.length === 1 ? levels[0] : levels.slice(0, 2).join(' & ')
  const boardPart = boards.length > 0 ? ` · ${boards.slice(0, 2).join(' / ')}` : ''

  return `${levelPart} ${subjectPart}${boardPart}`
}

/* ── Derived aggregates ─────────────────────────────────────────────────────── */

export type CatalogStats = {
  tutors:      number
  courses:     number
  subjects:    number
  boards:      number
  levels:      string[]
  subjectList: string[]
  boardList:   string[]
  minDemoMin:  number | null
  lowestPrice: number | null
  currency:    string
}

export function catalogStats({ teachers, courses }: Catalog): CatalogStats {
  const subjectList = uniq(courses.map(c => c.subject)).sort()
  const boardList   = uniq(courses.map(c => c.exam_board)).filter(b => b !== 'N/A').sort()
  const demos       = courses.map(c => c.demo_duration_min).filter(Boolean)
  const prices      = courses.map(c => c.rate_per_hour).filter(p => p > 0)

  return {
    tutors:      teachers.length,
    courses:     courses.length,
    subjects:    subjectList.length,
    boards:      boardList.length,
    levels:      sortLevels(uniq(courses.map(c => c.level))),
    subjectList,
    boardList,
    minDemoMin:  demos.length  ? Math.min(...demos)  : null,
    lowestPrice: prices.length ? Math.min(...prices) : null,
    currency:    courses[0]?.currency ?? 'PKR',
  }
}

/** Courses for one level, bucketed into streams. Empty streams are dropped. */
export function streamsForLevel(courses: CatalogCourse[], level: string) {
  const atLevel = courses.filter(c => c.level === level)

  return STREAMS
    .map(stream => {
      const inStream = atLevel.filter(c => streamOf(c.subject) === stream.name)
      return {
        ...stream,
        subjects: uniq(inStream.map(c => c.subject)),
        courses:  inStream.length,
        tutors:   uniq(inStream.map(c => c.teacher_id)).length,
      }
    })
    .filter(s => s.courses > 0)
}
