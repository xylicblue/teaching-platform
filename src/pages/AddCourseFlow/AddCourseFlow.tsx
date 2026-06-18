import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import './AddCourseFlow.css'

/* ── Types ────────────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3
type CourseType = 'recurring' | 'fixed'
type TimeMode   = 'single' | 'individual'
type Currency   = 'PKR' | 'USD'

interface Topic  { heading: string; plan: string }

interface Props {
  teacherId: string
  onClose:   () => void
  onCreated: () => void
}

/* ── Constants ────────────────────────────────────────────────────────────── */
const SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'Statistics', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Economics', 'Business Studies', 'Accounting',
  'English Language', 'English Literature', 'Urdu', 'Islamiat',
  'Pakistan Studies', 'History', 'Geography', 'Psychology', 'Sociology',
  'Art & Design', 'Physical Education', 'Other',
]
const LEVELS     = ['O-Level', 'A-Level', 'IGCSE', 'IB', 'Primary', 'Other']
const BOARDS     = ['CAIE', 'Edexcel', 'AQA', 'IB', 'N/A', 'Other']
const DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS : Record<string,string> = {
  Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday',
  Fri:'Friday', Sat:'Saturday', Sun:'Sunday',
}
const DEMO_DURATIONS  = [{ v: 30, l: '30 min' }, { v: 45, l: '45 min' }, { v: 60, l: '1 hour' }]
const CLASS_DURATIONS = [{ v: 45, l: '45 min' }, { v: 60, l: '1 hour' }, { v: 90, l: '1.5 hrs' }, { v: 120, l: '2 hours' }]

