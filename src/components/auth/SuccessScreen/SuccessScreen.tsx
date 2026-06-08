import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  name:     string
  role?:    string
  isSignIn: boolean
}

const DEST: Record<string, string> = {
  student: 'your tutor dashboard',
  parent:  'your family dashboard',
  teacher: 'your teaching dashboard',
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export default function SuccessScreen({ name, role, isSignIn }: Props) {
  const dest = role ? (DEST[role] ?? 'your dashboard') : 'your dashboard'
  const navigate = useNavigate()

  useEffect(() => {
    const id = setTimeout(() => navigate('/dashboard'), 1800)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div className="success-screen show" role="status" aria-live="polite">
      <div className="success-check">
        <svg
          width="40" height="40" viewBox="0 0 24 24"
          fill="none" stroke="var(--paper)" strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </div>

      <h2>{isSignIn ? 'Welcome back' : 'Welcome'}, {cap(name)}.</h2>

      <p>
        Taking you to {dest}{' '}
        <span
          className="spinner"
          style={{ borderColor: 'rgba(250,247,242,0.35)', borderTopColor: 'var(--paper)' }}
          aria-label="Loading…"
        />
      </p>
    </div>
  )
}
