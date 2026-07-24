import type { BrowseFilters } from '../../../pages/BrowsePage/BrowsePage'
import { fmtPrice } from '../../../lib/catalog'
import './FilterGroups.css'

type Props = {
  filters:  BrowseFilters
  onChange: (key: keyof BrowseFilters, value: unknown) => void
  onClear?: () => void
  /** Options are derived from live courses — never a hardcoded list. */
  levels:   string[]
  subjects: string[]
  boards:   string[]
  days:     string[]
  priceMax: number
  currency: string
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className="fpill" aria-pressed={active} onClick={onClick}>{label}</button>
  )
}

export default function FilterGroups({
  filters, onChange, levels, subjects, boards, days, priceMax, currency,
}: Props) {
  const toggle = (key: keyof BrowseFilters, val: string) => {
    onChange(key, filters[key] === val ? null : val)
  }

  return (
    <>
      {levels.length > 1 && (
        <>
          <div className="fgroup">
            <h4>Level</h4>
            <div className="fpills">
              {levels.map(v => (
                <Pill key={v} label={v} active={filters.level === v} onClick={() => toggle('level', v)} />
              ))}
            </div>
          </div>
          <hr className="fdivider" />
        </>
      )}

      {subjects.length > 1 && (
        <>
          <div className="fgroup">
            <h4>Subject</h4>
            <div className="fpills">
              {subjects.map(v => (
                <Pill key={v} label={v} active={filters.subject === v} onClick={() => toggle('subject', v)} />
              ))}
            </div>
          </div>
          <hr className="fdivider" />
        </>
      )}

      {boards.length > 1 && (
        <>
          <div className="fgroup">
            <h4>Exam board</h4>
            <div className="fpills">
              {boards.map(v => (
                <Pill key={v} label={v} active={filters.board === v} onClick={() => toggle('board', v)} />
              ))}
            </div>
          </div>
          <hr className="fdivider" />
        </>
      )}

      <div className="fgroup">
        <h4>Price range</h4>
        <div className="price-row">
          <span>Up to</span>
          <span className="mono">
            {filters.maxPrice >= priceMax ? 'Any' : fmtPrice(filters.maxPrice, currency)}
          </span>
        </div>
        <input
          className="range"
          type="range"
          min={0}
          max={priceMax}
          step={Math.max(100, Math.round(priceMax / 40))}
          value={Math.min(filters.maxPrice, priceMax)}
          aria-label="Maximum price per hour"
          onChange={e => onChange('maxPrice', parseInt(e.target.value, 10))}
        />
      </div>

      {days.length > 0 && (
        <>
          <hr className="fdivider" />
          <div className="fgroup">
            <h4>Class day</h4>
            <div className="fpills">
              {days.map(d => (
                <Pill key={d} label={d} active={filters.day === d} onClick={() => toggle('day', d)} />
              ))}
            </div>
          </div>
        </>
      )}

      <hr className="fdivider" />
      <div className="fgroup">
        <h4>Course type</h4>
        <div className="fpills">
          {[
            ['recurring', 'Ongoing weekly'],
            ['fixed',     'Fixed-length'],
          ].map(([val, label]) => (
            <Pill
              key={val}
              label={label}
              active={filters.courseType === val}
              onClick={() => toggle('courseType', val)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
