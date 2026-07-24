import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../hooks/useCatalog'
import { AVATAR_COLORS, catalogStats, fmtPrice } from '../../lib/catalog'
import type { CatalogTeacher } from '../../lib/catalog'
import './Hero.css'

function Avatar({ teacher, size = 50 }: { teacher: CatalogTeacher; size?: number }) {
  if (teacher.avatarUrl) {
    return (
      <img
        src={teacher.avatarUrl}
        alt=""
        className="hero-av hero-av--img"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="hero-av"
      style={{
        width: size,
        height: size,
        background: AVATAR_COLORS[teacher.colorIndex],
        fontSize: size * 0.34,
      }}
      aria-hidden="true"
    >
      {teacher.initials}
    </span>
  )
}

export default function Hero() {
  const { teachers, courses, loading } = useCatalog()

  const [level,   setLevel]   = useState('')
  const [subject, setSubject] = useState('')
  const [board,   setBoard]   = useState('')

  const stats = useMemo(() => catalogStats({ teachers, courses }), [teachers, courses])

  /* Subjects narrow to the chosen level so the picker can never land on
     a combination the catalog has nothing for. */
  const subjectOptions = useMemo(() => {
    const pool = level ? courses.filter(c => c.level === level) : courses
    return Array.from(new Set(pool.map(c => c.subject))).sort()
  }, [courses, level])

  const boardOptions = useMemo(() => {
    const pool = courses.filter(c =>
      (!level   || c.level   === level) &&
      (!subject || c.subject === subject)
    )
    return Array.from(new Set(pool.map(c => c.exam_board))).filter(b => b !== 'N/A').sort()
  }, [courses, level, subject])

  /* Card collage — the four most recently published courses. */
  const collage = useMemo(() => {
    return courses.slice(0, 4).map(course => ({
      course,
      teacher: teachers.find(t => t.id === course.teacher_id),
    })).filter((x): x is { course: typeof courses[0]; teacher: CatalogTeacher } => !!x.teacher)
  }, [courses, teachers])

  const searchHref = [
    level   && `level=${encodeURIComponent(level)}`,
    subject && `subject=${encodeURIComponent(subject)}`,
    board   && `board=${encodeURIComponent(board)}`,
  ].filter(Boolean).join('&')

  const levelEyebrow = stats.levels.length > 0
    ? stats.levels.join(' · ')
    : 'O Levels · A Levels · IGCSE · IB'

  return (
    <section className="hero" aria-label="Find your tutor">
      <div className="hero-wrap">
        <div className="hero-grid">

          {/* ── left column ── */}
          <div className="hero-left">
            <p className="eyebrow">{levelEyebrow}</p>

            <h1 className="hero-h1 display">
              Find a tutor who&rsquo;s already sat{' '}
              <span className="hero-hl">the paper</span>{' '}
              you&rsquo;re about to.
            </h1>

            <p className="hero-lede">
              Verified tutors for every CAIE, Edexcel and AQA subject — matched to your exam board and year group.
            </p>

            {/* Search card */}
            <div className="hero-search">
              <div className="hsf">
                <label>Level</label>
                <div className="hsf-sel-wrap">
                  <select
                    className={`hsf-sel ${!level ? 'ph' : ''}`}
                    value={level}
                    onChange={e => { setLevel(e.target.value); setSubject(''); setBoard('') }}
                    aria-label="Select level"
                  >
                    <option value="">Any level</option>
                    {stats.levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <svg className="hsf-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="hsf hsf--mid">
                <label>Subject</label>
                <div className="hsf-sel-wrap">
                  <select
                    className={`hsf-sel ${!subject ? 'ph' : ''}`}
                    value={subject}
                    onChange={e => { setSubject(e.target.value); setBoard('') }}
                    aria-label="Select subject"
                  >
                    <option value="">Any subject</option>
                    {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="hsf-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="hsf">
                <label>Exam board</label>
                <div className="hsf-sel-wrap">
                  <select
                    className={`hsf-sel ${!board ? 'ph' : ''}`}
                    value={board}
                    onChange={e => setBoard(e.target.value)}
                    aria-label="Select exam board"
                  >
                    <option value="">Any board</option>
                    {boardOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <svg className="hsf-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <Link
                to={`/tutors${searchHref ? `?${searchHref}` : ''}`}
                className="btn btn-primary btn-lg hero-search-btn"
              >
                See tutors
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Trust row */}
            <div className="hero-trust">
              {teachers.length > 0 && (
                <div className="hero-av-row">
                  {teachers.slice(0, 5).map(t => (
                    t.avatarUrl ? (
                      <img key={t.id} src={t.avatarUrl} alt="" className="hero-av-sm hero-av-sm--img" />
                    ) : (
                      <span
                        key={t.id}
                        className="hero-av-sm"
                        style={{ background: AVATAR_COLORS[t.colorIndex] }}
                        aria-hidden="true"
                      >
                        {t.initials}
                      </span>
                    )
                  ))}
                </div>
              )}
              <div className="ht">
                <b className="display">{loading ? '—' : stats.tutors}</b>
                <span>verified<br />{stats.tutors === 1 ? 'tutor' : 'tutors'}</span>
              </div>
              <div className="ht">
                <b className="display">{loading ? '—' : stats.courses}</b>
                <span>{stats.courses === 1 ? 'course' : 'courses'}<br />running</span>
              </div>
              <div className="ht">
                <b className="display">Free</b>
                <span>{stats.minDemoMin ?? 30}-min<br />demo class</span>
              </div>
            </div>
          </div>

          {/* ── right column — card collage ── */}
          {collage.length > 0 && (
            <div
              className={`hero-collage${collage.length < 3 ? ' hero-collage--sparse' : ''}`}
              aria-hidden="true"
            >
              {collage.map(({ course, teacher }, i) => (
                <div key={course.id} className={`fc fc-${i + 1}`}>
                  <div className="fc-head">
                    <Avatar teacher={teacher} />
                    <div>
                      <div className="fc-name display">{teacher.name}</div>
                      <div className="fc-sub">{course.level} {course.subject}</div>
                    </div>
                  </div>
                  <div className="fc-foot">
                    <span className="fc-board">
                      {course.exam_board !== 'N/A' ? course.exam_board : course.level}
                    </span>
                    <span className="mono price">
                      {fmtPrice(course.rate_per_hour, course.currency)}/hr
                    </span>
                  </div>
                </div>
              ))}

              {/* Floating stat chips */}
              <div className="float-stat float-1">
                <b className="display">{stats.tutors}</b>
                <span>verified<br />{stats.tutors === 1 ? 'tutor' : 'tutors'}</span>
              </div>
              <div className="float-stat float-2">
                <b className="display">{stats.subjects}</b>
                <span>{stats.subjects === 1 ? 'subject' : 'subjects'}<br />covered</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
