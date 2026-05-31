import { useState, useEffect, useRef } from 'react'
import './Catalog.css'

const LEVELS = ['O Level', 'A Level', 'IGCSE', 'MYP', 'IB']

type Stream = {
  name: string
  description: string
  subjects: string[]
  count: number
  color: string
  bgTint: string
}

const CATALOG: Record<string, Stream[]> = {
  'O Level': [
    { name: 'Sciences', description: 'Physics, Chemistry, Biology — CAIE and Edexcel syllabi covered fully', subjects: ['Physics', 'Chemistry', 'Biology', 'Computer Science'], count: 48, color: '#1A6B4A', bgTint: '#EBF4EF' },
    { name: 'Mathematics', description: 'Pure Maths, Extended and Additional Mathematics', subjects: ['Mathematics', 'Additional Maths', 'Statistics', 'Computer Science'], count: 32, color: '#1F4A3D', bgTint: '#EBF4EF' },
    { name: 'Humanities', description: 'History, Geography, Sociology and Social Sciences', subjects: ['History', 'Geography', 'Sociology', 'Economics'], count: 27, color: '#7B4F3A', bgTint: '#F5EDE8' },
    { name: 'Languages', description: 'English, Urdu, French, Arabic — first and second language', subjects: ['English', 'Urdu', 'French', 'Arabic'], count: 21, color: '#C9923B', bgTint: '#FDF5E8' },
    { name: 'Commerce', description: 'Business Studies, Economics and Accounting', subjects: ['Economics', 'Business Studies', 'Accounting', 'Commerce'], count: 19, color: '#3B5A78', bgTint: '#EBF0F5' },
  ],
  'A Level': [
    { name: 'Sciences', description: 'Physics, Chemistry, Biology and Further Sciences for CAIE and Edexcel', subjects: ['Physics', 'Chemistry', 'Biology', 'Computer Science'], count: 61, color: '#1A6B4A', bgTint: '#EBF4EF' },
    { name: 'Mathematics', description: 'A-level Maths, Further Maths, Statistics and Mechanics', subjects: ['Mathematics', 'Further Maths', 'Statistics', 'Mechanics'], count: 44, color: '#1F4A3D', bgTint: '#EBF4EF' },
    { name: 'Humanities', description: 'History, Geography, Psychology, Sociology and Philosophy', subjects: ['History', 'Geography', 'Psychology', 'Sociology'], count: 33, color: '#7B4F3A', bgTint: '#F5EDE8' },
    { name: 'Languages', description: 'English Literature, English Language, Urdu, French', subjects: ['English Lit', 'English Lang', 'Urdu', 'French'], count: 18, color: '#C9923B', bgTint: '#FDF5E8' },
    { name: 'Commerce', description: 'Economics, Business Studies, Accounting and Law', subjects: ['Economics', 'Business Studies', 'Accounting', 'Law'], count: 29, color: '#3B5A78', bgTint: '#EBF0F5' },
  ],
  'IGCSE': [
    { name: 'Sciences', description: 'IGCSE Physics, Chemistry, Biology — CAIE core syllabus', subjects: ['Physics', 'Chemistry', 'Biology', 'Computer Science'], count: 39, color: '#1A6B4A', bgTint: '#EBF4EF' },
    { name: 'Mathematics', description: 'Core and Extended Mathematics for IGCSE', subjects: ['Mathematics', 'Additional Maths', 'Statistics', 'Computer Sci'], count: 28, color: '#1F4A3D', bgTint: '#EBF4EF' },
    { name: 'Humanities', description: 'History, Geography and Global Perspectives', subjects: ['History', 'Geography', 'Global Perspectives', 'Economics'], count: 17, color: '#7B4F3A', bgTint: '#F5EDE8' },
    { name: 'Languages', description: 'English First and Second Language, Urdu', subjects: ['English', 'Urdu', 'French', 'Arabic'], count: 22, color: '#C9923B', bgTint: '#FDF5E8' },
    { name: 'Commerce', description: 'Business Studies, Economics, Accounting', subjects: ['Economics', 'Business Studies', 'Accounting', 'Commerce'], count: 14, color: '#3B5A78', bgTint: '#EBF0F5' },
  ],
  'MYP': [
    { name: 'Sciences', description: 'Integrated Sciences for MYP 1–5', subjects: ['Sciences', 'Biology', 'Chemistry', 'Physics'], count: 12, color: '#1A6B4A', bgTint: '#EBF4EF' },
    { name: 'Mathematics', description: 'MYP Mathematics and Extended Mathematics', subjects: ['Mathematics', 'Extended Maths', 'Statistics', 'Computer Sci'], count: 16, color: '#1F4A3D', bgTint: '#EBF4EF' },
    { name: 'Humanities', description: 'Individuals and Societies — History, Geography', subjects: ['History', 'Geography', 'Economics', 'Global Politics'], count: 9, color: '#7B4F3A', bgTint: '#F5EDE8' },
    { name: 'Languages', description: 'Language A and Language B for MYP learners', subjects: ['English', 'Urdu', 'French', 'Arabic'], count: 11, color: '#C9923B', bgTint: '#FDF5E8' },
    { name: 'Arts & Design', description: 'Visual Arts, Design Technology, Theatre', subjects: ['Visual Arts', 'Design', 'Theatre', 'Music'], count: 6, color: '#6B3A7D', bgTint: '#F2EBF5' },
  ],
  'IB': [
    { name: 'Sciences', description: 'IB Diploma Sciences — SL & HL Physics, Chemistry, Biology', subjects: ['Physics', 'Chemistry', 'Biology', 'Computer Sci'], count: 24, color: '#1A6B4A', bgTint: '#EBF4EF' },
    { name: 'Mathematics', description: 'IB Maths Analysis and Maths Applications (SL & HL)', subjects: ['Maths AA', 'Maths AI', 'Further Maths', 'Statistics'], count: 19, color: '#1F4A3D', bgTint: '#EBF4EF' },
    { name: 'Humanities', description: 'History, Geography, Global Politics, Economics', subjects: ['History', 'Geography', 'Global Politics', 'Economics'], count: 15, color: '#7B4F3A', bgTint: '#F5EDE8' },
    { name: 'Languages', description: 'English A, English B, Urdu, Language A & B', subjects: ['English A', 'English B', 'Urdu', 'French'], count: 13, color: '#C9923B', bgTint: '#FDF5E8' },
    { name: 'Commerce', description: 'IB Business Management and Economics', subjects: ['Business', 'Economics', 'Accounting', 'Finance'], count: 11, color: '#3B5A78', bgTint: '#EBF0F5' },
  ],
}

