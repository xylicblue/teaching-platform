import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar       from '../../components/dashboard/Sidebar/Sidebar'
import Topbar        from '../../components/dashboard/Topbar/Topbar'
import PopulatedView from '../../components/dashboard/PopulatedView/PopulatedView'
import EmptyView     from '../../components/dashboard/EmptyView/EmptyView'
import { STATS } from '../../data/dashboardData'
import './DashboardPage.css'

type Role  = 'student' | 'parent'
type State = 'populated' | 'empty'

const STAT_ICON: Record<string, React.ReactNode> = {
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,
  users:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/></svg>,
  check:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>,
  star:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17l-6.1 3.3 1.4-6.7-5-4.6 6.8-.7z"/></svg>,
}

export default function DashboardPage() {
  const [role,    setRole]    = useState<Role>('student')
  const [state,   setState]   = useState<State>('populated')
  const [active,  setActive]  = useState('dashboard')
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => document.body.classList.remove('dashboard-page')
  }, [])

  const isEmpty = state === 'empty'

  const greeting = isEmpty ? 'Welcome to Ustaad, Sarah' : 'Welcome back, Sarah'
  const subline  = isEmpty
    ? "Let's find your first tutor."
    : role === 'parent'
      ? "Here's how Sarah's learning is going."
      : 'Continue your learning journey.'

  return (
    <>
      <div className={`side-backdrop${sideOpen ? ' open' : ''}`} onClick={() => setSideOpen(false)} />

      <div className="dash">
        <Sidebar
          open={sideOpen}
          active={active}
          onNavigate={id => { setActive(id); setSideOpen(false) }}
        />

        <div className="main">
          <Topbar role={role} onRole={setRole} onOpenMenu={() => setSideOpen(true)} />

          <div className="canvas">
            {/* Prototype state toggle */}
            <div className="state-toggle">
              <span className="lbl">Preview state</span>
              <button data-state="populated" aria-pressed={!isEmpty} onClick={() => setState('populated')}>Active learner</button>
              <button data-state="empty"     aria-pressed={isEmpty}  onClick={() => setState('empty')}>New user</button>
            </div>

            {/* Welcome hero */}
            <div className="welcome">
              <div>
                <h1 className="greeting">{greeting}</h1>
                <p className="sub">{subline}</p>
              </div>
              <div className="w-cta">
                <a className="btn btn-outline" href="#">View schedule</a>
                <Link className="btn btn-primary" to="/tutors">Browse tutors</Link>
              </div>
            </div>

            {/* Stat chips (populated only) */}
            {!isEmpty && (
              <div className="statrow">
                {STATS.map((s, i) => (
                  <div className="statchip" key={i}>
                    <span className={`si ${s.tone}`}>{STAT_ICON[s.icon]}</span>
                    <div><b>{s.value}</b><span>{s.label}</span></div>
                  </div>
                ))}
              </div>
            )}

            {isEmpty ? <EmptyView /> : <PopulatedView key={role} />}
          </div>
        </div>
      </div>
    </>
  )
}
