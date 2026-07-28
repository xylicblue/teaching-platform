import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar       from '../../components/dashboard/Sidebar/Sidebar'
import Topbar        from '../../components/dashboard/Topbar/Topbar'
import PopulatedView from '../../components/dashboard/PopulatedView/PopulatedView'
import EmptyView     from '../../components/dashboard/EmptyView/EmptyView'
import TeacherDashboard from '../TeacherDashboard/TeacherDashboard'
import AdminDashboard   from '../AdminDashboard/AdminDashboard'
import MyDemos       from '../../components/dashboard/MyDemos/MyDemos'
import MyEnrollments from '../../components/dashboard/MyEnrollments/MyEnrollments'
import { useStudentDashboard } from '../../hooks/useStudentDashboard'
import { supabase } from '../../lib/supabase'
import './DashboardPage.css'

type Role = 'student' | 'parent'

const STAT_ICON: Record<string, React.ReactNode> = {
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,
  users:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/></svg>,
  check:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>,
  star:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17l-6.1 3.3 1.4-6.7-5-4.6 6.8-.7z"/></svg>,
}

export default function DashboardPage() {
  const [role,      setRole]      = useState<Role>('student')
  const [active,    setActive]    = useState('dashboard')
  const [sideOpen,  setSideOpen]  = useState(false)
  const navigate = useNavigate()
  const [appStatus,    setAppStatus]    = useState<string | null>(null)
  const [appResolved,  setAppResolved]  = useState(false)
  // Cache is an initial-paint hint only — the effect below always reconciles
  // against the DB, so a role change (e.g. admin approved as teacher) can't get
  // stuck behind a stale value. The _v2 suffix flushes pre-fix caches once.
  const [userRole,     setUserRole]     = useState<string | null>(
    sessionStorage.getItem('_ust_role_v2')
  )
  const [roleResolved, setRoleResolved] = useState(
    !!sessionStorage.getItem('_ust_role_v2')
  )
  const [userId,       setUserId]       = useState<string | null>(null)
  const [firstName,    setFirstName]    = useState<string | null>(null)
  const [fullName,     setFullName]     = useState<string | null>(null)
  const [avatarUrl,    setAvatarUrl]    = useState<string | null>(null)

  const dash = useStudentDashboard(userId)

  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => document.body.classList.remove('dashboard-page')
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setRoleResolved(true); setAppResolved(true); return }
      setUserId(user.id)
      supabase
        .from('teacher_applications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => { setAppStatus(data?.status ?? null); setAppResolved(true) })

      // Always read role from the DB and reconcile — never trust the cache as
      // the source of truth.
      supabase
        .from('profiles')
        .select('role, first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          const r = data?.role ?? null
          setUserRole(r)
          setFirstName(data?.first_name ?? null)
          setFullName([data?.first_name, data?.last_name].filter(Boolean).join(' ') || null)
          setAvatarUrl(data?.avatar_url ?? null)
          if (r) sessionStorage.setItem('_ust_role_v2', r)
          else   sessionStorage.removeItem('_ust_role_v2')
          setRoleResolved(true)
        })
    })
  }, [])

  // For an admin, the teacher-vs-admin decision depends on the application
  // status too — wait for both so we never flash the wrong dashboard.
  if (!roleResolved || !appResolved) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--paper-2)' }}>
        <p style={{ color:'var(--slate)', fontSize:'14px' }}>Loading…</p>
      </div>
    )
  }

  // An admin who was approved to teach keeps role 'admin'. Their "My dashboard"
  // (/dashboard) is their teaching workspace; the admin panel lives at /admin.
  const adminAlsoTeaches = userRole === 'admin' && appStatus === 'approved'

  if (userRole === 'teacher') return <TeacherDashboard />
  if (adminAlsoTeaches) return <TeacherDashboard onBackToAdmin={() => navigate('/admin')} />
  if (userRole === 'admin') return <AdminDashboard />

  /* A brand-new student has no enrolments and no demo requests. */
  const isEmpty = dash.isNew

  const who = firstName ? `, ${firstName}` : ''
  const greeting = isEmpty ? `Welcome to Ustaad${who}` : `Welcome back${who}`
  const subline  = isEmpty
    ? 'Find a tutor and book a free demo class to get started.'
    : role === 'parent'
      ? "Here's how your child's learning is going."
      : dash.nextSession
        ? `Your next class is ${dash.nextSession.date.toLowerCase()} at ${dash.nextSession.time.split('–')[0].trim()}.`
        : 'Pick up where you left off.'

  return (
    <>
      <div className={`side-backdrop${sideOpen ? ' open' : ''}`} onClick={() => setSideOpen(false)} />

      <div className="dash">
        <Sidebar
          open={sideOpen}
          active={active}
          onNavigate={id => { setActive(id); setSideOpen(false) }}
          userName={fullName ?? firstName}
          userRole={role}
          avatarUrl={avatarUrl}
          unread={dash.unreadCount}
        />

        <div className="main">
          <Topbar
            role={role}
            onRole={setRole}
            onOpenMenu={() => setSideOpen(true)}
            unread={dash.unreadCount}
          />

          <div className="canvas">
            {appStatus === 'approved' && (
              <div className="app-verified-banner">
                <div className="avb-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>
                </div>
                <div className="avb-body">
                  <p className="avb-title">You're a verified Ustaad teacher</p>
                  <p className="avb-sub">Your application has been approved. Your teacher profile is now live and students can find and book sessions with you.</p>
                </div>
                <span className="avb-badge">Verified</span>
              </div>
            )}

            {appStatus === 'pending' && (
              <div className="app-pending-banner">
                <div className="apb-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div className="apb-body">
                  <p className="apb-title">Teaching application under review</p>
                  <p className="apb-sub">We're verifying your details and documents. Expect a decision within 2–3 business days — we'll notify you by email and WhatsApp.</p>
                </div>
                <span className="apb-badge">Pending</span>
              </div>
            )}

            {/* Welcome hero */}
            <div className="welcome">
              <div>
                <h1 className="greeting">{greeting}</h1>
                <p className="sub">{subline}</p>
              </div>
              <div className="w-cta">
                <Link className="btn btn-primary" to="/tutors">Browse tutors</Link>
              </div>
            </div>

            {/* Stat chips — live counts */}
            {!isEmpty && (
              <div className="statrow">
                {dash.stats.map((s, i) => (
                  <div className="statchip" key={i}>
                    <span className={`si ${s.tone}`}>{STAT_ICON[s.icon]}</span>
                    <div><b>{s.value}</b><span>{s.label}</span></div>
                  </div>
                ))}
              </div>
            )}

            {/* Anything needing the student's attention, before the overview */}
            <MyEnrollments userId={userId} />
            <MyDemos userId={userId} />

            {isEmpty ? <EmptyView /> : <PopulatedView data={dash} />}
          </div>
        </div>
      </div>
    </>
  )
}
