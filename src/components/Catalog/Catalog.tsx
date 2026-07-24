import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { sortLevels, streamsForLevel } from '../../lib/catalog'
import './Catalog.css'

export default function Catalog() {
  const { courses, loading } = useCatalog()
  const [activeLevel, setActiveLevel] = useState<string | null>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  const levels = useMemo(
    () => sortLevels(Array.from(new Set(courses.map(c => c.level)))),
    [courses]
  )

  /* Default to the level with the most courses once data lands. */
  useEffect(() => {
    if (activeLevel || levels.length === 0) return
    const busiest = [...levels].sort(
      (a, b) =>
        courses.filter(c => c.level === b).length -
        courses.filter(c => c.level === a).length
    )[0]
    setActiveLevel(busiest)
  }, [levels, courses, activeLevel])

  const streams = useMemo(
    () => (activeLevel ? streamsForLevel(courses, activeLevel) : []),
    [courses, activeLevel]
  )

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll<HTMLElement>('.catalog__stream-card')
    if (!cards) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('catalog__stream-card--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05 }
    )
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [activeLevel, streams.length])

  if (loading || courses.length === 0) return null

  return (
    <section className="catalog" id="catalog">
      <div className="catalog__inner">
        <header className="catalog__header">
          <p className="catalog__eyebrow">Browse by subject</p>
          <div className="catalog__header-row">
            <h2 className="catalog__heading">
              Find a tutor for every subject,<br />every exam board.
            </h2>
            <Link to="/tutors" className="catalog__all-link">
              See all tutors
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </header>

        {levels.length > 1 && (
          <div className="catalog__tabs" role="tablist">
            {levels.map((level) => (
              <button
                key={level}
                role="tab"
                aria-selected={activeLevel === level}
                className={`catalog__tab ${activeLevel === level ? 'catalog__tab--active' : ''}`}
                onClick={() => setActiveLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        )}

        <div className="catalog__streams" ref={cardsRef} role="tabpanel">
          {streams.map((stream, i) => (
            <Link
              key={stream.name}
              to={`/tutors?level=${encodeURIComponent(activeLevel ?? '')}&stream=${encodeURIComponent(stream.name)}`}
              className="catalog__stream-card"
              style={{ '--stagger': i, '--stream-color': stream.color, '--stream-bg': stream.bgTint } as React.CSSProperties}
            >
              <div className="catalog__stream-top" style={{ backgroundColor: stream.bgTint }}>
                <span className="catalog__stream-name" style={{ color: stream.color }}>{stream.name}</span>
              </div>
              <div className="catalog__stream-body">
                <p className="catalog__stream-desc">{stream.blurb}</p>
                <div className="catalog__stream-subjects">
                  {stream.subjects.map((sub) => (
                    <span key={sub} className="catalog__stream-subject" style={{ borderColor: stream.color, color: stream.color }}>
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
              <div className="catalog__stream-footer">
                <span className="catalog__stream-count">
                  {stream.tutors} {stream.tutors === 1 ? 'tutor' : 'tutors'} · {stream.courses} {stream.courses === 1 ? 'course' : 'courses'}
                </span>
                <svg className="catalog__stream-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
