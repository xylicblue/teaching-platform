import type { BrowseFilters } from '../../../pages/BrowsePage/BrowsePage'
import './FilterGroups.css'

type Props = {
  filters:   BrowseFilters
  onChange:  (key: keyof BrowseFilters, value: unknown) => void
  onClear?:  () => void
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className="fpill" aria-pressed={active} onClick={onClick}>{label}</button>
  )
}

function TypePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className="fpill tt" aria-pressed={active} onClick={onClick}>{label}</button>
  )
}

export default function FilterGroups({ filters, onChange }: Props) {
  const toggle = (key: keyof BrowseFilters, val: string) => {
    onChange(key, filters[key] === val ? null : val)
  }

  return (
    <>
      <div className="fgroup">
        <h4>Level</h4>
        <div className="fpills">
          {['O-Level','A-Level','IGCSE','IB','MYP'].map(v => (
            <Pill key={v} label={v} active={filters.level === v} onClick={() => toggle('level', v)} />
          ))}
        </div>
      </div>
      <hr className="fdivider" />

      <div className="fgroup">
        <h4>Subject</h4>
        <div className="fpills">
          {[
            ['Physics','Physics'],
            ['Chemistry','Chemistry'],
            ['Biology','Biology'],
            ['Mathematics','Mathematics'],
            ['Economics','Economics'],
            ['Computer Science','Comp Sci'],
            ['English Literature','English Lit'],
          ].map(([val, label]) => (
            <Pill key={val} label={label} active={filters.subject === val} onClick={() => toggle('subject', val)} />
          ))}
        </div>
      </div>
      <hr className="fdivider" />

      <div className="fgroup">
        <h4>Exam board</h4>
        <div className="fpills">
          {['CAIE','Edexcel','AQA','OCR'].map(v => (
            <Pill key={v} label={v} active={filters.board === v} onClick={() => toggle('board', v)} />
          ))}
        </div>
      </div>
      <hr className="fdivider" />

      <div className="fgroup">
        <h4>Price range</h4>
        <div className="price-row">
          <span>Up to</span>
          <span className="mono">
            {filters.maxPrice >= 5000 ? 'Any' : `Rs ${Number(filters.maxPrice).toLocaleString()}`}
          </span>
        </div>
        <input
          className="range"
          type="range"
          min={1800} max={5000} step={100}
          value={filters.maxPrice}
          aria-label="Maximum price per hour"
          onChange={e => onChange('maxPrice', parseInt(e.target.value, 10))}
        />
      </div>
      <hr className="fdivider" />

      <div className="fgroup">
        <h4>Availability</h4>
        <div className="favail">
          <button
            className="fcheck"
            aria-pressed={filters.availToday}
            onClick={() => onChange('availToday', !filters.availToday)}
          >
            <span className="box">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            Available today
            <span className="dot-live anim" aria-hidden="true" />
          </button>
        </div>
      </div>
      <hr className="fdivider" />

      <div className="fgroup">
        <h4>Rating</h4>
        <div className="frating">
          {[
            [4.9, 'Exceptional'],
            [4.5, 'Excellent'],
            [4.0, 'Very good'],
          ].map(([val, label]) => (
            <button
              key={val}
              className="frate"
              aria-pressed={filters.rating === val}
              onClick={() => onChange('rating', filters.rating === val ? 0 : val)}
            >
              <span className="star">★</span> {Number(val).toFixed(1)} &amp; up
              <span className="sub">{label as string}</span>
            </button>
          ))}
        </div>
      </div>
      <hr className="fdivider" />

      <div className="fgroup">
        <h4>Tutor type</h4>
        <div className="fpills">
          {[
            ['school',     'School Teacher'],
            ['grad',       'University Graduate'],
            ['examiner',   'Examiner'],
            ['specialist', 'Subject Specialist'],
          ].map(([val, label]) => (
            <TypePill key={val} label={label} active={filters.type === val} onClick={() => toggle('type', val)} />
          ))}
        </div>
      </div>
    </>
  )
}
