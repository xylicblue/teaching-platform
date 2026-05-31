import './TutorCard.css'

export type Tutor = {
  id: number
  name: string
  initials: string
  avatarColor: string
  subjects: string
  quote: string
  credential: string
  rating: string
  sessions: string
  responseTime: string
  rate: string
}

type Props = { tutor: Tutor }

export default function TutorCard({ tutor }: Props) {
  return (
    <article className="tutor-card">
      {/* Colored header band */}
      <div className="tutor-card__header" style={{ backgroundColor: tutor.avatarColor }}>
        <div className="tutor-card__avatar">
          <span className="tutor-card__initials">{tutor.initials}</span>
        </div>
        <div className="tutor-card__header-meta">
          <span className="tutor-card__rating">
            <span className="tutor-card__star">&#9733;</span> {tutor.rating}
          </span>
          <span className="tutor-card__sessions">{tutor.sessions} sessions</span>
        </div>
      </div>

      {/* Card body */}
      <div className="tutor-card__body">
        <h3 className="tutor-card__name">{tutor.name}</h3>
        <p className="tutor-card__subjects">{tutor.subjects}</p>

        <blockquote className="tutor-card__quote">
          &ldquo;{tutor.quote}&rdquo;
        </blockquote>

        <p className="tutor-card__credential">{tutor.credential}</p>
      </div>

      {/* Stats footer */}
      <footer className="tutor-card__footer">
        <div className="tutor-card__meta-row">
          <span className="tutor-card__meta-item">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {tutor.responseTime}
          </span>
          <span className="tutor-card__meta-item tutor-card__rate">{tutor.rate}</span>
        </div>
        <a
          href={`/tutors/${tutor.id}`}
          className="tutor-card__profile-link"
          style={{ color: tutor.avatarColor }}
          aria-label={`View ${tutor.name}'s profile`}
        >
          See profile &rarr;
        </a>
      </footer>
    </article>
  )
}