const STEP_LABELS = ['Course Basics', 'Curriculum', 'Pricing']

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
)

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function AddCourseFlow({ teacherId, onClose, onCreated }: Props) {
  const [step,       setStep]       = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [apiError,   setApiError]   = useState('')
  const [submitted,  setSubmitted]  = useState(false)

  /* ── Step 1 ─────────────────────────────────────────────────────────────── */
  const [title,           setTitle]           = useState('')
  const [subject,         setSubject]         = useState('')
  const [level,           setLevel]           = useState('')
  const [examBoard,       setExamBoard]       = useState('')
  const [bannerFile,      setBannerFile]      = useState<File | null>(null)
  const [bannerPreview,   setBannerPreview]   = useState('')
  const [demoDuration,    setDemoDuration]    = useState(30)
  const [classDuration,   setClassDuration]   = useState(60)
  const [daysOfWeek,      setDaysOfWeek]      = useState<Set<string>>(new Set())
  const [timeMode,        setTimeMode]        = useState<TimeMode>('single')
  const [singleTime,      setSingleTime]      = useState('')
  const [individualTimes, setIndividualTimes] = useState<Record<string,string>>({})
  const [courseType,      setCourseType]      = useState<CourseType>('recurring')
  const [durationMonths,  setDurationMonths]  = useState(3)

  /* ── Step 2 ─────────────────────────────────────────────────────────────── */
  const [topics,          setTopics]          = useState<Topic[]>([{ heading: '', plan: '' }])
  const [teachingBullets, setTeachingBullets] = useState<string[]>([''])
  const [lessonPlanFile,  setLessonPlanFile]  = useState<File | null>(null)

  /* ── Step 3 ─────────────────────────────────────────────────────────────── */
  const [currency,     setCurrency]     = useState<Currency>('PKR')
  const [ratePerHour,  setRatePerHour]  = useState('')
  const [platformAvgs, setPlatformAvgs] = useState<{ pkr: number | null; usd: number | null; count: number }>({ pkr: null, usd: null, count: 0 })

  /* ── Validation ──────────────────────────────────────────────────────────── */
  const [errors, setErrors] = useState<Record<string, string>>({})
  function clearErr(k: string) { setErrors(x => ({ ...x, [k]: '' })) }

  /* ── Lock body scroll ────────────────────────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* ── Fetch platform avg rates when step 3 loads ──────────────────────────── */
  useEffect(() => {
    if (step !== 3 || !level || !subject) return
    supabase
      .from('courses')
      .select('rate_per_hour, currency')
      .eq('level', level)
      .eq('status', 'approved')
      .eq('is_active', true)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const pkrRates = data.filter(r => r.currency === 'PKR').map(r => Number(r.rate_per_hour))
        const usdRates = data.filter(r => r.currency === 'USD').map(r => Number(r.rate_per_hour))
        const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null
        setPlatformAvgs({ pkr: avg(pkrRates), usd: avg(usdRates), count: data.length })
      })
  }, [step, level, subject])

  /* ── Validation ──────────────────────────────────────────────────────────── */
  function validate(): boolean {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!title.trim())  e.title    = 'Course title is required.'
      if (!subject)       e.subject  = 'Select a subject.'
      if (!level)         e.level    = 'Select a level.'
      if (!examBoard)     e.examBoard= 'Select an exam board.'
      if (daysOfWeek.size === 0) e.days = 'Select at least one class day.'
      if (timeMode === 'single' && !singleTime)
        e.time = 'Enter a class time.'
      if (timeMode === 'individual') {
        const missing = Array.from(daysOfWeek).filter(d => !individualTimes[d])
        if (missing.length > 0)
          e.time = `Set a time for: ${missing.join(', ')}.`
      }
    }
    if (step === 2) {
      const validTopics = topics.filter(t => t.heading.trim())
      if (validTopics.length === 0) e.topics = 'Add at least one topic heading.'
      const validBullets = teachingBullets.filter(b => b.trim())
      if (validBullets.length === 0) e.bullets = 'Add at least one teaching methodology point.'
    }
    if (step === 3) {
      const rate = Number(ratePerHour)
      if (!ratePerHour || isNaN(rate) || rate <= 0) e.rate = 'Enter a valid hourly rate.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) { setApiError(''); setStep(s => (s + 1) as Step) }
  }
  function handleBack() { setApiError(''); setStep(s => (s - 1) as Step) }

  /* ── Submit ──────────────────────────────────────────────────────────────── */
  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setApiError('')

    let bannerUrl    = ''
    let lessonPlanUrl = ''

    // Upload banner
    if (bannerFile) {
      const ext  = bannerFile.name.split('.').pop() ?? 'jpg'
      const path = `${teacherId}/banners/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('course-materials')
        .upload(path, bannerFile, { upsert: true })
      if (error) { setApiError('Banner upload failed: ' + error.message); setSubmitting(false); return }
      const { data: urlData } = supabase.storage.from('course-materials').getPublicUrl(path)
      bannerUrl = urlData.publicUrl
    }

    // Upload lesson plan PDF
    if (lessonPlanFile) {
      const ext  = lessonPlanFile.name.split('.').pop() ?? 'pdf'
      const path = `${teacherId}/lesson-plans/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('course-materials')
        .upload(path, lessonPlanFile, { upsert: true })
      if (error) { setApiError('Lesson plan upload failed: ' + error.message); setSubmitting(false); return }
      const { data: urlData } = supabase.storage.from('course-materials').getPublicUrl(path)
      lessonPlanUrl = urlData.publicUrl
    }

    // Build class_times object
    const classTimes = timeMode === 'single'
      ? { all: singleTime }
      : Object.fromEntries(Array.from(daysOfWeek).map(d => [d, individualTimes[d] ?? '']))

    const validTopics   = topics.filter(t => t.heading.trim())
    const validBullets  = teachingBullets.filter(b => b.trim())

    const { error } = await supabase.from('courses').insert({
      teacher_id:        teacherId,
      title:             title.trim(),
      subject,
      level,
      exam_board:        examBoard,
      is_active:         false,
      status:            'pending',
      banner_url:        bannerUrl || null,
      demo_duration_min: demoDuration,
      class_duration_min:classDuration,
      days_of_week:      Array.from(daysOfWeek),
      class_times:       classTimes,
      course_type:       courseType,
      duration_months:   courseType === 'fixed' ? durationMonths : null,
      topics:            validTopics,
      teaching_bullets:  validBullets,
      lesson_plan_url:   lessonPlanUrl || null,
      rate_per_hour:     Number(ratePerHour),
      currency,
    })

    if (error) {
      setApiError('Could not save course: ' + error.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onCreated()
    setSubmitted(true)
  }

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function toggleDay(day: string) {
    setDaysOfWeek(prev => {
      const next = new Set(prev)
      if (next.has(day)) { next.delete(day); const t = { ...individualTimes }; delete t[day]; setIndividualTimes(t) }
      else next.add(day)
      return next
    })
    clearErr('days')
  }

  function setIndivTime(day: string, val: string) {
    setIndividualTimes(prev => ({ ...prev, [day]: val }))
    clearErr('time')
  }

  function addTopic() { setTopics(t => [...t, { heading: '', plan: '' }]) }
  function removeTopic(i: number) { setTopics(t => t.filter((_, idx) => idx !== i)) }
  function updateTopic(i: number, key: keyof Topic, val: string) {
    setTopics(t => t.map((x, idx) => idx === i ? { ...x, [key]: val } : x))
    clearErr('topics')
  }

  function addBullet()   { setTeachingBullets(b => [...b, '']) }
  function removeBullet(i: number) { setTeachingBullets(b => b.filter((_, idx) => idx !== i)) }
  function updateBullet(i: number, val: string) {
    setTeachingBullets(b => b.map((x, idx) => idx === i ? val : x))
    clearErr('bullets')
  }

  function handleBannerChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0] ?? null
    setBannerFile(file)
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setBannerPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  /* ── Render ──────────────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="acf-overlay">
        <div className="acf-wrap acf-wrap--center">
          <div className="acf-success">
            <div className="acf-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/></svg>
            </div>
            <h2 className="acf-success-title">Course submitted for review</h2>
            <p className="acf-success-body">
              <strong>{title}</strong> has been submitted. Our team will review it and get back to you — usually within 1 business day. You'll see the status on your dashboard.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Back to dashboard →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="acf-overlay">
      <div className="acf-wrap">

        {/* Header */}
        <header className="apply-header">
          <span className="ae-wordmark display">Ustaad</span>
          <button className="apply-back acf-close-btn" onClick={onClose}>
            ← Back to dashboard
          </button>
        </header>

        {/* Progress */}
        <div className="apply-progress">
          <div className="ap-meta">
            <span className="ap-title">Add a new course</span>
            <span className="ap-step-count">Step {step} of {STEP_LABELS.length}</span>
          </div>
          <div className="ap-dots" role="list">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                role="listitem"
                aria-current={i + 1 === step ? 'step' : undefined}
                className={`ap-dot${i + 1 < step ? ' done' : ''}${i + 1 === step ? ' active' : ''}`}
              >
                <div className="dot-circle">
                  {i + 1 < step ? <CheckIcon /> : <span>{i + 1}</span>}
                </div>
                <span className="dot-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <main className="apply-main">
          <div className="apply-card">

            {/* ── STEP 1: Course Basics ──────────────────────────────────── */}
            {step === 1 && (
              <>
                <h2 className="step-title">Course basics</h2>
                <p className="step-sub">Define the subject, level, and schedule students will see on your profile.</p>

                {/* Title */}
                <div className={`field ${errors.title ? 'field--err' : ''}`}>
                  <label htmlFor="acf-title">Course title *</label>
                  <div className="input-wrap">
                    <input id="acf-title" type="text"
                      placeholder="e.g. A-Level Pure Mathematics"
                      value={title}
                      onChange={e => { setTitle(e.target.value); clearErr('title') }}
                    />
                  </div>
                  {errors.title && <p className="hint hint--error">{errors.title}</p>}
                </div>

                {/* Subject */}
                <div className={`field ${errors.subject ? 'field--err' : ''}`}>
                  <label htmlFor="acf-subj">Subject *</label>
                  <div className="input-wrap">
                    <select id="acf-subj" value={subject}
                      onChange={e => { setSubject(e.target.value); clearErr('subject') }}>
                      <option value="">Select subject…</option>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.subject && <p className="hint hint--error">{errors.subject}</p>}
                </div>

                {/* Level */}
                <div className={`field ${errors.level ? 'field--err' : ''}`}>
                  <label>Level *</label>
                  {errors.level && <p className="hint hint--error">{errors.level}</p>}
                  <div className="toggle-group">
                    {LEVELS.map(l => (
                      <button key={l} type="button"
                        className={`toggle-chip${level === l ? ' selected' : ''}`}
                        onClick={() => { setLevel(l); clearErr('level') }}>
                        <span className="tc-check"><CheckIcon /></span>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam board */}
                <div className={`field ${errors.examBoard ? 'field--err' : ''}`}>
                  <label>Exam board *</label>
                  {errors.examBoard && <p className="hint hint--error">{errors.examBoard}</p>}
                  <div className="toggle-group">
                    {BOARDS.map(b => (
                      <button key={b} type="button"
                        className={`toggle-chip${examBoard === b ? ' selected' : ''}`}
                        onClick={() => { setExamBoard(b); clearErr('examBoard') }}>
                        <span className="tc-check"><CheckIcon /></span>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner (optional) */}
                <div className="field step-section">
                  <label>Course banner <span className="field-note">(optional)</span></label>
                  <p className="hint">An image that represents your course. Shown on your profile card.</p>
                  <div className={`file-zone acf-banner-zone${bannerFile ? ' has-file' : ''}`}>
                    <input type="file" accept="image/*" onChange={handleBannerChange} />
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner preview" className="acf-banner-preview" />
                    ) : (
                      <>
                        <div className="fz-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <p className="fz-label">Click to upload a banner image</p>
                        <p className="fz-sub">JPG or PNG, recommended 1200 × 400 px</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Demo duration */}
                <div className="field step-section">
                  <label>Demo session duration *</label>
                  <p className="hint">How long is a free demo class with a student?</p>
                  <div className="toggle-group">
                    {DEMO_DURATIONS.map(d => (
                      <button key={d.v} type="button"
                        className={`toggle-chip${demoDuration === d.v ? ' selected' : ''}`}
                        onClick={() => setDemoDuration(d.v)}>
                        <span className="tc-check"><CheckIcon /></span>
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class duration */}
                <div className="field">
                  <label>Class duration per session *</label>
                  <p className="hint">How long is each regular class?</p>
                  <div className="toggle-group">
                    {CLASS_DURATIONS.map(d => (
                      <button key={d.v} type="button"
                        className={`toggle-chip${classDuration === d.v ? ' selected' : ''}`}
                        onClick={() => setClassDuration(d.v)}>
                        <span className="tc-check"><CheckIcon /></span>
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days of week */}
                <div className={`field step-section ${errors.days ? 'field--err' : ''}`}>
                  <label>Class days *</label>
                  {errors.days && <p className="hint hint--error">{errors.days}</p>}
                  <div className="acf-days">
                    {DAYS.map(d => (
                      <button key={d} type="button"
                        className={`acf-day-chip${daysOfWeek.has(d) ? ' selected' : ''}`}
                        onClick={() => toggleDay(d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class time */}
                {daysOfWeek.size > 0 && (
                  <div className={`field ${errors.time ? 'field--err' : ''}`}>
                    <label>Class time *</label>
                    <div className="acf-time-mode">
                      <label className="acf-radio">
                        <input type="radio" checked={timeMode === 'single'}
                          onChange={() => { setTimeMode('single'); clearErr('time') }} />
                        Same time for all days
                      </label>
                      <label className="acf-radio">
                        <input type="radio" checked={timeMode === 'individual'}
                          onChange={() => { setTimeMode('individual'); clearErr('time') }} />
                        Different time per day
                      </label>
                    </div>

                    {timeMode === 'single' && (
                      <div className="input-wrap acf-time-input">
                        <input type="time" value={singleTime}
                          onChange={e => { setSingleTime(e.target.value); clearErr('time') }} />
                      </div>
                    )}

                    {timeMode === 'individual' && (
                      <div className="acf-indiv-times">
                        {Array.from(daysOfWeek).sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)).map(d => (
                          <div key={d} className="acf-indiv-row">
                            <span className="acf-indiv-day">{DAY_LABELS[d]}</span>
                            <div className="input-wrap acf-time-input">
                              <input type="time"
                                value={individualTimes[d] ?? ''}
                                onChange={e => setIndivTime(d, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {errors.time && <p className="hint hint--error">{errors.time}</p>}
                  </div>
                )}

                {/* Course type */}
                <div className="field step-section">
                  <label>Course duration *</label>
                  <p className="hint">Recurring courses run indefinitely. Fixed courses have a defined end date.</p>
                  <div className="acf-type-cards">
                    <button type="button"
                      className={`acf-type-card${courseType === 'recurring' ? ' selected' : ''}`}
                      onClick={() => setCourseType('recurring')}>
                      <strong>Recurring</strong>
                      <span>Ongoing — no end date. Great for long-term tutoring.</span>
                    </button>
                    <button type="button"
                      className={`acf-type-card${courseType === 'fixed' ? ' selected' : ''}`}
                      onClick={() => setCourseType('fixed')}>
                      <strong>Fixed duration</strong>
                      <span>Runs for a set number of months. Ideal for exam prep courses.</span>
                    </button>
                  </div>

                  {courseType === 'fixed' && (
                    <div className="acf-months-row">
                      <span className="acf-months-label">Duration:</span>
                      <div className="toggle-group">
                        {[1, 2, 3, 4, 6, 8, 12].map(m => (
                          <button key={m} type="button"
                            className={`toggle-chip${durationMonths === m ? ' selected' : ''}`}
                            onClick={() => setDurationMonths(m)}>
                            <span className="tc-check"><CheckIcon /></span>
                            {m} {m === 1 ? 'month' : 'months'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── STEP 2: Curriculum ────────────────────────────────────── */}
            {step === 2 && (
              <>
                <h2 className="step-title">Curriculum &amp; methodology</h2>
                <p className="step-sub">Tell students exactly how you'll cover the syllabus and what makes your teaching effective.</p>

                {/* Topics */}
                <div className="field">
                  <label>Course topics *</label>
                  <p className="hint">
                    Add each major topic or chapter from the syllabus. Describe how you plan to cover it — approach, examples, past paper focus, etc.
                  </p>
                  {errors.topics && <p className="hint hint--error">{errors.topics}</p>}

                  <div className="acf-topics">
                    {topics.map((topic, i) => (
                      <div key={i} className="acf-topic-entry">
                        <div className="acf-topic-head">
                          <span className="acf-topic-n">{String(i + 1).padStart(2, '0')}</span>
                          <div className="input-wrap" style={{ flex: 1 }}>
                            <input
                              type="text"
                              placeholder={`Topic heading — e.g. "Quadratic Equations"`}
                              value={topic.heading}
                              onChange={e => updateTopic(i, 'heading', e.target.value)}
                            />
                          </div>
                          {topics.length > 1 && (
                            <button type="button" className="acf-topic-remove" onClick={() => removeTopic(i)} aria-label="Remove topic">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          )}
                        </div>
                        <div className="input-wrap" style={{ marginTop: 7 }}>
                          <textarea
                            rows={2}
                            placeholder="How will you cover this topic? Mention your approach, key concepts, past paper focus, time allocation…"
                            value={topic.plan}
                            onChange={e => updateTopic(i, 'plan', e.target.value)}
                            style={{ resize: 'vertical', minHeight: 64 }}
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="edu-add acf-add-btn" onClick={addTopic}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      Add another topic
                    </button>
                  </div>
                </div>

                {/* Teaching methodology bullets */}
                <div className="field step-section">
                  <label>Teaching methodology *</label>
                  <p className="hint">
                    Briefly describe how you conduct classes and help students achieve high grades. Add each point as a separate bullet.
                  </p>
                  {errors.bullets && <p className="hint hint--error">{errors.bullets}</p>}

                  <div className="acf-bullets">
                    {teachingBullets.map((bullet, i) => (
                      <div key={i} className="acf-bullet-row">
                        <span className="acf-bullet-dot">•</span>
                        <div className="input-wrap" style={{ flex: 1 }}>
                          <input
                            type="text"
                            placeholder={i === 0
                              ? 'e.g. Past-paper focused approach from session one'
                              : i === 1
                              ? 'e.g. Weekly mini-tests to track progress'
                              : 'Add a point about your teaching style…'}
                            value={bullet}
                            onChange={e => updateBullet(i, e.target.value)}
                          />
                        </div>
                        {teachingBullets.length > 1 && (
                          <button type="button" className="acf-topic-remove" onClick={() => removeBullet(i)} aria-label="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="edu-add acf-add-btn" style={{ marginTop: 8 }} onClick={addBullet}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      Add another point
                    </button>
                  </div>
                </div>

                {/* Lesson plan upload */}
                <div className="field step-section">
                  <label>
                    Lesson plan document
                    <span className="field-note"> — optional but strongly recommended</span>
                  </label>
                  <p className="hint">
                    Upload a complete lesson plan PDF. Students can review it before enrolling, helping build trust and reducing drop-offs.
                  </p>
                  <div className={`file-zone${lessonPlanFile ? ' has-file' : ''}`}>
                    <input type="file" accept=".pdf,.doc,.docx"
                      onChange={e => setLessonPlanFile(e.target.files?.[0] ?? null)} />
                    {lessonPlanFile ? (
                      <>
                        <div className="fz-icon" style={{ color: 'var(--evergreen)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                        </div>
                        <p className="fz-name">{lessonPlanFile.name}</p>
                        <p className="fz-sub">{(lessonPlanFile.size / 1024).toFixed(0)} KB</p>
                      </>
                    ) : (
                      <>
                        <div className="fz-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <p className="fz-label">Click to upload lesson plan</p>
                        <p className="fz-sub">PDF, DOC, or DOCX</p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Pricing ───────────────────────────────────────── */}
            {step === 3 && (
              <>
                <h2 className="step-title">Set your rate</h2>
                <p className="step-sub">Choose a currency and hourly rate for this course. You can update this anytime.</p>

                {/* Platform averages */}
                {platformAvgs.count > 0 && (
                  <div className="acf-avg-box">
                    <div className="acf-avg-head">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                      Platform rates for {level} {subject}
                    </div>
                    <div className="acf-avg-rates">
                      {platformAvgs.pkr !== null && (
                        <div className="acf-avg-item">
                          <span>PKR average</span>
                          <b>PKR {platformAvgs.pkr.toLocaleString('en-PK')}/hr</b>
                        </div>
                      )}
                      {platformAvgs.usd !== null && (
                        <div className="acf-avg-item">
                          <span>USD average</span>
                          <b>USD {platformAvgs.usd}/hr</b>
                        </div>
                      )}
                    </div>
                    <p className="acf-avg-note">
                      Based on {platformAvgs.count} active course{platformAvgs.count !== 1 ? 's' : ''} in this level on Ustaad.
                    </p>
                  </div>
                )}

                {/* Currency */}
                <div className="field" style={{ marginTop: platformAvgs.count > 0 ? 'var(--s5)' : 0 }}>
                  <label>Currency *</label>
                  <div className="acf-currency-toggle">
                    <button type="button"
                      className={`acf-curr-btn${currency === 'PKR' ? ' selected' : ''}`}
                      onClick={() => setCurrency('PKR')}>
                      <span className="acf-curr-flag">🇵🇰</span>
                      PKR
                      <span className="acf-curr-sub">Local students</span>
                    </button>
                    <button type="button"
                      className={`acf-curr-btn${currency === 'USD' ? ' selected' : ''}`}
                      onClick={() => setCurrency('USD')}>
                      <span className="acf-curr-flag">🌍</span>
                      USD
                      <span className="acf-curr-sub">International students</span>
                    </button>
                  </div>
                </div>

                {/* Rate */}
                <div className={`field ${errors.rate ? 'field--err' : ''}`}>
                  <label htmlFor="acf-rate">
                    Rate per hour *
                    {platformAvgs.count > 0 && currency === 'PKR' && platformAvgs.pkr && (
                      <span className="field-note"> — platform avg: PKR {platformAvgs.pkr.toLocaleString('en-PK')}/hr</span>
                    )}
                    {platformAvgs.count > 0 && currency === 'USD' && platformAvgs.usd && (
                      <span className="field-note"> — platform avg: USD {platformAvgs.usd}/hr</span>
                    )}
                  </label>
                  <div className="input-wrap acf-rate-wrap">
                    <span className="acf-currency-pre">{currency}</span>
                    <input
                      id="acf-rate"
                      type="number"
                      min="1"
                      step={currency === 'PKR' ? 100 : 1}
                      placeholder={currency === 'PKR' ? '2500' : '15'}
                      value={ratePerHour}
                      onChange={e => { setRatePerHour(e.target.value); clearErr('rate') }}
                      className="acf-rate-input"
                    />
                    <span className="acf-per-hour">/ hr</span>
                  </div>
                  {errors.rate
                    ? <p className="hint hint--error">{errors.rate}</p>
                    : <p className="hint">This is per hour. Students see this rate on your course listing.</p>
                  }
                </div>

                {/* Summary card */}
                <div className="acf-summary step-section">
                  <p className="step-section-label">Course summary</p>
                  <div className="acf-sum-grid">
                    <div className="acf-sum-item"><span>Title</span><b>{title}</b></div>
                    <div className="acf-sum-item"><span>Subject</span><b>{subject}</b></div>
                    <div className="acf-sum-item"><span>Level</span><b>{level}</b></div>
                    <div className="acf-sum-item"><span>Exam board</span><b>{examBoard}</b></div>
                    <div className="acf-sum-item"><span>Class days</span><b>{Array.from(daysOfWeek).join(', ')}</b></div>
                    <div className="acf-sum-item"><span>Duration type</span><b>{courseType === 'recurring' ? 'Recurring' : `${durationMonths} month${durationMonths !== 1 ? 's' : ''}`}</b></div>
                    <div className="acf-sum-item"><span>Class length</span><b>{classDuration} min</b></div>
                    <div className="acf-sum-item"><span>Topics added</span><b>{topics.filter(t => t.heading.trim()).length}</b></div>
                  </div>
                </div>
              </>
            )}

          </div>

          {apiError && <p className="apply-api-error" role="alert">{apiError}</p>}

          {/* Navigation */}
          <div className={`apply-nav${step === 1 ? ' end' : ''}`}>
            {step > 1 && (
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
            )}
            {step < 3 && (
              <button className="btn btn-primary" onClick={handleNext}>
                Next step →
              </button>
            )}
            {step === 3 && (
              <button
                className={`btn btn-primary${submitting ? ' loading' : ''}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Publishing…' : 'Publish course →'}
              </button>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
