import { useMemo } from 'react'
import { useCatalog } from '../../hooks/useCatalog'
import { catalogStats, fmtPrice } from '../../lib/catalog'
import './StatsStrip.css'

export default function StatsStrip() {
  const { teachers, courses, loading } = useCatalog()
  const stats = useMemo(() => catalogStats({ teachers, courses }), [teachers, courses])

  if (loading || stats.courses === 0) return null

  const items = [
    { value: String(stats.tutors),   label: stats.tutors === 1 ? 'verified tutor' : 'verified tutors' },
    { value: String(stats.courses),  label: stats.courses === 1 ? 'course running' : 'courses running' },
    { value: String(stats.subjects), label: stats.subjects === 1 ? 'subject covered' : 'subjects covered' },
    stats.lowestPrice
      ? { value: fmtPrice(stats.lowestPrice, stats.currency), label: 'per hour, from' }
      : { value: String(stats.boards), label: stats.boards === 1 ? 'exam board' : 'exam boards' },
  ]

  return (
    <div className="ribbon">
      <div className="ribbon-inner wrap">
        {items.map((s, i) => (
          <div key={i} className="rb">
            <b className="display">{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
