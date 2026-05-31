import { Link } from 'react-router-dom'
import './Breadcrumb.css'

type Props = { tutorName: string; subject: string }

export default function Breadcrumb({ tutorName, subject }: Props) {
  return (
    <div className="crumb-bar">
      <div className="wrap crumb-inner">
        <Link to="/">Home</Link>
        <span className="sep" aria-hidden="true">/</span>
        <Link to="/tutors" className="hide-sm">{subject} Tutors</Link>
        <span className="sep hide-sm" aria-hidden="true">/</span>
        <span className="cur">{tutorName}</span>
      </div>
    </div>
  )
}
