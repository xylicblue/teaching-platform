import { useState } from 'react'

type Role = 'student' | 'parent' | 'teacher'

const ROLES: { id: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'student',
    label: "I'm a student",
    desc: 'Find tutors, book demos, and improve my grades.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 10 12 5 2 10l10 5 10-5Z"/>
        <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5"/>
      </svg>
    ),
  },
  {
    id: 'parent',
    label: "I'm a parent",
    desc: 'Manage tutoring for my child and oversee every session.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>
      </svg>
    ),
  },
  {
    id: 'teacher',
    label: "I'm a teacher",
    desc: 'Apply to teach and grow my student base.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6M9 13h6M9 17h4"/>
      </svg>
    ),
  },
]

const DEMO_NAMES: Record<Role, string> = {
  student: 'Ahmed',
  parent:  'Mrs. Khan',
  teacher: 'Mr. Hassan',
}

type Props = {
  onSuccess: (name: string, role: string) => void
}

export default function RoleSelection({ onSuccess }: Props) {
  const [selected, setSelected] = useState<Role | null>(null)
  const [loading,  setLoading]  = useState(false)

  function handleContinue() {
    if (!selected) return
    setLoading(true)
    setTimeout(() => onSuccess(DEMO_NAMES[selected], selected), 1200)
  }

  return (
    <div className="role-inner">
      <span className="role-eyebrow">One last step</span>
      <h1 className="auth-head display">How will you use Ustaad?</h1>
      <p className="auth-sub">This tailors your experience. You can change it later.</p>

      <div className="role-cards">
        {ROLES.map(r => (
          <button
            key={r.id}
            className="role-card"
            aria-pressed={selected === r.id}
            onClick={() => setSelected(r.id)}
          >
            <span className="ricon">{r.icon}</span>
            <div className="rc-main">
              <div className="rc-name display">{r.label}</div>
              <div className="rc-desc">{r.desc}</div>
            </div>
            <span className="rc-check" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="role-continue">
          <button
            className={`btn btn-primary submit${loading ? ' loading' : ''}`}
            onClick={handleContinue}
            disabled={loading}
          >
            Continue
            {loading && <span className="spin"><span className="spinner" aria-label="Continuing…" /></span>}
          </button>
        </div>
      )}
    </div>
  )
}
