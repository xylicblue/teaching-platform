import { useState, useMemo, useEffect, useRef, Fragment } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar        from '../../components/Navbar/Navbar'
import Footer        from '../../components/Footer/Footer'
import FilterGroups  from '../../components/browse/FilterGroups/FilterGroups'
import TutorRow      from '../../components/browse/TutorRow/TutorRow'
import StoryStrip    from '../../components/browse/StoryStrip/StoryStrip'
import {
  BROWSE_TUTORS,
  BROWSE_STORIES,
  TYPE_LABEL,
} from '../../data/browseData'
import './BrowsePage.css'

export type BrowseFilters = {
  level:      string | null
  subject:    string | null
  board:      string | null
  type:       string | null
  rating:     number
  maxPrice:   number
  availToday: boolean
  sort:       string
}

const SORT_OPTIONS = [
  { key: 'relevant', label: 'Most relevant'      },
  { key: 'rated',    label: 'Highest rated'       },
  { key: 'reviews',  label: 'Most reviews'        },
  { key: 'low',      label: 'Lowest price'        },
  { key: 'high',     label: 'Highest price'       },
  { key: 'week',     label: 'Available this week' },
]

function useCounter(target: number, dec = false, suffix = '') {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now(), dur = 1100
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        const ease = 1 - Math.pow(1 - p, 3)
        const v = target * ease
        setValue((dec ? v.toFixed(1) : Math.floor(v).toLocaleString()) + suffix)
        if (p < 1) requestAnimationFrame(step)
        else setValue((dec ? target.toFixed(1) : target.toLocaleString()) + suffix)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, dec, suffix])
  return { ref, value: value || (dec ? target.toFixed(1) : target.toLocaleString()) + suffix }
}

