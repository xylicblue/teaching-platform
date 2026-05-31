import { useState } from 'react'
import { TUTORS, AVATAR_COLORS } from '../../data/tutors'
import './Hero.css'

const LEVELS = ['O Level', 'A Level', 'IGCSE', 'IB']
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Economics', 'Computer Science', 'English', 'Urdu']
const BOARDS = ['CAIE', 'Edexcel', 'AQA', 'OCR']

// 4 tutor cards for the collage
const COLLAGE = [TUTORS[0], TUTORS[1], TUTORS[2], TUTORS[6]]

function Avatar({ tutor, size = 50 }: { tutor: typeof TUTORS[0]; size?: number }) {
  return (
    <span
      className="hero-av"
      style={{ width: size, height: size, background: AVATAR_COLORS[tutor.c], fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {tutor.i}
    </span>
  )
}

export default function Hero() {
  const [level, setLevel] = useState('')
  const [subject, setSubject] = useState('')
  const [board, setBoard] = useState('')

  return (
    <section className="hero" aria-label="Find your tutor">
      <div className="hero-wrap">
        <div className="hero-grid">

          {/* ── left column ── */}
          <div className="hero-left">
            <p className="eyebrow">O Levels · A Levels · IGCSE · IB</p>

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
                    onChange={e => { setLevel(e.target.value); setSubject('') }}
                    aria-label="Select level"
                  >
                    <option value="">Any level</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
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
                    onChange={e => setSubject(e.target.value)}
                    aria-label="Select subject"
                  >
                    <option value="">Any subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
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
                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <svg className="hsf-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <a
                href={`/tutors${level ? `?level=${encodeURIComponent(level)}` : ''}${subject ? `&subject=${encodeURIComponent(subject)}` : ''}${board ? `&board=${encodeURIComponent(board)}` : ''}`}
                className="btn btn-primary btn-lg hero-search-btn"
              >
                See tutors
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Trust row */}
            <div className="hero-trust">
              <div className="hero-av-row">
                {TUTORS.filter(t => t.online).slice(0, 5).map(t => (
                  <span
                    key={t.n}
                    className="hero-av-sm"
                    style={{ background: AVATAR_COLORS[t.c] }}
                    aria-hidden="true"
                  >
                    {t.i}
                  </span>
                ))}
              </div>
              <div className="ht">
                <b className="display">2,400+</b>
                <span>sessions<br />taught</span>
              </div>
              <div className="ht">
                <b className="display">4.9</b>
                <span>average<br />tutor rating</span>
              </div>
              <div className="ht">
                <b className="display">Free</b>
                <span>30-min<br />demo class</span>
              </div>
            </div>
          </div>

          {/* ── right column — card collage ── */}
          <div className="hero-collage" aria-hidden="true">
            {/* Floating tutor cards */}
            {COLLAGE.map((t, i) => (
              <div key={t.n} className={`fc fc-${i + 1}`}>
                <div className="fc-head">
                  <Avatar tutor={t} />
                  <div>
                    <div className="fc-name display">{t.n}</div>
                    <div className="fc-sub">{t.subj.replace('A-Level & ', '').replace('A-Level ', '')}</div>
                  </div>
                </div>
                <div className="fc-foot">
                  <span className="rating">
                    <span className="star">★</span> {t.r.toFixed(1)}
                    <span className="rc"> ({t.rev})</span>
                  </span>
                  <span className="mono price">Rs {t.price.toLocaleString()}/hr</span>
                </div>
              </div>
            ))}

            {/* Floating stat chips */}
            <div className="float-stat float-1">
              <b className="display">247</b>
              <span>verified<br />tutors</span>
            </div>
            <div className="float-stat float-2">
              <span className="star">★</span>
              <b className="display">4.9</b>
              <span>average<br />rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
