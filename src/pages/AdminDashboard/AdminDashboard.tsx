import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './AdminDashboard.css'

/* ── Types ─────────────────────────────────────────────────────────────────── */
type AdminView = 'overview' | 'applications' | 'users' | 'courses'
type AppStatus = 'pending' | 'approved' | 'rejected'
type AppFilter = 'all' | AppStatus

type EduItem = {
  degree: string
  field: string
  institution: string
  year: string
  verification_doc?: string
}

type Application = {
  id: string
  user_id: string
  status: AppStatus
  first_name: string
  last_name: string | null
  date_of_birth: string | null
  gender: string | null
  city: string | null
  country: string | null
  phone: string
  education: EduItem[]
  years_exp: number
  teaching_levels: string[]
  subjects_interest: { name: string; exam_boards: string[] }[]
  exam_boards: string[]
  bio: string | null
  cnic_number: string
  cnic_front_path: string | null
  cnic_back_path: string | null
  submitted_at: string
  updated_at: string
}

type UserRow = {
  id: string
  display_name: string | null
  first_name: string | null
  role: string
  status: string
  created_at: string | null
}

type CourseRow = {
  id: string
  title: string
  subject: string
  level: string
  exam_board: string
  rate_per_hour: number
  currency: string
  course_type: string
  duration_months: number | null
  topics: { heading: string; plan: string }[]
  teaching_bullets: string[]
  lesson_plan_url: string | null
  is_active: boolean
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  teacher: { first_name: string | null; last_name: string | null } | null
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fullName(a: Pick<Application, 'first_name' | 'last_name'>) {
  return [a.first_name, a.last_name].filter(Boolean).join(' ')
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

/* ── AppTable sub-component ─────────────────────────────────────────────────── */
function AppTable({
  apps,
  selected,
  onSelect,
}: {
  apps: Application[]
  selected: Application | null
  onSelect: (a: Application) => void
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Applied</th>
            <th>Subjects</th>
            <th>Exp.</th>
            <th>Status</th>
            <th aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr
              key={app.id}
              className={selected?.id === app.id ? 'selected' : ''}
              onClick={() => onSelect(app)}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(app)}
            >
              <td className="at-name">{fullName(app)}</td>
              <td className="at-muted">{fmtDate(app.submitted_at)}</td>
              <td className="at-subjects">
                {(app.subjects_interest ?? []).slice(0, 2).map(s => s.name).join(', ')}
                {(app.subjects_interest?.length ?? 0) > 2 && (
                  <span className="at-more"> +{app.subjects_interest.length - 2}</span>
                )}
              </td>
              <td className="at-muted">{app.years_exp}y</td>
              <td>
                <span className={`astatus astatus--${app.status}`}>{STATUS_LABEL[app.status]}</span>
              </td>
              <td className="at-arr" aria-hidden="true">›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── AdminDashboard ─────────────────────────────────────────────────────────── */
export default function AdminDashboard({ onTeacherMode }: { onTeacherMode?: () => void } = {}) {
  const navigate = useNavigate()

  const [authChecking,   setAuthChecking]   = useState(true)
  const [adminName,      setAdminName]      = useState('Admin')
  const [isAlsoTeacher,  setIsAlsoTeacher]  = useState(false)
  const [sideOpen,     setSideOpen]     = useState(false)
  const [view,         setView]         = useState<AdminView>('overview')

  /* ── Applications ── */
  const [apps,        setApps]        = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [filter,      setFilter]      = useState<AppFilter>('pending')
  const [selected,    setSelected]    = useState<Application | null>(null)
  const [signedUrls,  setSignedUrls]  = useState<Record<string, string>>({})
  const [urlsLoading, setUrlsLoading] = useState(false)

  /* ── Users ── */
  const [users,        setUsers]        = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  /* ── Courses ── */
  const [courses,        setCourses]        = useState<CourseRow[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null)
  const [courseFilter,   setCourseFilter]   = useState<'pending' | 'all'>('pending')
  const [rejectNoteInput, setRejectNoteInput] = useState('')
  const [confirmCourseReject, setConfirmCourseReject] = useState(false)
  const [courseActioning, setCourseActioning] = useState(false)
  const [courseActionErr, setCourseActionErr] = useState('')

  /* ── Actions (applications) ── */
  const [actioning,     setActioning]     = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [actionError,   setActionError]   = useState('')

  /* derived stats */
  const stats = {
    total:    apps.length,
    pending:  apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  }
  const pendingCourses = courses.filter(c => c.status === 'pending')
  const filteredCourses = courseFilter === 'pending' ? pendingCourses : courses

  /* ── Body class ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    document.body.classList.add('admin-page')
    return () => document.body.classList.remove('admin-page')
  }, [])

  /* ── Auth guard ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { navigate('/signin', { replace: true }); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name, first_name')
        .eq('id', user.id)
        .single()
      if (!profile || profile.role !== 'admin') {
        navigate('/dashboard', { replace: true }); return
      }
      setAdminName(profile.display_name || profile.first_name || user.email?.split('@')[0] || 'Admin')

      const { data: teacherApp } = await supabase
        .from('teacher_applications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()
      setIsAlsoTeacher(teacherApp?.status === 'approved')

      setAuthChecking(false)
    })
  }, [navigate])

  /* ── Fetch all applications ─────────────────────────────────────────────────── */
  const fetchApps = useCallback(async () => {
    setAppsLoading(true)
    const { data} = await supabase
      .from('teacher_applications')
      .select('*')
      .order('submitted_at', { ascending: false })
    setApps((data as Application[]) ?? [])
    setAppsLoading(false)
  }, [])

  useEffect(() => {
    if (!authChecking) fetchApps()
  }, [authChecking, fetchApps])

  /* ── Fetch users (lazy, on first visit to Users view) ───────────────────────── */
  useEffect(() => {
    if (view !== 'users' || users.length > 0) return
    setUsersLoading(true)
    supabase
      .from('profiles')
      .select('id, display_name, first_name, role, status, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers((data as UserRow[]) ?? [])
        setUsersLoading(false)
      })
  }, [view, users.length])

  /* ── Fetch courses (lazy, on first visit to Courses view) ───────────────────── */
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*, teacher:profiles!teacher_id(first_name, last_name)')
      .order('created_at', { ascending: false })
    setCourses((data as CourseRow[]) ?? [])
    setCoursesLoading(false)
  }, [])

  useEffect(() => {
    if (!authChecking) fetchCourses()
  }, [authChecking, fetchCourses])

  /* ── Signed URLs for selected application documents ─────────────────────────── */
  useEffect(() => {
    if (!selected) { setSignedUrls({}); return }
    setUrlsLoading(true)
    setSignedUrls({})

    const entries: { key: string; path: string }[] = [
      selected.cnic_front_path ? { key: 'cnic_front', path: selected.cnic_front_path } : null,
      selected.cnic_back_path  ? { key: 'cnic_back',  path: selected.cnic_back_path  } : null,
      ...(selected.education ?? []).map((e, i) =>
        e.verification_doc ? { key: `qual_${i}`, path: e.verification_doc } : null
      ),
    ].filter(Boolean) as { key: string; path: string }[]

    if (entries.length === 0) { setUrlsLoading(false); return }

    Promise.all(
      entries.map(({ key, path }) =>
        supabase.storage
          .from('teacher-documents')
          .createSignedUrl(path, 3600)
          .then(({ data }) => ({ key, url: data?.signedUrl ?? '' }))
      )
    ).then(results => {
      const map: Record<string, string> = {}
      results.forEach(({ key, url }) => { if (url) map[key] = url })
      setSignedUrls(map)
      setUrlsLoading(false)
    })
  }, [selected])

  /* ── Approve / Reject ────────────────────────────────────────────────────────── */
  async function handleApprove() {
    if (!selected || actioning) return
    setActioning(true)
    setActionError('')
    const { error } = await supabase
      .from('teacher_applications')
      .update({ status: 'approved' })
      .eq('id', selected.id)
    if (error) { setActionError(error.message); setActioning(false); return }
    const upd: Application = { ...selected, status: 'approved' }
    setApps(prev => prev.map(a => a.id === selected.id ? upd : a))
    setSelected(upd)
    setActioning(false)
  }

  async function handleReject() {
    if (!selected || actioning) return
    setActioning(true)
    setActionError('')
    const { error } = await supabase
      .from('teacher_applications')
      .update({ status: 'rejected' })
      .eq('id', selected.id)
    if (error) { setActionError(error.message); setActioning(false); return }
    const upd: Application = { ...selected, status: 'rejected' }
    setApps(prev => prev.map(a => a.id === selected.id ? upd : a))
    setSelected(upd)
    setConfirmReject(false)
    setActioning(false)
  }

  /* ── Course approve / reject ────────────────────────────────────────────────── */
  async function handleApproveCourse() {
    if (!selectedCourse || courseActioning) return
    setCourseActioning(true)
    setCourseActionErr('')
    const { error } = await supabase
      .from('courses')
      .update({ status: 'approved', is_active: true, admin_note: null })
      .eq('id', selectedCourse.id)
    if (error) { setCourseActionErr(error.message); setCourseActioning(false); return }
    const upd: CourseRow = { ...selectedCourse, status: 'approved', is_active: true }
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? upd : c))
    setSelectedCourse(upd)
    setCourseActioning(false)
  }

  async function handleRejectCourse() {
    if (!selectedCourse || courseActioning) return
    setCourseActioning(true)
    setCourseActionErr('')
    const { error } = await supabase
      .from('courses')
      .update({ status: 'rejected', is_active: false, admin_note: rejectNoteInput.trim() || null })
      .eq('id', selectedCourse.id)
    if (error) { setCourseActionErr(error.message); setCourseActioning(false); return }
    const upd: CourseRow = { ...selectedCourse, status: 'rejected', admin_note: rejectNoteInput.trim() || null }
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? upd : c))
    setSelectedCourse(upd)
    setConfirmCourseReject(false)
    setRejectNoteInput('')
    setCourseActioning(false)
  }

  function openCourse(course: CourseRow) {
    setSelectedCourse(course)
    setConfirmCourseReject(false)
    setRejectNoteInput('')
    setCourseActionErr('')
    if (view !== 'courses') setView('courses')
  }

  function openApp(app: Application) {
    setSelected(app)
    setConfirmReject(false)
    setActionError('')
    if (view !== 'applications') setView('applications')
  }

  function closeDetail() {
    setSelected(null)
    setConfirmReject(false)
    setActionError('')
  }

  function navTo(v: AdminView) {
    setView(v)
    setSideOpen(false)
  }

  const filteredApps = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  /* ── Loading screen ─────────────────────────────────────────────────────────── */
  if (authChecking) {
    return (
      <div className="admin-auth-check">
        <span>Checking access…</span>
      </div>
    )
  }

  /* ── Render ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="admin-wrap">

      {/* Mobile sidebar backdrop */}
      {sideOpen && (
        <div className="admin-side-bd" onClick={() => setSideOpen(false)} aria-hidden="true" />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`admin-side${sideOpen ? ' open' : ''}`}>
        <div className="admin-side-top">
          <Link to="/" className="admin-wordmark">Ustaad</Link>
          <p className="admin-side-label">Admin panel</p>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {/* Overview */}
          <button
            className={`admin-nav-item${view === 'overview' ? ' active' : ''}`}
            onClick={() => navTo('overview')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Overview
          </button>

          {/* Applications */}
          <button
            className={`admin-nav-item${view === 'applications' ? ' active' : ''}`}
            onClick={() => navTo('applications')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M9 13h6M9 17h4"/>
            </svg>
            Applications
            {stats.pending > 0 && (
              <span className="admin-nav-badge">{stats.pending}</span>
            )}
          </button>

          {/* Users */}
          <button
            className={`admin-nav-item${view === 'users' ? ' active' : ''}`}
            onClick={() => navTo('users')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Users
          </button>

          {/* Courses */}
          <button
            className={`admin-nav-item${view === 'courses' ? ' active' : ''}`}
            onClick={() => navTo('courses')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Courses
            {pendingCourses.length > 0 && (
              <span className="admin-nav-badge">{pendingCourses.length}</span>
            )}
          </button>
        </nav>

        <div className="admin-side-foot">
          {isAlsoTeacher && onTeacherMode && (
            <button className="admin-teacher-mode-btn" onClick={onTeacherMode}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Teacher dashboard
            </button>
          )}
          <div className="admin-side-user">
            <div className="asu-av" aria-hidden="true">{adminName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="asu-name">{adminName}</p>
              <p className="asu-role">Admin</p>
            </div>
          </div>
          <button
            className="admin-signout-btn"
            onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="admin-main">

        {/* Topbar */}
        <header className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSideOpen(true)} aria-label="Open sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <h1 className="admin-topbar-title">
            {view === 'overview' ? 'Overview' : view === 'applications' ? 'Teacher applications' : view === 'courses' ? 'Course approvals' : 'Users'}
          </h1>
          <div className="admin-topbar-right">
            <span className="admin-topbar-name">{adminName}</span>
            <span className="admin-topbar-pill">Admin</span>
          </div>
        </header>

        {/* Canvas */}
        <div className="admin-canvas">

          {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
          {view === 'overview' && (
            <>
              <p className="admin-ov-section-label">Teacher applications</p>
              <div className="admin-stats-row">
                <button className="astat astat--pending" onClick={() => { setFilter('pending'); navTo('applications') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{stats.pending}</span>
                    <span className="astat-lbl">Pending review</span>
                  </span>
                </button>
                <button className="astat astat--approved" onClick={() => { setFilter('approved'); navTo('applications') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{stats.approved}</span>
                    <span className="astat-lbl">Approved</span>
                  </span>
                </button>
                <button className="astat astat--rejected" onClick={() => { setFilter('rejected'); navTo('applications') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{stats.rejected}</span>
                    <span className="astat-lbl">Rejected</span>
                  </span>
                </button>
                <button className="astat astat--total" onClick={() => { setFilter('all'); navTo('applications') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{stats.total}</span>
                    <span className="astat-lbl">Total received</span>
                  </span>
                </button>
              </div>

              <p className="admin-ov-section-label" style={{ marginTop: 'var(--s5)' }}>Courses</p>
              <div className="admin-stats-row">
                <button className="astat astat--pending" onClick={() => { setCourseFilter('pending'); navTo('courses') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{pendingCourses.length}</span>
                    <span className="astat-lbl">Pending approval</span>
                  </span>
                </button>
                <button className="astat astat--approved" onClick={() => { setCourseFilter('all'); navTo('courses') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{courses.filter(c => c.status === 'approved').length}</span>
                    <span className="astat-lbl">Live courses</span>
                  </span>
                </button>
                <button className="astat astat--total" onClick={() => { setCourseFilter('all'); navTo('courses') }}>
                  <span className="astat-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  </span>
                  <span className="astat-info">
                    <span className="astat-val">{courses.length}</span>
                    <span className="astat-lbl">Total submitted</span>
                  </span>
                </button>
              </div>

              <div className="admin-section">
                <div className="admin-section-hd">
                  <h2>Pending applications</h2>
                  {stats.pending > 0 && (
                    <button
                      className="admin-see-all"
                      onClick={() => { setFilter('pending'); navTo('applications') }}
                    >
                      See all →
                    </button>
                  )}
                </div>
                {appsLoading ? (
                  <p className="admin-loading-txt">Loading…</p>
                ) : stats.pending === 0 ? (
                  <div className="admin-empty-box">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>
                    <p>No pending applications — all caught up.</p>
                  </div>
                ) : (
                  <AppTable
                    apps={apps.filter(a => a.status === 'pending').slice(0, 6)}
                    selected={selected}
                    onSelect={openApp}
                  />
                )}
              </div>
            </>
          )}

          {/* ── APPLICATIONS ──────────────────────────────────────────────────── */}
          {view === 'applications' && (
            <>
              <div className="admin-filter-row">
                {(['pending', 'all', 'approved', 'rejected'] as const).map(f => (
                  <button
                    key={f}
                    className={`afilter${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All' : STATUS_LABEL[f]}
                    <span className={`afilter-n afilter-n--${f === 'all' ? 'total' : f}`}>
                      {f === 'all' ? stats.total : f === 'pending' ? stats.pending : f === 'approved' ? stats.approved : stats.rejected}
                    </span>
                  </button>
                ))}
              </div>

              {appsLoading ? (
                <p className="admin-loading-txt">Loading…</p>
              ) : filteredApps.length === 0 ? (
                <div className="admin-empty-box">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                  <p>No {filter !== 'all' ? `${filter} ` : ''}applications yet.</p>
                </div>
              ) : (
                <AppTable apps={filteredApps} selected={selected} onSelect={openApp} />
              )}
            </>
          )}

          {/* ── USERS ─────────────────────────────────────────────────────────── */}
          {view === 'users' && (
            usersLoading ? (
              <p className="admin-loading-txt">Loading…</p>
            ) : users.length === 0 ? (
              <div className="admin-empty-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <p>No users yet.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="at-name">{u.display_name || u.first_name || <span className="at-muted">—</span>}</td>
                        <td><span className={`arole arole--${u.role}`}>{u.role}</span></td>
                        <td><span className={`astatus astatus--${u.status === 'active' ? 'approved' : u.status === 'pending' ? 'pending' : 'rejected'}`}>{u.status}</span></td>
                        <td className="at-muted">{u.created_at ? fmtDate(u.created_at) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── COURSES ───────────────────────────────────────────────────────── */}
          {view === 'courses' && (
            <>
              <div className="admin-filter-row">
                <button
                  className={`afilter${courseFilter === 'pending' ? ' active' : ''}`}
                  onClick={() => setCourseFilter('pending')}
                >
                  Pending
                  <span className="afilter-n afilter-n--pending">{pendingCourses.length}</span>
                </button>
                <button
                  className={`afilter${courseFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setCourseFilter('all')}
                >
                  All
                  <span className="afilter-n afilter-n--total">{courses.length}</span>
                </button>
              </div>

              {coursesLoading ? (
                <p className="admin-loading-txt">Loading…</p>
              ) : filteredCourses.length === 0 ? (
                <div className="admin-empty-box">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <p>No {courseFilter === 'pending' ? 'pending ' : ''}courses.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Teacher</th>
                        <th>Level</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th aria-hidden="true" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map(course => (
                        <tr
                          key={course.id}
                          className={selectedCourse?.id === course.id ? 'selected' : ''}
                          onClick={() => openCourse(course)}
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && openCourse(course)}
                        >
                          <td className="at-name">{course.title}</td>
                          <td className="at-muted">
                            {course.teacher
                              ? [course.teacher.first_name, course.teacher.last_name].filter(Boolean).join(' ')
                              : '—'}
                          </td>
                          <td className="at-muted">{course.level}</td>
                          <td className="at-muted">{course.currency} {Number(course.rate_per_hour).toLocaleString()}/hr</td>
                          <td>
                            <span className={`astatus astatus--${course.status}`}>{STATUS_LABEL[course.status]}</span>
                          </td>
                          <td className="at-arr" aria-hidden="true">›</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ── Detail panel ─────────────────────────────────────────────────────── */}
      {selected && (
        <>
          <div className="admin-detail-bd" onClick={closeDetail} aria-hidden="true" />

          <aside className="admin-detail" aria-label="Application details">
            {/* Head */}
            <div className="ad-head">
              <div className="ad-head-info">
                <h2 className="ad-name">{fullName(selected)}</h2>
                <div className="ad-head-meta">
                  <span className={`astatus astatus--${selected.status}`}>{STATUS_LABEL[selected.status]}</span>
                  <span className="at-muted">Applied {fmtDate(selected.submitted_at)}</span>
                </div>
              </div>
              <button className="ad-close-btn" onClick={closeDetail} aria-label="Close panel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="ad-body">

              {/* Personal */}
              <div className="ad-section">
                <h3 className="ad-section-title">Personal information</h3>
                <div className="ad-kv-grid">
                  <div className="ad-kv">
                    <span className="ad-k">Phone</span>
                    <span className="ad-v">{selected.phone}</span>
                  </div>
                  {selected.date_of_birth && (
                    <div className="ad-kv">
                      <span className="ad-k">Date of birth</span>
                      <span className="ad-v">{fmtDate(selected.date_of_birth)}</span>
                    </div>
                  )}
                  {selected.gender && (
                    <div className="ad-kv">
                      <span className="ad-k">Gender</span>
                      <span className="ad-v" style={{ textTransform: 'capitalize' }}>
                        {selected.gender.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  {(selected.city || selected.country) && (
                    <div className="ad-kv">
                      <span className="ad-k">Location</span>
                      <span className="ad-v">{[selected.city, selected.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Teaching */}
              <div className="ad-section">
                <h3 className="ad-section-title">Teaching expertise</h3>
                <div className="ad-kv-grid">
                  <div className="ad-kv">
                    <span className="ad-k">Experience</span>
                    <span className="ad-v">{selected.years_exp} {selected.years_exp === 1 ? 'year' : 'years'}</span>
                  </div>
                </div>

                {(selected.teaching_levels?.length ?? 0) > 0 && (
                  <div className="ad-kv ad-kv--full">
                    <span className="ad-k">Levels</span>
                    <div className="ad-pill-row">
                      {selected.teaching_levels.map(l => <span key={l} className="ad-pill">{l}</span>)}
                    </div>
                  </div>
                )}

                {(selected.subjects_interest?.length ?? 0) > 0 && (
                  <div className="ad-kv ad-kv--full">
                    <span className="ad-k">Subjects</span>
                    <div className="ad-pill-row">
                      {selected.subjects_interest.map(s => <span key={s.name} className="ad-pill">{s.name}</span>)}
                    </div>
                  </div>
                )}

                {(selected.exam_boards?.length ?? 0) > 0 && (
                  <div className="ad-kv ad-kv--full">
                    <span className="ad-k">Exam boards</span>
                    <div className="ad-pill-row">
                      {selected.exam_boards.map(b => <span key={b} className="ad-pill">{b}</span>)}
                    </div>
                  </div>
                )}

                {selected.bio && (
                  <div className="ad-kv ad-kv--full">
                    <span className="ad-k">Teaching bio</span>
                    <p className="ad-bio">{selected.bio}</p>
                  </div>
                )}
              </div>

              {/* Education */}
              {(selected.education?.length ?? 0) > 0 && (
                <div className="ad-section">
                  <h3 className="ad-section-title">Education &amp; qualifications</h3>
                  {selected.education.map((e, i) => (
                    <div key={i} className="ad-edu">
                      <div className="ad-kv-grid">
                        <div className="ad-kv">
                          <span className="ad-k">Degree</span>
                          <span className="ad-v">{e.degree}</span>
                        </div>
                        {e.field && (
                          <div className="ad-kv">
                            <span className="ad-k">Field</span>
                            <span className="ad-v">{e.field}</span>
                          </div>
                        )}
                        {e.institution && (
                          <div className="ad-kv">
                            <span className="ad-k">Institution</span>
                            <span className="ad-v">{e.institution}</span>
                          </div>
                        )}
                        {e.year && (
                          <div className="ad-kv">
                            <span className="ad-k">Year</span>
                            <span className="ad-v">{e.year}</span>
                          </div>
                        )}
                      </div>
                      {e.verification_doc && (
                        signedUrls[`qual_${i}`] ? (
                          <a
                            href={signedUrls[`qual_${i}`]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ad-doc-link"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <path d="M14 2v6h6"/>
                            </svg>
                            View certificate ↗
                          </a>
                        ) : urlsLoading ? (
                          <span className="ad-doc-loading">Loading document…</span>
                        ) : null
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CNIC */}
              <div className="ad-section">
                <h3 className="ad-section-title">Identity — CNIC</h3>
                <div className="ad-kv">
                  <span className="ad-k">Number</span>
                  <span className="ad-v ad-v--mono">
                    {selected.cnic_number
                      ? `${selected.cnic_number.slice(0, 5)}-•••••••-${selected.cnic_number.slice(-1)}`
                      : '—'}
                  </span>
                </div>

                <div className="ad-doc-pair">
                  {(['cnic_front', 'cnic_back'] as const).map(key => {
                    const url = signedUrls[key]
                    const label = key === 'cnic_front' ? 'Front side' : 'Back side'
                    return (
                      <div key={key} className="ad-doc-card">
                        <p className="ad-doc-label">{label}</p>
                        {urlsLoading && !url ? (
                          <div className="ad-doc-placeholder">Loading…</div>
                        ) : url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="ad-doc-img-wrap">
                            <img
                              src={url}
                              alt={`CNIC ${label}`}
                              className="ad-doc-img"
                              onError={e => {
                                const img = e.target as HTMLImageElement
                                img.style.display = 'none'
                                const fallback = img.nextElementSibling as HTMLElement
                                if (fallback) fallback.removeAttribute('hidden')
                              }}
                            />
                            <span className="ad-doc-pdf-fallback" hidden>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <path d="M14 2v6h6"/>
                              </svg>
                              View PDF ↗
                            </span>
                          </a>
                        ) : (
                          <div className="ad-doc-placeholder">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                              <rect x="2" y="5" width="20" height="14" rx="2"/>
                              <path d="M2 10h20"/>
                            </svg>
                            Not uploaded
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Actions footer */}
            <div className="ad-foot">
              {actionError && (
                <p className="ad-action-err" role="alert">{actionError}</p>
              )}

              {selected.status === 'pending' && (
                confirmReject ? (
                  <div className="ad-confirm">
                    <p className="ad-confirm-q">Reject this application?</p>
                    <div className="ad-confirm-row">
                      <button
                        className="btn btn-outline"
                        onClick={() => setConfirmReject(false)}
                        disabled={actioning}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn ad-btn-reject-solid"
                        onClick={handleReject}
                        disabled={actioning}
                      >
                        {actioning ? 'Rejecting…' : 'Confirm rejection'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ad-action-row">
                    <button
                      className="btn ad-btn-reject"
                      onClick={() => setConfirmReject(true)}
                      disabled={actioning}
                    >
                      Reject
                    </button>
                    <button
                      className="btn ad-btn-approve"
                      onClick={handleApprove}
                      disabled={actioning}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      {actioning ? 'Approving…' : 'Approve teacher'}
                    </button>
                  </div>
                )
              )}

              {selected.status !== 'pending' && (
                <div className={`ad-decided ad-decided--${selected.status}`}>
                  {selected.status === 'approved'
                    ? '✓ Approved — teacher role has been granted.'
                    : '✗ Rejected — application has been closed.'}
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ── Course detail panel ──────────────────────────────────────────────── */}
      {selectedCourse && (
        <>
          <div className="admin-detail-bd" onClick={() => setSelectedCourse(null)} aria-hidden="true" />

          <aside className="admin-detail" aria-label="Course details">
            <div className="ad-head">
              <div className="ad-head-info">
                <h2 className="ad-name">{selectedCourse.title}</h2>
                <div className="ad-head-meta">
                  <span className={`astatus astatus--${selectedCourse.status}`}>{STATUS_LABEL[selectedCourse.status]}</span>
                  <span className="at-muted">{selectedCourse.subject} · {selectedCourse.level}</span>
                </div>
              </div>
              <button className="ad-close-btn" onClick={() => setSelectedCourse(null)} aria-label="Close panel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="ad-body">

              {/* Basics */}
              <div className="ad-section">
                <h3 className="ad-section-title">Course details</h3>
                <div className="ad-kv-grid">
                  <div className="ad-kv">
                    <span className="ad-k">Teacher</span>
                    <span className="ad-v">
                      {selectedCourse.teacher
                        ? [selectedCourse.teacher.first_name, selectedCourse.teacher.last_name].filter(Boolean).join(' ')
                        : '—'}
                    </span>
                  </div>
                  <div className="ad-kv">
                    <span className="ad-k">Exam board</span>
                    <span className="ad-v">{selectedCourse.exam_board}</span>
                  </div>
                  <div className="ad-kv">
                    <span className="ad-k">Rate</span>
                    <span className="ad-v">{selectedCourse.currency} {Number(selectedCourse.rate_per_hour).toLocaleString()}/hr</span>
                  </div>
                  <div className="ad-kv">
                    <span className="ad-k">Duration</span>
                    <span className="ad-v">
                      {selectedCourse.course_type === 'fixed' && selectedCourse.duration_months
                        ? `${selectedCourse.duration_months} month${selectedCourse.duration_months !== 1 ? 's' : ''}`
                        : 'Recurring'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics */}
              {selectedCourse.topics?.length > 0 && (
                <div className="ad-section">
                  <h3 className="ad-section-title">Curriculum topics</h3>
                  <div className="ad-topic-list">
                    {selectedCourse.topics.map((t, i) => (
                      <div key={i} className="ad-topic">
                        <span className="ad-topic-n">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <p className="ad-topic-head">{t.heading}</p>
                          {t.plan && <p className="ad-topic-plan">{t.plan}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Methodology */}
              {selectedCourse.teaching_bullets?.length > 0 && (
                <div className="ad-section">
                  <h3 className="ad-section-title">Teaching methodology</h3>
                  <ul className="ad-bullet-list">
                    {selectedCourse.teaching_bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lesson plan */}
              {selectedCourse.lesson_plan_url && (
                <div className="ad-section">
                  <h3 className="ad-section-title">Lesson plan</h3>
                  <a
                    href={selectedCourse.lesson_plan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-doc-link"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    View lesson plan PDF ↗
                  </a>
                </div>
              )}

              {/* Previous rejection note */}
              {selectedCourse.admin_note && (
                <div className="ad-section">
                  <h3 className="ad-section-title">Rejection note</h3>
                  <p className="ad-bio">{selectedCourse.admin_note}</p>
                </div>
              )}

            </div>

            {/* Actions footer */}
            <div className="ad-foot">
              {courseActionErr && (
                <p className="ad-action-err" role="alert">{courseActionErr}</p>
              )}

              {selectedCourse.status === 'pending' && (
                confirmCourseReject ? (
                  <div className="ad-confirm">
                    <p className="ad-confirm-q">Reject this course?</p>
                    <textarea
                      className="ad-reject-note"
                      placeholder="Reason for rejection (optional — shown to teacher)"
                      value={rejectNoteInput}
                      onChange={e => setRejectNoteInput(e.target.value)}
                      rows={2}
                    />
                    <div className="ad-confirm-row">
                      <button
                        className="btn btn-outline"
                        onClick={() => { setConfirmCourseReject(false); setRejectNoteInput('') }}
                        disabled={courseActioning}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn ad-btn-reject-solid"
                        onClick={handleRejectCourse}
                        disabled={courseActioning}
                      >
                        {courseActioning ? 'Rejecting…' : 'Confirm rejection'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ad-action-row">
                    <button
                      className="btn ad-btn-reject"
                      onClick={() => setConfirmCourseReject(true)}
                      disabled={courseActioning}
                    >
                      Reject
                    </button>
                    <button
                      className="btn ad-btn-approve"
                      onClick={handleApproveCourse}
                      disabled={courseActioning}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                      {courseActioning ? 'Approving…' : 'Approve course'}
                    </button>
                  </div>
                )
              )}

              {selectedCourse.status !== 'pending' && (
                <div className={`ad-decided ad-decided--${selectedCourse.status}`}>
                  {selectedCourse.status === 'approved'
                    ? '✓ Approved — course is live on the platform.'
                    : '✗ Rejected — teacher has been notified.'}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
