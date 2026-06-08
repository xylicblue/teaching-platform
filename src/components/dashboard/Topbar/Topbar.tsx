import { useState } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  role:        'student' | 'parent'
  onRole:      (role: 'student' | 'parent') => void
  onOpenMenu:  () => void
}

export default function Topbar({ role, onRole, onOpenMenu }: Props) {
  const [hasNotif, setHasNotif] = useState(true)

  return (
    <header className="topbar">
      <button className="menu-btn" aria-label="Open menu" onClick={onOpenMenu}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <div className="top-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input type="text" placeholder="Search tutors, subjects, sessions…" aria-label="Search" />
      </div>

      <div className="top-right">
        <div className="role-switch" role="group" aria-label="View as">
          <button data-role="student" aria-pressed={role === 'student'} onClick={() => onRole('student')}>Student</button>
          <button data-role="parent"  aria-pressed={role === 'parent'}  onClick={() => onRole('parent')}>Parent</button>
        </div>

        <button className="icon-btn" aria-label="Notifications" onClick={() => setHasNotif(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          {hasNotif && <span className="ndot" />}
        </button>

        <Link className="btn btn-primary btn-sm" to="/tutors">Browse tutors</Link>
      </div>
    </header>
  )
}
