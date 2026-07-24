import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { AVATAR_COLORS, STREAMS, fmtPrice, streamOf } from '../../lib/catalog'
import type { CatalogTeacher } from '../../lib/catalog'
import './FeaturedTutors.css'

function TCard({ t }: { t: CatalogTeacher }) {
  const demoMin = Math.min(...t.courses.map(c => c.demo_duration_min || 30))

  return (
    <article className="tcard">
      <div className="tcard-media">
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt="" className="av-lg tcard-av--img" />
        ) : (
          <span
            className="av-lg"
            style={{ background: AVATAR_COLORS[t.colorIndex] }}
            aria-hidden="true"
          >
            {t.initials}
          </span>
        )}
        {t.idVerified && (
          <span className="badge-verified">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 12.5 11 15.5 16 9" /><circle cx="12" cy="12" r="9.2" />
            </svg>
            ID verified
          </span>
        )}
        <span className="price-chip mono">
          {fmtPrice(t.minPrice, t.currency)}/hr
        </span>
      </div>

      <div className="tcard-body">
        <div className="tc-top">
          <div>
            <div className="tc-name display">{t.name}</div>
            <div className="tc-subj">{t.headline}</div>
          </div>
          {t.yearsExp ? (
            <div className="tc-exp">
              <b className="display">{t.yearsExp}</b>
              <span>{t.yearsExp === 1 ? 'yr' : 'yrs'} teaching</span>
            </div>
          ) : null}
        </div>

        {t.credential && (
          <div className="tc-cred">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
            </svg>
            {t.credential}
          </div>
        )}

        <div className="tc-tags">
          {t.subjects.slice(0, 3).map(s => (
            <span key={s} className="tc-tag">{s}</span>
          ))}
        </div>

        <div className="tc-avail">
          <span className="verified">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" />
            </svg>
            {t.courses.length} {t.courses.length === 1 ? 'course' : 'courses'}
            {t.classDays > 0 && ` · ${t.classDays} ${t.classDays === 1 ? 'day' : 'days'} a week`}
          </span>
        </div>
      </div>

      <div className="tcard-foot">
        <Link className="btn btn-primary btn-sm" to={`/tutors/${t.id}`}>View profile</Link>
        <span className="resp">Free {demoMin}-min demo</span>
      </div>
    </article>
  )
}

export default function FeaturedTutors() {
  const { teachers, loading } = useCatalog()
  const [group, setGroup] = useState('All')

  /* Only offer stream filters that actually have tutors behind them. */
  const groups = useMemo(() => {
    const present = STREAMS
      .map(s => s.name)
      .filter(name => teachers.some(t => t.subjects.some(sub => streamOf(sub) === name)))
    return ['All', ...present]
  }, [teachers])

  const list = useMemo(() => {
    if (group === 'All') return teachers
    return teachers.filter(t => t.subjects.some(sub => streamOf(sub) === group))
  }, [teachers, group])

  if (loading) return null

  return (
    <section className="featured" id="featured" aria-label="Browse tutors">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Our tutors</p>
            <h2 className="display">
              {group === 'All' ? 'Find your tutor.' : `${group} tutors.`}
            </h2>
            <p>Verified credentials. Real exam experience. Every first class is free.</p>
          </div>
          {teachers.length > 0 && (
            <Link to="/tutors" className="tlink">
              Browse all {teachers.length}
              <svg className="ar" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>

        {teachers.length === 0 ? (
          <div className="featured-empty">
            <p className="display">No tutors are live yet.</p>
            <p>
              Courses appear here the moment a teacher is approved and their first
              course is published.
            </p>
            <Link to="/apply" className="btn btn-outline">Apply to teach</Link>
          </div>
        ) : (
          <>
            {groups.length > 2 && (
              <div className="filters" role="group" aria-label="Filter by subject group">
                {groups.map(g => (
                  <button
                    key={g}
                    className="filter"
                    aria-pressed={group === g}
                    onClick={() => setGroup(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            <div className="tutor-grid">
              {list.slice(0, 12).map(t => <TCard key={t.id} t={t} />)}
            </div>

            {list.length > 12 && (
              <div className="featured-more">
                <Link to="/tutors" className="btn btn-outline">
                  See all {list.length} tutors
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
