import './StatsStrip.css'

const STATS = [
  { value: '2400', suffix: '+', label: 'sessions taught', dec: false },
  { value: '247',  suffix: '',  label: 'verified tutors', dec: false },
  { value: '4.9',  suffix: '',  label: 'average rating',  dec: true  },
  { value: '94',   suffix: '%', label: 'students improve within 4 weeks', dec: false },
]

export default function StatsStrip() {
  return (
    <div className="ribbon">
      <div className="ribbon-inner wrap">
        {STATS.map((s, i) => (
          <div key={i} className="rb">
            <b className="display">{s.value}{s.suffix}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
