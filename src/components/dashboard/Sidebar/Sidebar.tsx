import { Link } from 'react-router-dom'

type NavItem = {
  id:    string
  label: string
  icon:  React.ReactNode
  to?:   string
  badge?: string
  soon?: boolean
}

const MAIN_NAV: NavItem[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  },
  {
    id: 'sessions', label: 'Sessions',
    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,
  },
  {
    id: 'tutors', label: 'My Tutors', to: '/tutors',
    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>,
  },
]

const SOON_NAV: NavItem[] = [
  {
    id: 'progress', label: 'Progress', soon: true,
    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>,
  },
  {
    id: 'homework', label: 'Homework', soon: true,
    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  },
  {
    id: 'billing', label: 'Billing', soon: true,
    icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  },
]

type Props = {
  open:        boolean
  active:      string
  onNavigate:  (id: string) => void
  userName?:   string | null
  userRole?:   string | null
  avatarUrl?:  string | null
  unread?:     number
}

export default function Sidebar({
  open, active, onNavigate, userName, userRole, avatarUrl, unread = 0,
}: Props) {
  const name     = userName?.trim() || 'Your account'
  const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
  const roleLbl  = userRole === 'parent' ? 'Parent' : 'Student'

  function renderItem(item: NavItem) {
    const cls = `nav-item${active === item.id ? ' active' : ''}`
    const inner = (
      <>
        {item.icon}
        {item.label}
        {item.badge && <span className="badge">{item.badge}</span>}
        {item.soon && <span className="soon">Soon</span>}
      </>
    )
    if (item.to) {
      return <Link key={item.id} className={cls} to={item.to}>{inner}</Link>
    }
    return (
      <button key={item.id} className={cls} onClick={() => onNavigate(item.id)}>
        {inner}
      </button>
    )
  }

  return (
    <aside className={`side${open ? ' open' : ''}`} aria-label="Main navigation">
      <Link className="wordmark" to="/">
        <span className="mk" aria-hidden="true">U</span>Ustaad
      </Link>

      <nav className="side-nav">
        {MAIN_NAV.map(item =>
          renderItem(item.id === 'dashboard' && unread > 0
            ? { ...item, badge: String(unread) }
            : item)
        )}
        <div className="side-sec">Coming soon</div>
        {SOON_NAV.map(renderItem)}
      </nav>

      <div className="side-foot">
        <div className="side-upgrade">
          <b>Every first class is free</b>
          <p>Try any tutor with a free demo before you pay for a single lesson.</p>
          <Link to="/tutors">Find a tutor →</Link>
        </div>
        <button className="user-chip">
          {avatarUrl
            ? <img className="av av-c0" src={avatarUrl} alt="" style={{ objectFit: 'cover' }} />
            : <span className="av av-c0" aria-hidden="true">{initials}</span>}
          <div>
            <div className="uc-name">{name}</div>
            <div className="uc-role">{roleLbl}</div>
          </div>
          <span className="uc-caret">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </button>
      </div>
    </aside>
  )
}
