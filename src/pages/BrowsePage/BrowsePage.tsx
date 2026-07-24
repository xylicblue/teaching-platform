import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar       from '../../components/Navbar/Navbar'
import Footer       from '../../components/Footer/Footer'
import FilterGroups from '../../components/browse/FilterGroups/FilterGroups'
import TutorRow     from '../../components/browse/TutorRow/TutorRow'
import { useCatalog } from '../../hooks/useCatalog'
import { catalogStats, sortLevels, streamOf, fmtPrice } from '../../lib/catalog'
import type { CatalogCourse, CatalogTeacher } from '../../lib/catalog'
import './BrowsePage.css'

export type BrowseFilters = {
  level:      string | null
  subject:    string | null
  board:      string | null
  stream:     string | null
  day:        string | null
  courseType: string | null
  maxPrice:   number
  sort:       string
}

const SORT_OPTIONS = [
  { key: 'relevant', label: 'Most relevant' },
  { key: 'newest',   label: 'Newest'        },
  { key: 'low',      label: 'Lowest price'  },
  { key: 'high',     label: 'Highest price' },
  { key: 'courses',  label: 'Most courses'  },
]

const DAY_ORDER = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const PRICE_ANY = Number.MAX_SAFE_INTEGER

/** Does this course satisfy every course-level filter? */
function courseMatches(c: CatalogCourse, f: BrowseFilters): boolean {
  if (f.level      && c.level      !== f.level)              return false
  if (f.subject    && c.subject    !== f.subject)            return false
  if (f.board      && c.exam_board !== f.board)              return false
  if (f.stream     && streamOf(c.subject) !== f.stream)      return false
  if (f.courseType && c.course_type !== f.courseType)        return false
  if (f.day        && !(c.days_of_week ?? []).includes(f.day)) return false
  if (c.rate_per_hour > f.maxPrice)                          return false
  return true
}

