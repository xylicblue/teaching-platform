import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Props = {
  role:        'student' | 'parent'
  onRole:      (role: 'student' | 'parent') => void
  onOpenMenu:  () => void
  unread?:     number
}

export default function Topbar({ role, onRole, onOpenMenu, unread = 0 }: Props) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)
  const [query, setQuery] = useState('')
  const hasNotif = unread > 0 && !dismissed

  return (
    <header className="topbar">
      <button className="menu-btn" aria-label="Open menu" onClick={onOpenMenu}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <div className="top-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input
          type="search"
          placeholder="Search tutors, subjects, exam boards…"
          aria-label="Search tutors"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key !== 'Enter') return
            const q = query.trim()
            navigate(q ? `/tutors?subject=${encodeURIComponent(q)}` : '/tutors')
          }}
        />
      </div>

      <div className="top-right">
        <div className="role-switch" role="group" aria-label="View as">
          <button data-role="student" aria-pressed={role === 'student'} onClick={() => onRole('student')}>Student</button>
          <button data-role="parent"  aria-pressed={role === 'parent'}  onClick={() => onRole('parent')}>Parent</button>
        </div>

        <button
          className="icon-btn"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          onClick={() => setDismissed(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          {hasNotif && <span className="ndot" />}
        </button>

        <Link className="btn btn-primary btn-sm" to="/tutors">Browse tutors</Link>
      </div>
    </header>
  )
}