export default function BrowsePage() {
  const [searchParams] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)

  const [filters, setFilters] = useState<BrowseFilters>({
    level:      searchParams.get('level'),
    subject:    searchParams.get('subject'),
    board:      searchParams.get('board'),
    type:       null,
    rating:     0,
    maxPrice:   5000,
    availToday: false,
    sort:       'relevant',
  })

  const setFilter = (key: keyof BrowseFilters, value: unknown) => {
    setFilters(f => ({ ...f, [key]: value }))
  }

  const clearOne = (key: string) => {
    if (key === 'rating')    setFilters(f => ({ ...f, rating: 0 }))
    else if (key === 'maxPrice')   setFilters(f => ({ ...f, maxPrice: 5000 }))
    else if (key === 'availToday') setFilters(f => ({ ...f, availToday: false }))
    else setFilters(f => ({ ...f, [key]: null }))
  }

  const clearAll = () => setFilters(f => ({
    level: null, subject: null, board: null, type: null,
    rating: 0, maxPrice: 5000, availToday: false, sort: f.sort,
  }))

  // Filter + sort
  const matched = useMemo(() => {
    return BROWSE_TUTORS.filter(t => {
      if (filters.level      && !t.lvl.includes(filters.level))      return false
      if (filters.subject    && !t.subj.includes(filters.subject))   return false
      if (filters.board      && !t.boards.includes(filters.board))   return false
      if (filters.type       && !t.type.includes(filters.type))      return false
      if (filters.rating     && t.r < filters.rating)                 return false
      if (t.price > filters.maxPrice)                                 return false
      if (filters.availToday && t.avail !== 'today')                  return false
      return true
    })
  }, [filters])

  const sorted = useMemo(() => {
    const a = [...matched]
    if (filters.sort === 'rated')   a.sort((x,y) => y.r - x.r || y.rev - x.rev)
    else if (filters.sort === 'reviews') a.sort((x,y) => y.rev - x.rev)
    else if (filters.sort === 'low')     a.sort((x,y) => x.price - y.price)
    else if (filters.sort === 'high')    a.sort((x,y) => y.price - x.price)
    else if (filters.sort === 'week')    a.sort((x,y) => (x.avail === 'today' ? 0 : 1) - (y.avail === 'today' ? 0 : 1))
    else a.sort((x,y) => (y.feat ? 1 : 0) - (x.feat ? 1 : 0) || y.r - x.r)
    return a
  }, [matched, filters.sort])

  const showFeatured = filters.sort === 'relevant'
  const featured = showFeatured ? sorted.filter(t => t.feat) : []
  const rest = showFeatured ? sorted.filter(t => !t.feat) : sorted

  // Active filter chips
  type Chip = [string, string]
  const chips: Chip[] = []
  if (filters.level)      chips.push(['level',      filters.level])
  if (filters.subject)    chips.push(['subject',     filters.subject])
  if (filters.board)      chips.push(['board',       filters.board])
  if (filters.type)       chips.push(['type',        TYPE_LABEL[filters.type]])
  if (filters.rating)     chips.push(['rating',      `${filters.rating.toFixed(1)}★ & up`])
  if (filters.availToday) chips.push(['availToday',  'Available today'])
  if (filters.maxPrice < 5000) chips.push(['maxPrice', `Under Rs ${filters.maxPrice.toLocaleString()}`])

  // Dynamic headline
  const hlSubject = filters.subject || (filters.level ? filters.level : null)
  const headline = filters.subject && filters.level
    ? `Find your <span class="hl">${filters.level} ${filters.subject}</span> tutor.`
    : filters.subject
      ? `Find your <span class="hl">${filters.subject}</span> tutor.`
      : filters.level
        ? `Find your <span class="hl">${filters.level}</span> tutor.`
        : 'Find your <span class="hl">perfect</span> tutor.'

  // Close sheet on backdrop click
  useEffect(() => {
    if (sheetOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  const c1 = useCounter(600,  false, '+')
  const c2 = useCounter(4.9,  true,  '')
  const c3 = useCounter(12000, false, '+')
  const c4 = useCounter(85,   false, '%')

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

          <h1
            className="sh-title display"
            dangerouslySetInnerHTML={{ __html: headline }}
          />
          <p className="sh-sub">
            Browse verified specialists who&rsquo;ve sat the exact paper you&rsquo;re preparing for.
            Compare ratings, prices and availability — then start with a free demo.
          </p>

          {/* Search bar */}
          <div className="searchbar" role="search">
            <div className="sbf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                defaultValue={filters.subject ?? ''}
                placeholder="Physics, Chemistry, Maths…"
                aria-label="Subject"
                onBlur={e => setFilter('subject', e.target.value || null)}
              />
            </div>
            <div className="sbf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
              </svg>
              <input
                type="text"
                defaultValue={filters.level ?? ''}
                placeholder="A-Level, O-Level, IGCSE…"
                aria-label="Level"
                onBlur={e => setFilter('level', e.target.value || null)}
              />
            </div>
            <div className="sbf">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h6" />
              </svg>
              <input
                type="text"
                defaultValue={filters.board ?? ''}
                placeholder="CAIE, Edexcel, AQA…"
                aria-label="Exam board"
                onBlur={e => setFilter('board', e.target.value || null)}
              />
            </div>
            <button className="btn btn-primary btn-lg">Search</button>
          </div>

          {/* Trust strip with animated counters */}
          <div className="trust-strip">
            <div className="ts">
              <b><span ref={c1.ref}>{c1.value}</span></b>
              <span>verified tutors</span>
            </div>
            <div className="ts">
              <b><span className="star">★</span><span ref={c2.ref}>{c2.value}</span></b>
              <span>average rating</span>
            </div>
            <div className="ts">
              <b><span ref={c3.ref}>{c3.value}</span></b>
              <span>lessons delivered</span>
            </div>
            <div className="ts">
              <b><span ref={c4.ref}>{c4.value}</span></b>
              <span>continue after demo</span>
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
            <FilterGroups filters={filters} onChange={setFilter} onClear={clearAll} />
            {chips.length > 0 && (
              <button className="fclear" onClick={clearAll}>Clear all filters</button>
            )}
          </aside>

          {/* ── Results column ── */}
          <div className="results-col">
            {/* Active chips */}
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

            {/* Sort bar */}
            <div className="sortbar">
              <div className="count">
                <b className="display">{matched.length}</b> tutors found
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

            {/* Featured row */}
            {showFeatured && featured.length >= 2 && (
              <div className="featured-wrap">
                <div className="feat-head">
                  <span className="fl display">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 2 2.9 6.3 6.8.7-5 4.6 1.4 6.7L12 17l-6.1 3.3 1.4-6.7-5-4.6 6.8-.7z" />
                    </svg>
                    Featured tutors
                  </span>
                  <span className="fb">Top rated</span>
                  <span className="feat-note">Highest-rated tutors matching your search</span>
                </div>
                <div className="rlist">
                  {featured.slice(0, 2).map(t => (
                    <TutorRow key={t.id} tutor={t} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Main list with story interstitials */}
            <div className="rlist">
              {rest.length === 0 && !showFeatured ? (
                <div className="empty-state">
                  <p>No tutors match these filters.</p>
                  <button className="fclear" onClick={clearAll} style={{ fontSize: 15 }}>
                    Clear all filters
                  </button>
                </div>
              ) : (
                rest.map((t, i) => (
                  <Fragment key={t.id}>
                    <TutorRow tutor={t} />
                    {(i + 1) % 5 === 0 && BROWSE_STORIES[Math.floor(i / 5) % BROWSE_STORIES.length] && (
                      <StoryStrip
                        {...BROWSE_STORIES[Math.floor(i / 5) % BROWSE_STORIES.length]}
                      />
                    )}
                  </Fragment>
                ))
              )}
            </div>

            {matched.length > 0 && (
              <button className="btn btn-outline loadmore">Show more tutors</button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="mcta">
        <a className="btn btn-primary" href="#results" style={{ flex: 1 }}>
          View {matched.length} tutors
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

        {/* Sort in sheet */}
        <div className="fgroup">
          <h4>Sort by</h4>
          <div className="fpills">
            {SORT_OPTIONS.slice(0, 4).map(opt => (
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

        <FilterGroups filters={filters} onChange={setFilter} onClear={clearAll} />

        <div className="sheet-foot">
          <button className="btn btn-outline" onClick={clearAll}>Clear all</button>
          <button className="btn btn-primary" onClick={() => setSheetOpen(false)}>
            Show {matched.length} tutors
          </button>
        </div>
      </div>
    </div>
  )
}