export default function Catalog() {
  const [activeLevel, setActiveLevel] = useState('A Level')
  const cardsRef = useRef<HTMLDivElement>(null)

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
  }, [activeLevel])

  const streams = CATALOG[activeLevel] ?? []

  return (
    <section className="catalog" id="catalog">
      <div className="catalog__inner">
        <header className="catalog__header">
          <p className="catalog__eyebrow">Browse by subject</p>
          <div className="catalog__header-row">
            <h2 className="catalog__heading">
              Find a tutor for every subject,<br />every exam board.
            </h2>
            <a href="/tutors" className="catalog__all-link">
              See all tutors
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </header>

        <div className="catalog__tabs" role="tablist">
          {LEVELS.map((level) => (
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

        <div className="catalog__streams" ref={cardsRef} role="tabpanel">
          {streams.map((stream, i) => (
            <a
              key={stream.name}
              href={`/tutors?level=${encodeURIComponent(activeLevel)}&stream=${encodeURIComponent(stream.name)}`}
              className="catalog__stream-card"
              style={{ '--stagger': i, '--stream-color': stream.color, '--stream-bg': stream.bgTint } as React.CSSProperties}
            >
              <div className="catalog__stream-top" style={{ backgroundColor: stream.bgTint }}>
                <span className="catalog__stream-name" style={{ color: stream.color }}>{stream.name}</span>
              </div>
              <div className="catalog__stream-body">
                <p className="catalog__stream-desc">{stream.description}</p>
                <div className="catalog__stream-subjects">
                  {stream.subjects.map((sub) => (
                    <span key={sub} className="catalog__stream-subject" style={{ borderColor: stream.color, color: stream.color }}>
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
              <div className="catalog__stream-footer">
                <span className="catalog__stream-count">{stream.count} tutors</span>
                <svg className="catalog__stream-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
