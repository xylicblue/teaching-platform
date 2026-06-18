import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AddCourseFlow from '../AddCourseFlow/AddCourseFlow'
import './TeacherDashboard.css'

/* ── Types ─────────────────────────────────────────────────────────────────── */
type View       = 'overview' | 'courses' | 'demos' | 'profile'
type DemoFilter = 'pending' | 'accepted' | 'all'
type DemoStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'

interface Course {
  id: string
  title: string
  subject: string
  level: string
  exam_board: string
  rate_per_hour: number
  currency: string
  description: string | null
  is_active: boolean
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
}

interface DemoRequest {
  id: string
  course_id: string
  status: DemoStatus
  student_note: string | null
  preferred_time: string | null
  meet_link: string | null
  scheduled_at: string | null
  created_at: string
  courses: { title: string; subject: string; level: string } | null
  student: { first_name: string; last_name: string | null; avatar_url: string | null } | null
}

/* ── Constants ──────────────────────────────────────────────────────────────── */
const LEVEL_BG: Record<string, string> = {
  'O-Level': '#1F4A3D', 'A-Level': '#163528', 'IGCSE': '#7A5515',
  'IB': '#7A2418', 'Primary': '#5C544A', 'Other': '#3A3530',
}

/* ── SVG icons ──────────────────────────────────────────────────────────────── */
const IC = {
  grid:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  book:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  inbox:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  users:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  coin:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  plus:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chev:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  eye:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8Z"/><circle cx="12" cy="12" r="3"/></svg>,
  menu:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  bell:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  star:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  cal:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,
  toggle: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3" fill="currentColor" stroke="none"/></svg>,
  person: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (d < 60) return `${d}m ago`
  if (d < 1440) return `${Math.floor(d / 60)}h ago`
  return `${Math.floor(d / 1440)}d ago`
}
function ini(first: string, last: string | null) {
  return ((first[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?'
}
const AV_COLOR = ['av-c0','av-c1','av-c2','av-c3','av-c4','av-c7']
function avColor(name: string) {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AV_COLOR[h % AV_COLOR.length]
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function TeacherDashboard({ onBackToAdmin }: { onBackToAdmin?: () => void } = {}) {
  /* ── layout ── */
  const [view,     setView]     = useState<View>('overview')
  const [sideOpen, setSideOpen] = useState(false)

  /* ── user ── */
  const [userId,   setUserId]   = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  /* ── data ── */
  const [courses,        setCourses]        = useState<Course[]>([])
  const [demos,          setDemos]          = useState<DemoRequest[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [demosLoading,   setDemosLoading]   = useState(true)

  /* ── demo view state ── */
  const [demoFilter,   setDemoFilter]   = useState<DemoFilter>('pending')
  const [acceptingId,  setAcceptingId]  = useState<string | null>(null)
  const [meetLink,     setMeetLink]     = useState('')
  const [actionLoading,setActionLoading]= useState<string | null>(null)
  const [actionError,  setActionError]  = useState('')

  /* ── add course panel ── */
  const [showAdd, setShowAdd] = useState(false)

  /* ── profile edit ── */
  const [profileBio,       setProfileBio]       = useState('')
  const [profileAvatar,    setProfileAvatar]    = useState<string | null>(null)
  const [profileBioSaving, setProfileBioSaving] = useState(false)
  const [profileBioSaved,  setProfileBioSaved]  = useState(false)
  const [avatarUploading,  setAvatarUploading]  = useState(false)
  const [avatarError,      setAvatarError]      = useState('')

  /* ── body class ── */
  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => document.body.classList.remove('dashboard-page')
  }, [])

  /* ── fetch user ── */
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: app } = await supabase
        .from('teacher_applications')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle()

      if (app?.first_name) {
        setUserName([app.first_name, app.last_name].filter(Boolean).join(' '))
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      setUserName(
        [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
        || 'Teacher'
      )
    }
    loadUser()
  }, [])

  /* ── data loaders ── */
  const loadCourses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCoursesLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    setCourses((data as Course[]) ?? [])
    setCoursesLoading(false)
  }, [])

  const loadDemos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setDemosLoading(true)
    const { data } = await supabase
      .from('demo_requests')
      .select(`
        *,
        courses ( title, subject, level ),
        student:profiles!student_id ( first_name, last_name, avatar_url )
      `)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    setDemos((data as DemoRequest[]) ?? [])
    setDemosLoading(false)
  }, [])

  useEffect(() => { loadCourses(); loadDemos() }, [loadCourses, loadDemos])

  /* ── toggle course active state ── */
  async function handleToggleCourse(id: string, active: boolean) {
    await supabase.from('courses').update({ is_active: !active }).eq('id', id)
    setCourses(cs => cs.map(c => c.id === id ? { ...c, is_active: !active } : c))
  }

  /* ── demo actions ── */
  async function handleAcceptDemo(id: string) {
    setActionLoading(id); setActionError('')
    const { error } = await supabase
      .from('demo_requests')
      .update({ status: 'accepted', meet_link: meetLink.trim() || null })
      .eq('id', id)
    setActionLoading(null)
    if (error) { setActionError('Something went wrong. Please try again.'); return }
    setAcceptingId(null); setMeetLink('')
    loadDemos()
  }

  async function handleDeclineDemo(id: string) {
    setActionLoading(id)
    await supabase.from('demo_requests').update({ status: 'declined' }).eq('id', id)
    setActionLoading(null)
    loadDemos()
  }

  /* ── load profile edit data ── */
  useEffect(() => {
    if (!userId) return
    async function loadProfile() {
      const { data: prof } = await supabase
        .from('profiles')
        .select('bio, avatar_url')
        .eq('id', userId!)
        .single()
      // prefer profiles.bio (editable); fall back to teacher_applications.bio (application snapshot)
      if (prof?.bio) {
        setProfileBio(prof.bio)
      } else {
        const { data: app } = await supabase
          .from('teacher_applications')
          .select('bio')
          .eq('user_id', userId!)
          .maybeSingle()
        if (app?.bio) setProfileBio(app.bio)
      }
      setProfileAvatar(prof?.avatar_url ?? null)
    }
    loadProfile()
  }, [userId])

  async function handleSaveBio() {
    if (!userId) return
    setProfileBioSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ bio: profileBio.trim() })
      .eq('id', userId)
    setProfileBioSaving(false)
    if (!error) {
      setProfileBioSaved(true)
      setTimeout(() => setProfileBioSaved(false), 3000)
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!userId) return
    setAvatarError('')
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2 MB.')
      return
    }
    setAvatarUploading(true)
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setAvatarError('Upload failed. Please try again.'); setAvatarUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
    setProfileAvatar(publicUrl)
    setAvatarUploading(false)
  }

  /* ── computed ── */
  const pendingDemos   = demos.filter(d => d.status === 'pending')
  const filteredDemos  = demoFilter === 'all' ? demos : demos.filter(d => d.status === demoFilter)
  const activeCourses  = courses.filter(c => c.is_active)
  const firstName      = userName?.split(' ')[0] ?? 'Teacher'

  const VIEW_TITLES: Record<View, string> = {
    overview: 'Overview',
    courses:  'My Courses',
    demos:    'Demo Requests',
    profile:  'Edit Profile',
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className={`side-backdrop${sideOpen ? ' open' : ''}`} onClick={() => setSideOpen(false)} />

      <div className="tdash">

        {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
        <aside className={`tdash-side${sideOpen ? ' open' : ''}`}>
          <div className="tdash-side-top">
            <Link to="/" className="tdash-wordmark">Ustaad</Link>
            <span className="tdash-role-chip">Teacher</span>
          </div>

          <nav className="tdash-nav" aria-label="Teacher navigation">
            {([
              { id: 'overview', label: 'Overview',      icon: IC.grid,   badge: 0 },
              { id: 'courses',  label: 'My Courses',    icon: IC.book,   badge: 0 },
              { id: 'demos',    label: 'Demo Requests', icon: IC.inbox,  badge: pendingDemos.length },
              { id: 'profile',  label: 'Edit Profile',  icon: IC.person, badge: 0 },
            ] as const).map(item => (
              <button
                key={item.id}
                className={`tdash-nav-item${view === item.id ? ' active' : ''}`}
                onClick={() => { setView(item.id); setSideOpen(false) }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge > 0 && <span className="tdash-nav-badge">{item.badge}</span>}
              </button>
            ))}

            <div className="tdash-nav-sep" />
            <p className="tdash-nav-section">Coming soon</p>

            {[
              { label: 'My Students', icon: IC.users },
              { label: 'Earnings',    icon: IC.coin  },
            ].map(item => (
              <div key={item.label} className="tdash-nav-item tdash-nav-item--soon">
                {item.icon}
                <span>{item.label}</span>
                <span className="tdash-nav-soon">Soon</span>
              </div>
            ))}
          </nav>

          <div className="tdash-side-foot">
            <Link to={userId ? `/tutors/${userId}` : '/tutors'} className="tdash-view-profile">
              {IC.eye}
              <span>View public profile</span>
            </Link>
            {onBackToAdmin && (
              <button className="tdash-back-admin" onClick={onBackToAdmin}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                <span>Back to admin</span>
              </button>
            )}
          </div>
        </aside>

        {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
        <div className="tdash-main">

          {/* Topbar */}
          <header className="tdash-topbar">
            <button className="tdash-menu-btn" onClick={() => setSideOpen(true)} aria-label="Open menu">
              {IC.menu}
            </button>
            <h1 className="tdash-topbar-title">{VIEW_TITLES[view]}</h1>
            <div className="tdash-topbar-right">
              <Link to={userId ? `/tutors/${userId}` : '/tutors'} className="btn btn-outline btn-sm">
                {IC.eye} My profile
              </Link>
            </div>
          </header>

          {/* Canvas */}
          <div className="tdash-canvas">
            {view === 'overview' && (
              <OverviewView
                firstName={firstName}
                courses={courses}
                activeCourses={activeCourses}
                pendingDemos={pendingDemos}
                coursesLoading={coursesLoading}
                demosLoading={demosLoading}
                onAddCourse={() => setShowAdd(true)}
                onGoToDemos={() => setView('demos')}
                onGoToCourses={() => setView('courses')}
              />
            )}
            {view === 'courses' && (
              <CoursesView
                courses={courses}
                loading={coursesLoading}
                onAddCourse={() => setShowAdd(true)}
                onToggle={handleToggleCourse}
              />
            )}
            {view === 'demos' && (
              <DemosView
                demos={filteredDemos}
                allDemos={demos}
                loading={demosLoading}
                filter={demoFilter}
                onFilter={setDemoFilter}
                acceptingId={acceptingId}
                setAcceptingId={setAcceptingId}
                meetLink={meetLink}
                setMeetLink={setMeetLink}
                onAccept={handleAcceptDemo}
                onDecline={handleDeclineDemo}
                actionLoading={actionLoading}
                actionError={actionError}
              />
            )}
            {view === 'profile' && userId && (
              <ProfileEditView
                userId={userId}
                userName={userName}
                bio={profileBio}
                onBioChange={setProfileBio}
                avatar={profileAvatar}
                saving={profileBioSaving}
                saved={profileBioSaved}
                avatarUploading={avatarUploading}
                avatarError={avatarError}
                onSaveBio={handleSaveBio}
                onAvatarUpload={handleAvatarUpload}
              />
            )}
          </div>
        </div>
      </div>

      {/* ══ ADD COURSE FLOW ══════════════════════════════════════════════════ */}
      {showAdd && userId && (
        <AddCourseFlow
          teacherId={userId}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); loadCourses() }}
        />
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   OVERVIEW VIEW
══════════════════════════════════════════════════════════════════════════════ */
function OverviewView({
  firstName, courses, activeCourses, pendingDemos,
  coursesLoading, demosLoading,
  onAddCourse, onGoToDemos, onGoToCourses,
}: {
  firstName: string
  courses: Course[]
  activeCourses: Course[]
  pendingDemos: DemoRequest[]
  coursesLoading: boolean
  demosLoading: boolean
  onAddCourse: () => void
  onGoToDemos: () => void
  onGoToCourses: () => void
}) {
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div>
      {/* Welcome */}
      <div className="td-welcome">
        <div>
          <h1 className="td-greeting">{greeting}, {firstName}</h1>
          <p className="td-sub">
            {activeCourses.length > 0
              ? `${activeCourses.length} active course${activeCourses.length !== 1 ? 's' : ''} — open for demo requests.`
              : 'Add your first course to start accepting students.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddCourse}>
          {<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          Add Course
        </button>
      </div>

      {/* Stat chips */}
      <div className="td-statrow">
        <div className="td-stat" onClick={onGoToCourses} style={{ cursor: 'pointer' }}>
          <div className="td-stat-icon td-si--ever">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div><b>{coursesLoading ? '—' : activeCourses.length}</b><span>Active courses</span></div>
        </div>
        <div className="td-stat" onClick={onGoToDemos} style={{ cursor: 'pointer' }}>
          <div className="td-stat-icon td-si--saff">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <div>
            <b>{demosLoading ? '—' : pendingDemos.length}</b>
            <span>Pending demos</span>
          </div>
        </div>
        <div className="td-stat">
          <div className="td-stat-icon td-si--succ">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div><b>—</b><span>Total students</span></div>
        </div>
        <div className="td-stat">
          <div className="td-stat-icon td-si--terr">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div><b>—</b><span>Avg. rating</span></div>
        </div>
      </div>

      {/* Pending demos panel */}
      {!demosLoading && pendingDemos.length > 0 && (
        <div className="td-section">
          <div className="td-sec-head">
            <h2>Pending Requests</h2>
            <button className="td-sec-link" onClick={onGoToDemos}>
              View all {<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
            </button>
          </div>
          <div className="td-demo-list">
            {pendingDemos.slice(0, 3).map(d => (
              <DemoCard key={d.id} demo={d} compact onViewAll={onGoToDemos} />
            ))}
          </div>
        </div>
      )}

      {/* Courses panel */}
      <div className="td-section">
        <div className="td-sec-head">
          <h2>My Courses</h2>
          {courses.length > 0 && (
            <button className="td-sec-link" onClick={onGoToCourses}>
              View all {<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
            </button>
          )}
        </div>

        {coursesLoading ? (
          <div className="td-loading">Loading courses…</div>
        ) : (
          <div className="td-course-grid">
            {courses.slice(0, 3).map(c => (
              <CourseCard key={c.id} course={c} />
            ))}
            <button className="td-add-card" onClick={onAddCourse}>
              <span className="td-add-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </span>
              <span className="td-add-label">Add Course</span>
              <span className="td-add-sub">Offer a new subject or level</span>
            </button>
          </div>
        )}
      </div>

      {/* Tips (only when no courses) */}
      {!coursesLoading && courses.length === 0 && (
        <div className="td-tips">
          <div className="td-tip">
            <span className="td-tip-n">01</span>
            <div>
              <b>Add your courses</b>
              <p>List each subject and level you teach, with your hourly rate.</p>
            </div>
          </div>
          <div className="td-tip">
            <span className="td-tip-n">02</span>
            <div>
              <b>Accept demo requests</b>
              <p>Students can request a free demo session — you choose who to accept.</p>
            </div>
          </div>
          <div className="td-tip">
            <span className="td-tip-n">03</span>
            <div>
              <b>Teach on Google Meet</b>
              <p>Share a meeting link with accepted students and start your first session.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   COURSES VIEW
══════════════════════════════════════════════════════════════════════════════ */
function CoursesView({
  courses, loading, onAddCourse, onToggle,
}: {
  courses: Course[]
  loading: boolean
  onAddCourse: () => void
  onToggle: (id: string, active: boolean) => void
}) {
  const active   = courses.filter(c => c.is_active).length
  const inactive = courses.length - active

  return (
    <div>
      <div className="td-page-head">
        <div>
          <h1 className="td-page-title">My Courses</h1>
          <p className="td-page-sub">
            {courses.length === 0
              ? 'No courses yet'
              : `${active} active${inactive > 0 ? ` · ${inactive} paused` : ''}`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddCourse}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Course
        </button>
      </div>

      {loading ? (
        <div className="td-loading">Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="td-empty">
          <div className="td-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <h3>No courses yet</h3>
          <p>Add your first course — specify the subject, level, and your hourly rate. Students will see these when browsing for a tutor.</p>
          <button className="btn btn-primary" onClick={onAddCourse}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add your first course
          </button>
        </div>
      ) : (
        <div className="td-course-grid td-course-grid--full">
          {courses.map(c => (
            <CourseCard key={c.id} course={c} onToggle={onToggle} showToggle />
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   DEMOS VIEW
══════════════════════════════════════════════════════════════════════════════ */
function DemosView({
  demos, allDemos, loading, filter, onFilter,
  acceptingId, setAcceptingId, meetLink, setMeetLink,
  onAccept, onDecline, actionLoading, actionError,
}: {
  demos: DemoRequest[]
  allDemos: DemoRequest[]
  loading: boolean
  filter: DemoFilter
  onFilter: (f: DemoFilter) => void
  acceptingId: string | null
  setAcceptingId: (id: string | null) => void
  meetLink: string
  setMeetLink: (s: string) => void
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  actionLoading: string | null
  actionError: string
}) {
  const counts = {
    pending:  allDemos.filter(d => d.status === 'pending').length,
    accepted: allDemos.filter(d => d.status === 'accepted').length,
    all:      allDemos.length,
  }

  return (
    <div>
      <div className="td-page-head">
        <div>
          <h1 className="td-page-title">Demo Requests</h1>
          <p className="td-page-sub">{counts.pending} pending</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="td-filters">
        {(['pending','accepted','all'] as DemoFilter[]).map(f => (
          <button
            key={f}
            className={`td-filter${filter === f ? ' active' : ''}`}
            onClick={() => onFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="td-filter-n">{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="td-loading">Loading…</div>
      ) : demos.length === 0 ? (
        <div className="td-empty">
          <div className="td-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <h3>No {filter === 'all' ? '' : filter} requests</h3>
          <p>Demo requests from students will appear here once your courses are live and students start browsing.</p>
        </div>
      ) : (
        <div className="td-demo-list td-demo-list--full">
          {demos.map(d => (
            <DemoCard
              key={d.id}
              demo={d}
              acceptingId={acceptingId}
              setAcceptingId={setAcceptingId}
              meetLink={meetLink}
              setMeetLink={setMeetLink}
              onAccept={onAccept}
              onDecline={onDecline}
              actionLoading={actionLoading === d.id}
              actionError={acceptingId === d.id ? actionError : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   COURSE CARD
══════════════════════════════════════════════════════════════════════════════ */
function CourseCard({
  course,
  onToggle,
  showToggle = false,
}: {
  course: Course
  onToggle?: (id: string, active: boolean) => void
  showToggle?: boolean
}) {
  const bg = LEVEL_BG[course.level] ?? '#1F4A3D'

  const isPending  = course.status === 'pending'
  const isRejected = course.status === 'rejected'
  const isApproved = course.status === 'approved'

  return (
    <div className={`td-cc${isRejected ? ' td-cc--rejected' : !course.is_active && isApproved ? ' td-cc--paused' : ''}`}>
      <div className="td-cc-head" style={{ background: bg }}>
        <div className="td-cc-badges">
          <span className="td-cc-level">{course.level}</span>
          <span className="td-cc-board">{course.exam_board}</span>
        </div>
        {isPending && (
          <span className="td-cc-status td-cc-status--pending">Under review</span>
        )}
        {isRejected && (
          <span className="td-cc-status td-cc-status--rejected">Rejected</span>
        )}
        {isApproved && showToggle && onToggle && (
          <button
            className={`td-cc-toggle${course.is_active ? ' on' : ' off'}`}
            onClick={() => onToggle(course.id, course.is_active)}
            title={course.is_active ? 'Pause this course' : 'Activate this course'}
          >
            {course.is_active ? 'Live' : 'Paused'}
          </button>
        )}
        {isApproved && !showToggle && (
          <span className="td-cc-status td-cc-status--live">Live</span>
        )}
      </div>
      <div className="td-cc-body">
        <h3 className="td-cc-title">{course.title}</h3>
        <p className="td-cc-subject">{course.subject}</p>
        {isRejected && course.admin_note && (
          <p className="td-cc-rejected-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {course.admin_note}
          </p>
        )}
        {isPending && (
          <p className="td-cc-pending-note">Pending admin review — not visible to students yet.</p>
        )}
        {course.description && !isRejected && !isPending && (
          <p className="td-cc-desc">{course.description}</p>
        )}
      </div>
      <div className="td-cc-foot">
        <div className="td-cc-rate">
          <b>{course.currency} {course.rate_per_hour.toLocaleString('en-PK')}</b>
          <span>/ hr</span>
        </div>
        <span className="td-cc-date">Added {fmtDate(course.created_at)}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   DEMO CARD
══════════════════════════════════════════════════════════════════════════════ */
const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'td-status--pending'  },
  accepted:  { label: 'Accepted',  cls: 'td-status--accepted' },
  declined:  { label: 'Declined',  cls: 'td-status--declined' },
  completed: { label: 'Completed', cls: 'td-status--done'     },
  cancelled: { label: 'Cancelled', cls: 'td-status--cancelled'},
}

function DemoCard({
  demo,
  compact = false,
  onViewAll,
  acceptingId,
  setAcceptingId,
  meetLink,
  setMeetLink,
  onAccept,
  onDecline,
  actionLoading = false,
  actionError = '',
}: {
  demo: DemoRequest
  compact?: boolean
  onViewAll?: () => void
  acceptingId?: string | null
  setAcceptingId?: (id: string | null) => void
  meetLink?: string
  setMeetLink?: (s: string) => void
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
  actionLoading?: boolean
  actionError?: string
}) {
  const s     = demo.student
  const c     = demo.courses
  const name  = s ? [s.first_name, s.last_name].filter(Boolean).join(' ') : 'Unknown student'
  const badge = STATUS_META[demo.status] ?? { label: demo.status, cls: '' }
  const isExp = acceptingId === demo.id

  return (
    <div className={`td-dc${isExp ? ' td-dc--expanding' : ''}`}>
      {/* Header row */}
      <div className="td-dc-head">
        <div className="td-dc-student">
          <span className={`td-dc-av av ${s ? avColor(s.first_name) : 'av-c3'}`}>
            {s ? ini(s.first_name, s.last_name) : '?'}
          </span>
          <div>
            <div className="td-dc-name">{name}</div>
            <div className="td-dc-role">Student</div>
          </div>
        </div>
        <div className="td-dc-meta">
          <span className={`td-status ${badge.cls}`}>{badge.label}</span>
          <span className="td-dc-time">{timeAgo(demo.created_at)}</span>
        </div>
      </div>

      {/* Course */}
      {c && (
        <div className="td-dc-course">
          <span className="td-dc-clabel">Course requested:</span>
          <span className="td-dc-ctitle">{c.title}</span>
          <span className="td-dc-cmeta">{c.level}</span>
        </div>
      )}

      {/* Student note */}
      {demo.student_note && (
        <blockquote className="td-dc-note">"{demo.student_note}"</blockquote>
      )}

      {/* Preferred time */}
      {demo.preferred_time && (
        <p className="td-dc-pref">
          <span>Preferred time:</span> {demo.preferred_time}
        </p>
      )}

      {/* Meet link (when accepted) */}
      {demo.status === 'accepted' && demo.meet_link && (
        <a href={demo.meet_link} target="_blank" rel="noopener noreferrer" className="td-dc-meet-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          Open Google Meet
        </a>
      )}

      {/* ── Accept form (expanded) */}
      {isExp && setAcceptingId && onAccept && setMeetLink && meetLink !== undefined && (
        <div className="td-dc-accept-form">
          <p className="td-dc-accept-q">Add a Google Meet link for this student <span>(optional)</span></p>
          <input
            type="url"
            className="td-dc-meet-input"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
          />
          {actionError && <p className="hint hint--error" style={{ marginTop: 6 }}>{actionError}</p>}
          <div className="td-dc-accept-row">
            <button className="btn btn-outline btn-sm" onClick={() => setAcceptingId(null)}>
              Cancel
            </button>
            <button
              className={`btn btn-primary btn-sm${actionLoading ? ' loading' : ''}`}
              onClick={() => onAccept(demo.id)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving…' : 'Confirm acceptance'}
            </button>
          </div>
        </div>
      )}

      {/* ── Actions */}
      {demo.status === 'pending' && !compact && !isExp && setAcceptingId && onDecline && (
        <div className="td-dc-actions">
          <button
            className="btn btn-outline btn-sm td-dc-decline"
            onClick={() => onDecline(demo.id)}
            disabled={actionLoading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Decline
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setAcceptingId(demo.id)}
            disabled={actionLoading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Accept Demo
          </button>
        </div>
      )}

      {/* Compact: just navigate to demos view */}
      {demo.status === 'pending' && compact && onViewAll && (
        <div className="td-dc-actions">
          <button className="btn btn-outline btn-sm td-dc-decline" onClick={onViewAll}>
            Review
          </button>
          <button className="btn btn-primary btn-sm" onClick={onViewAll}>
            Accept Demo
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════════
   PROFILE EDIT VIEW
══════════════════════════════════════════════════════════════════════════════ */
const AV_COLORS_BG = ['#1F4A3D','#163528','#7A5515','#7A2418','#5C544A','#3A3530','#2A4A3D','#4A2A1A']

function ProfileEditView({
  // userId,
  userName,
  bio,
  onBioChange,
  avatar,
  saving,
  saved,
  avatarUploading,
  avatarError,
  onSaveBio,
  onAvatarUpload,
}: {
  userId: string
  userName: string | null
  bio: string
  onBioChange: (v: string) => void
  avatar: string | null
  saving: boolean
  saved: boolean
  avatarUploading: boolean
  avatarError: string
  onSaveBio: () => void
  onAvatarUpload: (f: File) => void
}) {
  const name    = userName ?? 'Teacher'
  const initials = name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  const avBg  = AV_COLORS_BG[h % AV_COLORS_BG.length]

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onAvatarUpload(file)
    e.target.value = ''
  }

  return (
    <div className="tpe-wrap">

      {/* ── Avatar section ── */}
      <section className="tpe-section">
        <h2 className="tpe-section-title">Profile photo</h2>
        <p className="tpe-section-sub">Optional. A photo helps students feel comfortable booking a demo.</p>
        <div className="tpe-avatar-row">
          <div className="tpe-av-preview">
            {avatar ? (
              <img src={avatar} alt="Profile" className="tpe-av-img" />
            ) : (
              <span className="tpe-av-fallback" style={{ background: avBg }}>
                {initials}
              </span>
            )}
            {avatarUploading && (
              <div className="tpe-av-overlay">
                <span className="tpe-spinner" />
              </div>
            )}
          </div>
          <div className="tpe-av-actions">
            <label className="btn btn-outline btn-sm tpe-upload-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              {avatar ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileInput}
                disabled={avatarUploading}
              />
            </label>
            <span className="tpe-upload-hint">JPG, PNG or WebP · max 2 MB</span>
          </div>
        </div>
        {avatarError && <p className="tpe-error">{avatarError}</p>}
      </section>

      {/* ── Bio section ── */}
      <section className="tpe-section">
        <h2 className="tpe-section-title">About you</h2>
        <p className="tpe-section-sub">This appears on your public profile. Write what you'd say to a new student in their first message.</p>
        <textarea
          className="tpe-bio"
          rows={7}
          maxLength={1200}
          placeholder="Describe your teaching style, what subjects you specialise in, and how you help students improve…"
          value={bio}
          onChange={e => onBioChange(e.target.value)}
        />
        <div className="tpe-bio-foot">
          <span className="tpe-char-count">{bio.length} / 1200</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={onSaveBio}
            disabled={saving || bio.trim().length === 0}
          >
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
          </button>
        </div>
        {saved && <p className="tpe-saved-note">Your bio has been updated and will appear on your public profile.</p>}
      </section>

      {/* ── Locked info notice ── */}
      <section className="tpe-section tpe-section--muted">
        <p className="tpe-locked-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your name, qualifications, and subjects were verified during your application and can only be changed by contacting support.
        </p>
      </section>

    </div>
  )
}