export default function BrowsePage() {
  const [searchParams] = useSearchParams()
  const { teachers, courses, loading } = useCatalog()
  const [sheetOpen, setSheetOpen] = useState(false)

  const [filters, setFilters] = useState<BrowseFilters>({
    level:      searchParams.get('level'),
    subject:    searchParams.get('subject'),
    board:      searchParams.get('board'),
    stream:     searchParams.get('stream'),
    day:        null,
    courseType: null,
    maxPrice:   PRICE_ANY,
    sort:       'relevant',
  })

  const stats = useMemo(() => catalogStats({ teachers, courses }), [teachers, courses])

  /* Every filter option below is derived from live courses. */
  const options = useMemo(() => {
    const priceMax = courses.length
      ? Math.ceil(Math.max(...courses.map(c => c.rate_per_hour)) / 500) * 500
      : 5000
    return {
      levels:   sortLevels(Array.from(new Set(courses.map(c => c.level)))),
      subjects: Array.from(new Set(courses.map(c => c.subject))).sort(),
      boards:   Array.from(new Set(courses.map(c => c.exam_board))).filter(b => b !== 'N/A').sort(),
      days:     DAY_ORDER.filter(d => courses.some(c => (c.days_of_week ?? []).includes(d))),
      priceMax,
      currency: courses[0]?.currency ?? 'PKR',
    }
  }, [courses])

  /* Once the catalog loads, snap an "Any price" slider to the real ceiling. */
  useEffect(() => {
    if (courses.length === 0) return
    setFilters(f => (f.maxPrice === PRICE_ANY ? { ...f, maxPrice: options.priceMax } : f))
  }, [courses.length, options.priceMax])

  const setFilter = (key: keyof BrowseFilters, value: unknown) =>
    setFilters(f => ({ ...f, [key]: value }))

  const clearOne = (key: string) => {
    if (key === 'maxPrice') setFilters(f => ({ ...f, maxPrice: options.priceMax }))
    else setFilters(f => ({ ...f, [key]: null }))
  }

  const clearAll = () => setFilters(f => ({
    level: null, subject: null, board: null, stream: null,
    day: null, courseType: null, maxPrice: options.priceMax, sort: f.sort,
  }))

  /* A tutor is in the results if at least one of their courses matches.
     We carry the matching subset through so the card shows only what fits. */
  const matched = useMemo(() => {
    return teachers
      .map(t => {
        const hits = t.courses.filter(c => courseMatches(c, filters))
        if (hits.length === 0) return null
        return {
          ...t,
          courses:  hits,
          minPrice: Math.min(...hits.map(c => c.rate_per_hour)),
          boards:   Array.from(new Set(hits.map(c => c.exam_board))).filter(b => b !== 'N/A'),
          subjects: Array.from(new Set(hits.map(c => c.subject))),
        } as CatalogTeacher
      })
      .filter((t): t is CatalogTeacher => t !== null)
  }, [teachers, filters])

  const sorted = useMemo(() => {
    const a = [...matched]
    if (filters.sort === 'low')          a.sort((x, y) => x.minPrice - y.minPrice)
    else if (filters.sort === 'high')    a.sort((x, y) => y.minPrice - x.minPrice)
    else if (filters.sort === 'courses') a.sort((x, y) => y.courses.length - x.courses.length)
    else if (filters.sort === 'newest')  a.sort((x, y) =>
      (y.courses[0]?.created_at ?? '').localeCompare(x.courses[0]?.created_at ?? ''))
    else a.sort((x, y) =>
      y.courses.length - x.courses.length || (y.yearsExp ?? 0) - (x.yearsExp ?? 0))
    return a
  }, [matched, filters.sort])

  /* Feature the most experienced tutors, but only once there are enough
     results that "featured" means something. */
  const showFeatured = filters.sort === 'relevant' && sorted.length >= 4
  const featured = showFeatured ? sorted.slice(0, 2) : []
  const rest     = showFeatured ? sorted.slice(2)    : sorted

  type Chip = [string, string]
  const chips: Chip[] = []
  if (filters.level)      chips.push(['level',      filters.level])
  if (filters.subject)    chips.push(['subject',    filters.subject])
  if (filters.board)      chips.push(['board',      filters.board])
  if (filters.stream)     chips.push(['stream',     filters.stream])
  if (filters.day)        chips.push(['day',        `${filters.day} classes`])
  if (filters.courseType) chips.push(['courseType', filters.courseType === 'fixed' ? 'Fixed-length' : 'Ongoing weekly'])
  if (filters.maxPrice < options.priceMax) {
    chips.push(['maxPrice', `Under ${fmtPrice(filters.maxPrice, options.currency)}`])
  }

  const hlSubject = filters.subject || filters.stream || filters.level || null
  const headline = filters.subject && filters.level
    ? `Find your <span class="hl">${filters.level} ${filters.subject}</span> tutor.`
    : filters.subject
      ? `Find your <span class="hl">${filters.subject}</span> tutor.`
      : filters.level
        ? `Find your <span class="hl">${filters.level}</span> tutor.`
        : 'Find your <span class="hl">perfect</span> tutor.'

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  const filterProps = {
    filters, onChange: setFilter, onClear: clearAll,
    levels: options.levels, subjects: options.subjects, boards: options.boards,
    days: options.days, priceMax: options.priceMax, currency: options.currency,
  }

  return (
    <div className="browse-page">
      <Navbar />

      {/* ── Search hero ── */}
      <section className="searchhero">
        <div className="wrap">
          <div className="sh-eyebrow">
            <Link to="/" style={{ fontSize: 13, color: 'var(--slate)' }}>Home</Link>
            <span style={{ color: 'var(--slate)', opacity: 0.5 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {hlSubject ? `${hlSubject} Tutors` : 'All Tutors'}
            </span>
          </div>

          <h1 className="sh-title display" dangerouslySetInnerHTML={{ __html: headline }} />
          <p className="sh-sub">
            Browse verified specialists who&rsquo;ve sat the exact paper you&rsquo;re preparing for.
            Compare subjects, schedules and prices — then start with a free demo.
          </p>

          {/* Search bar — selects, so you can only ask for what exists */}
          <div className="searchbar" role="search">
            <div className="sbf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <select
                value={filters.subject ?? ''}
                aria-label="Subject"
                onChange={e => setFilter('subject', e.target.value || null)}
              >
                <option value="">Any subject</option>
                {options.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sbf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
              </svg>
              <select
                value={filters.level ?? ''}
                aria-label="Level"
                onChange={e => setFilter('level', e.target.value || null)}
              >
                <option value="">Any level</option>
                {options.levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="sbf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h6" />
              </svg>
              <select
                value={filters.board ?? ''}
                aria-label="Exam board"
                onChange={e => setFilter('board', e.target.value || null)}
              >
                <option value="">Any board</option>
                {options.boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <a href="#results" className="btn btn-primary btn-lg">Search</a>
          </div>

          {/* Trust strip — live counts, no animation over invented numbers */}
          <div className="trust-strip">
            <div className="ts">
              <b>{stats.tutors}</b>
              <span>{stats.tutors === 1 ? 'verified tutor' : 'verified tutors'}</span>
            </div>
            <div className="ts">
              <b>{stats.courses}</b>
              <span>{stats.courses === 1 ? 'course' : 'courses'} published</span>
            </div>
            <div className="ts">
              <b>{stats.subjects}</b>
              <span>{stats.subjects === 1 ? 'subject' : 'subjects'} covered</span>
            </div>
            <div className="ts">
              <b>Free</b>
              <span>first demo class</span>
            </div>
          </div>
        </div>
      </section>

      <main className="wrap browse" id="results">
        {/* Mobile controls */}
        <div className="mob-controls">
          <button className="btn btn-outline" onClick={() => setSheetOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filters {chips.length > 0 && <span className="mob-badge">{chips.length}</span>}
          </button>
          <button className="btn btn-outline" onClick={() => setSheetOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h12M3 12h9M3 18h6M17 8V4m0 0-2 2m2-2 2 2" />
            </svg>
            Sort
          </button>
        </div>

        <div className="bcols">
          {/* ── Filter sidebar ── */}
          <aside className="fside" aria-label="Filters">
            <FilterGroups {...filterProps} />
            {chips.length > 0 && (
              <button className="fclear" onClick={clearAll}>Clear all filters</button>
            )}
          </aside>

          {/* ── Results column ── */}
          <div className="results-col">
            {chips.length > 0 && (
              <div className="chips">
                {chips.map(([key, label]) => (
                  <span key={key} className="chip">
                    {label}
                    <button aria-label={`Remove ${label} filter`} onClick={() => clearOne(key)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button className="fclear" onClick={clearAll}>Clear all</button>
              </div>
            )}

            <div className="sortbar">
              <div className="count">
                <b className="display">{loading ? '—' : matched.length}</b>{' '}
                {matched.length === 1 ? 'tutor' : 'tutors'} found
              </div>
              <div className="sort-tabs" role="group" aria-label="Sort by">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className="sort-tab"
                    aria-pressed={filters.sort === opt.key}
                    onClick={() => setFilter('sort', opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {showFeatured && (
              <div className="featured-wrap">
                <div className="feat-head">
                  <span className="fl display">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17l-6.1 3.3 1.4-6.7-5-4.6 6.8-.7z" />
                    </svg>
                    Featured tutors
                  </span>
                  <span className="feat-note">Most experienced tutors matching your search</span>
                </div>
                <div className="rlist">
                  {featured.map(t => <TutorRow key={t.id} tutor={t} featured />)}
                </div>
              </div>
            )}

            <div className="rlist">
              {loading ? (
                <div className="empty-state"><p>Loading tutors…</p></div>
              ) : rest.length === 0 && featured.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {courses.length === 0
                      ? 'No courses have been published yet.'
                      : 'No tutors match these filters.'}
                  </p>
                  {courses.length === 0 ? (
                    <Link className="btn btn-outline" to="/apply">Apply to teach</Link>
                  ) : (
                    <button className="fclear" onClick={clearAll} style={{ fontSize: 15 }}>
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                rest.map(t => <TutorRow key={t.id} tutor={t} />)
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="mcta">
        <a className="btn btn-primary" href="#results" style={{ flex: 1 }}>
          View {matched.length} {matched.length === 1 ? 'tutor' : 'tutors'}
        </a>
      </div>

      {/* Mobile filter sheet */}
      <div
        className={`sheet-backdrop ${sheetOpen ? 'open' : ''}`}
        onClick={() => setSheetOpen(false)}
        aria-hidden="true"
      />
      <div className={`sheet ${sheetOpen ? 'open' : ''}`} aria-label="Filters and sort">
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <h3 className="display">Filters &amp; sort</h3>
          <button onClick={() => setSheetOpen(false)} aria-label="Close filters">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="fgroup">
          <h4>Sort by</h4>
          <div className="fpills">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className="fpill"
                style={{ border: '1px solid var(--line)' }}
                aria-pressed={filters.sort === opt.key}
                onClick={() => setFilter('sort', opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <hr className="fdivider" />

        <FilterGroups {...filterProps} />

        <div className="sheet-foot">
          <button className="btn btn-outline" onClick={clearAll}>Clear all</button>
          <button className="btn btn-primary" onClick={() => setSheetOpen(false)}>
            Show {matched.length} {matched.length === 1 ? 'tutor' : 'tutors'}
          </button>
        </div>
      </div>
    </div>
  )
}
