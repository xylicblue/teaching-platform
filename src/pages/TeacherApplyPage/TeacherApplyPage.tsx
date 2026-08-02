import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import './TeacherApplyPage.css'

const TEACHING_LEVELS = ['O-Level', 'A-Level', 'IGCSE', 'IB']

const SUBJECTS = [
  'Accounting', 'Additional Mathematics', 'Art & Design', 'Biology',
  'Business Studies', 'Chemistry', 'Computer Science', 'Economics',
  'English Language', 'English Literature', 'Environmental Management',
  'Further Mathematics', 'Geography', 'History', 'Islamiyat', 'Law',
  'Mathematics', 'Pakistan Studies', 'Physical Education', 'Physics',
  'Psychology', 'Sociology', 'Urdu',
]

const EXAM_BOARDS = ['CAIE (Cambridge)', 'Edexcel', 'AQA', 'IB', 'Other']

const DEGREE_TYPES = [
  'Matriculation / O-Level',
  'Intermediate / A-Level / FSc',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Professional Certification',
  'Other',
]

const STEP_LABELS = ['About You', 'Background', 'Verification', 'Review']

type EduEntry = {
  degree: string; degreeOther?: string
  field: string; institution: string; year: string
  verificationFile?: File | null; verificationPreview?: string
}

const EMPTY_EDU: EduEntry = { degree: '', field: '', institution: '', year: '' }

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
)

export default function TeacherApplyPage() {
  const navigate  = useNavigate()
  const [step, setStep]           = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [apiError, setApiError]     = useState('')

  // Step 1
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [dob,       setDob]       = useState('')
  const [gender,    setGender]    = useState('')
  const [city,      setCity]      = useState('')
  const [country,   setCountry]   = useState('Pakistan')
  const [phone,     setPhone]     = useState('')

  // Step 2
  const [levels,    setLevels]    = useState<Set<string>>(new Set())
  const [subjects,  setSubjects]  = useState<Set<string>>(new Set())
  const [boards,    setBoards]    = useState<Set<string>>(new Set())
  const [education, setEducation] = useState<EduEntry[]>([{ ...EMPTY_EDU }])
  const [yearsExp,  setYearsExp]  = useState('')
  const [bio,       setBio]       = useState('')
  const [otherSubject, setOtherSubject] = useState('')
  const [otherBoard,   setOtherBoard]   = useState('')

  // Step 3
  const [cnicNumber,      setCnicNumber]      = useState('')
  const [cnicFront,       setCnicFront]       = useState<File | null>(null)
  const [cnicBack,        setCnicBack]        = useState<File | null>(null)
  const [cnicFrontPreview, setCnicFrontPreview] = useState('')
  const [cnicBackPreview,  setCnicBackPreview]  = useState('')

  // Step 4
  const [declared, setDeclared] = useState(false)

  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [pageReady,  setPageReady]  = useState(false)
  const [existingApp, setExistingApp] = useState<string | null>(null)

  useEffect(() => {
    document.body.classList.add('apply-page')
    return () => document.body.classList.remove('apply-page')
  }, [])

  // Auth + existing-application check, then pre-fill
  useEffect(() => {
    if (!isSupabaseConfigured) { setPageReady(true); return }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/signin?redirect=/apply'); return }
      supabase
        .from('teacher_applications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: appData }) => {
          if (appData) {
            setExistingApp(appData.status)
            setPageReady(true)
            return
          }
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                if (data.first_name) setFirstName(data.first_name)
                if (data.last_name)  setLastName(data.last_name)
              }
              setPageReady(true)
            })
        })
    })
  }, [navigate])

  function clearErr(key: string) {
    setErrors(x => ({ ...x, [key]: '' }))
  }

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, val: string, errKey?: string) {
    setter(prev => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val); else next.add(val)
      return next
    })
    if (errKey) clearErr(errKey)
  }

  // Education helpers
  function updateEdu(i: number, key: keyof EduEntry, val: string) {
    setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
    clearErr('education')
  }
  function addEdu() { setEducation(prev => [...prev, { ...EMPTY_EDU }]) }
  function removeEdu(i: number) { setEducation(prev => prev.filter((_, idx) => idx !== i)) }
  function updateEduFile(i: number, file: File | null, preview: string) {
    setEducation(prev => prev.map((e, idx) =>
      idx === i ? { ...e, verificationFile: file, verificationPreview: preview } : e
    ))
  }

  // CNIC auto-format XXXXX-XXXXXXX-X
  function handleCnicChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 13)
    let fmt = digits
    if (digits.length > 5)  fmt = digits.slice(0, 5) + '-' + digits.slice(5)
    if (digits.length > 12) fmt = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12)
    setCnicNumber(fmt)
    clearErr('cnicNumber')
  }

  function handleFileChange(
    ev: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string) => void,
    errKey: string,
  ) {
    const file = ev.target.files?.[0] ?? null
    setFile(file)
    clearErr(errKey)
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview('')
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!firstName.trim()) e.firstName = 'Required.'
      if (!phone.trim())     e.phone     = 'Required.'
    }
    if (step === 2) {
      if (levels.size === 0)   e.levels  = 'Select at least one teaching level.'
      if (subjects.size === 0) e.subjects = 'Select at least one subject.'
      const firstEdu = education[0]
      if (!firstEdu.degree || !firstEdu.institution) e.education = 'Add at least one qualification.'
      if (!yearsExp) e.yearsExp = 'Required.'
      if (bio.trim().length < 50) e.bio = `At least 50 characters needed (${bio.trim().length} so far).`
    }
    if (step === 3) {
      if (!/^\d{5}-\d{7}-\d$/.test(cnicNumber)) e.cnicNumber = 'Enter a valid CNIC: 00000-0000000-0'
      if (!cnicFront) e.cnicFront = 'CNIC front image required.'
      if (!cnicBack)  e.cnicBack  = 'CNIC back image required.'
    }
    if (step === 4) {
      if (!declared) e.declared = 'Please confirm the declaration to submit.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) { setApiError(''); setStep(s => s + 1) }
  }

  function handleBack() {
    setApiError('')
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setApiError('')

    if (!isSupabaseConfigured) {
      setTimeout(() => { setSubmitting(false); setSubmitted(true) }, 1500)
      return
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (!user || userErr) {
      setApiError('Session expired. Please sign in again.')
      setSubmitting(false)
      return
    }

    // Upload CNIC images to private bucket
    let frontPath = ''
    let backPath  = ''

    if (cnicFront) {
      const ext  = cnicFront.name.split('.').pop() ?? 'jpg'
      const path = `cnic/${user.id}/front.${ext}`
      const { error } = await supabase.storage
        .from('teacher-documents')
        .upload(path, cnicFront, { upsert: true })
      if (error) { setApiError('Upload failed: ' + error.message); setSubmitting(false); return }
      frontPath = path
    }

    if (cnicBack) {
      const ext  = cnicBack.name.split('.').pop() ?? 'jpg'
      const path = `cnic/${user.id}/back.${ext}`
      const { error } = await supabase.storage
        .from('teacher-documents')
        .upload(path, cnicBack, { upsert: true })
      if (error) { setApiError('Upload failed: ' + error.message); setSubmitting(false); return }
      backPath = path
    }

    // Resolve boards (replace 'Other' toggle with typed value)
    const resolvedBoards = Array.from(boards).map(b =>
      b === 'Other' ? (otherBoard.trim() || 'Other') : b
    )

    // Build filtered education with original indices preserved
    const filteredEdu = education
      .map((entry, i) => ({ entry, i }))
      .filter(({ entry }) => entry.degree && entry.institution)

    // Upload qualification documents
    const qualPaths: (string | null)[] = []
    for (const { entry, i } of filteredEdu) {
      if (entry.verificationFile) {
        const ext  = entry.verificationFile.name.split('.').pop() ?? 'pdf'
        const path = `qual/${user.id}/${i}.${ext}`
        const { error } = await supabase.storage
          .from('teacher-documents')
          .upload(path, entry.verificationFile, { upsert: true })
        if (error) { setApiError('Upload failed: ' + error.message); setSubmitting(false); return }
        qualPaths.push(path)
      } else {
        qualPaths.push(null)
      }
    }

    const { error: insertErr } = await supabase.from('teacher_applications').insert({
      user_id:           user.id,
      status:            'pending',
      first_name:        firstName.trim(),
      last_name:         lastName.trim() || null,
      date_of_birth:     dob || null,
      gender:            gender || null,
      city:              city.trim() || null,
      country:           country === 'Pakistan' ? 'PK' : country,
      phone:             phone.trim(),
      education:         filteredEdu.map(({ entry }, j) => ({
        degree:      entry.degree === 'Other' ? (entry.degreeOther?.trim() || 'Other') : entry.degree,
        field:       entry.field,
        institution: entry.institution,
        year:        entry.year,
        ...(qualPaths[j] ? { verification_doc: qualPaths[j] } : {}),
      })),
      years_exp:         parseInt(yearsExp, 10) || 0,
      teaching_levels:   Array.from(levels),
      subjects_interest: Array.from(subjects).map(name => ({
        name:        name === '__other__' ? (otherSubject.trim() || 'Other') : name,
        exam_boards: resolvedBoards,
      })),
      exam_boards:       resolvedBoards,
      bio:               bio.trim() || null,
      cnic_number:       cnicNumber,
      cnic_front_path:   frontPath || null,
      cnic_back_path:    backPath  || null,
    })

    if (insertErr) {
      const msg = insertErr.code === '23505'
        ? 'You already have a pending application. Contact support to check its status.'
        : 'Submission failed: ' + insertErr.message
      setApiError(msg)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  /* ── Loading gate ─────────────────────────────────────────────────────────── */
  if (!pageReady) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--paper)', fontFamily:'var(--font-body)', color:'var(--slate)', fontSize:15 }}>
        Loading…
      </div>
    )
  }

  /* ── Existing application screen ───────────────────────────────────────────── */
  if (existingApp !== null) {
    const isPending  = existingApp === 'pending'
    const isApproved = existingApp === 'approved'
    return (
      <div className="apply-wrap">
        <header className="apply-header">
          <Link className="ae-wordmark display" to="/">Ustaad</Link>
        </header>
        <div className="apply-submitted">
          <div className="as-icon">
            {isPending && (
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--evergreen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            )}
            {isApproved && (
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--evergreen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14.01l-3-3"/>
              </svg>
            )}
            {!isPending && !isApproved && (
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#b53030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            )}
          </div>
          <h1>
            {isPending  ? 'Application under review.'    :
             isApproved ? "You're already a teacher."    :
                          'Application not approved.'}
          </h1>
          <p>
            {isPending
              ? "We're reviewing your details and documents. Expect a decision within 2–3 business days — we'll notify you by email and WhatsApp."
              : isApproved
              ? 'Your teacher profile is active on Ustaad. Head to your dashboard to manage sessions.'
              : "Your application wasn't approved this time. Contact support for more details or to discuss next steps."}
          </p>
          <Link className="btn btn-primary" to="/dashboard">
            {isApproved ? 'Go to dashboard' : 'Back to dashboard'}
          </Link>
        </div>
      </div>
    )
  }

  /* ── Submitted screen ─────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="apply-wrap">
        <header className="apply-header">
          <Link className="ae-wordmark display" to="/">Ustaad</Link>
        </header>
        <div className="apply-submitted">
          <div className="as-icon">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--evergreen)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/>
              <path d="M22 4 12 14.01l-3-3"/>
            </svg>
          </div>
          <h1>Application submitted.</h1>
          <p>We'll review your details and get back to you within 2–3 business days. Check your email for updates.</p>
          <Link className="btn btn-primary" to="/dashboard">Go to dashboard</Link>
        </div>
      </div>
    )
  }

  /* ── Main render ──────────────────────────────────────────────────────────── */
  return (
    <div className="apply-wrap">

      {/* Header */}
      <header className="apply-header">
        <Link className="ae-wordmark display" to="/">Ustaad</Link>
        <Link className="apply-back" to="/dashboard">← Back to dashboard</Link>
      </header>

      {/* Progress */}
      <div className="apply-progress">
        <div className="ap-meta">
          <span className="ap-title">Apply to teach on Ustaad</span>
          <span className="ap-step-count">Step {step} of {STEP_LABELS.length}</span>
        </div>
        <div className="ap-dots" role="list" aria-label="Application steps">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              role="listitem"
              aria-current={i + 1 === step ? 'step' : undefined}
              className={`ap-dot${i + 1 < step ? ' done' : ''}${i + 1 === step ? ' active' : ''}`}
            >
              <div className="dot-circle">
                {i + 1 < step
                  ? <CheckIcon />
                  : <span>{i + 1}</span>
                }
              </div>
              <span className="dot-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <main className="apply-main">
        <div className="apply-card">

          {/* ── STEP 1: About You ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="step-title">About you</h2>
              <p className="step-sub">This will appear on your public teacher profile.</p>

              <div className="row-2">
                <div className={`field ${errors.firstName ? 'field--err' : ''}`}>
                  <label htmlFor="ap-fn">First name</label>
                  <div className="input-wrap">
                    <input id="ap-fn" type="text" placeholder="Ahmed" autoComplete="given-name"
                      value={firstName}
                      onChange={e => { setFirstName(e.target.value); clearErr('firstName') }} />
                  </div>
                  {errors.firstName && <p className="hint hint--error">{errors.firstName}</p>}
                </div>
                <div className="field">
                  <label htmlFor="ap-ln">Last name</label>
                  <div className="input-wrap">
                    <input id="ap-ln" type="text" placeholder="Khan" autoComplete="family-name"
                      value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="ap-dob">Date of birth <span className="field-note">(must be 18+)</span></label>
                <div className="input-wrap">
                  <input id="ap-dob" type="date" value={dob}
                    max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split('T')[0]}
                    onChange={e => setDob(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>Gender</label>
                <div className="gender-group">
                  {([['male','Male'],['female','Female'],['prefer_not_to_say','Prefer not to say']] as const).map(([val, lbl]) => (
                    <label key={val} className="gender-opt">
                      <input type="radio" name="ap-gender" value={val}
                        checked={gender === val} onChange={() => setGender(val)} />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              <div className="row-2">
                <div className="field">
                  <label htmlFor="ap-city">City</label>
                  <div className="input-wrap">
                    <input id="ap-city" type="text" placeholder="Lahore"
                      value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="ap-country">Country</label>
                  <div className="input-wrap">
                    <select id="ap-country" value={country} onChange={e => setCountry(e.target.value)}>
                      <option>Pakistan</option>
                      <option>India</option>
                      <option>Bangladesh</option>
                      <option>United Arab Emirates</option>
                      <option>United Kingdom</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={`field ${errors.phone ? 'field--err' : ''}`}>
                <label htmlFor="ap-phone">
                  WhatsApp number
                  <span className="field-note"> — used for session notifications</span>
                </label>
                <div className="input-wrap">
                  <input id="ap-phone" type="tel" placeholder="+92 3xx xxxxxxx" autoComplete="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); clearErr('phone') }} />
                </div>
                {errors.phone && <p className="hint hint--error">{errors.phone}</p>}
              </div>
            </>
          )}

          {/* ── STEP 2: Teaching Background ───────────────────────────────── */}
          {step === 2 && (
            <>
              <h2 className="step-title">Teaching background</h2>
              <p className="step-sub">Help students and our team understand your expertise.</p>

              <div className="field">
                <label>Which levels can you teach?</label>
                {errors.levels && <p className="hint hint--error">{errors.levels}</p>}
                <div className="toggle-group">
                  {TEACHING_LEVELS.map(l => (
                    <button key={l} type="button"
                      className={`toggle-chip${levels.has(l) ? ' selected' : ''}`}
                      onClick={() => toggleSet(setLevels, l, 'levels')}>
                      <span className="tc-check"><CheckIcon /></span>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field step-section">
                <label>Subjects you can teach</label>
                <p className="hint">Select all that apply.</p>
                {errors.subjects && <p className="hint hint--error">{errors.subjects}</p>}
                <div className="subject-grid">
                  {SUBJECTS.map(s => (
                    <label key={s} className="checkbox" style={{ fontSize: 13 }}>
                      <input type="checkbox" checked={subjects.has(s)}
                        onChange={() => toggleSet(setSubjects, s, 'subjects')} />
                      <span className="box"><CheckIcon /></span>
                      {s}
                    </label>
                  ))}
                  <label className="checkbox" style={{ fontSize: 13 }}>
                    <input type="checkbox" checked={subjects.has('__other__')}
                      onChange={() => toggleSet(setSubjects, '__other__', 'subjects')} />
                    <span className="box"><CheckIcon /></span>
                    Other
                  </label>
                </div>
                {subjects.has('__other__') && (
                  <div className="input-wrap" style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="Please specify the subject"
                      value={otherSubject}
                      onChange={e => setOtherSubject(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="field step-section">
                <label>Exam boards you're comfortable with</label>
                <div className="toggle-group">
                  {EXAM_BOARDS.map(b => (
                    <button key={b} type="button"
                      className={`toggle-chip${boards.has(b) ? ' selected' : ''}`}
                      onClick={() => toggleSet(setBoards, b)}>
                      <span className="tc-check"><CheckIcon /></span>
                      {b}
                    </button>
                  ))}
                </div>
                {boards.has('Other') && (
                  <div className="input-wrap" style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="Please specify the exam board"
                      value={otherBoard}
                      onChange={e => setOtherBoard(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="step-section">
                <p className="step-section-label">Your qualifications</p>
                {errors.education && <p className="hint hint--error">{errors.education}</p>}
                {education.map((entry, i) => (
                  <div key={i} className="edu-entry">
                    <div className="field" style={{ gridColumn: '1/-1' }}>
                      <label>Degree / qualification</label>
                      <div className="input-wrap">
                        <select value={entry.degree} onChange={e => updateEdu(i, 'degree', e.target.value)}>
                          <option value="">Select…</option>
                          {DEGREE_TYPES.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      {entry.degree === 'Other' && (
                        <div className="input-wrap" style={{ marginTop: 8 }}>
                          <input
                            type="text"
                            placeholder="Please specify your qualification"
                            value={entry.degreeOther ?? ''}
                            onChange={e => updateEdu(i, 'degreeOther', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="field">
                      <label>Field of study</label>
                      <div className="input-wrap">
                        <input type="text" placeholder="e.g. Physics"
                          value={entry.field} onChange={e => updateEdu(i, 'field', e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Institution</label>
                      <div className="input-wrap">
                        <input type="text" placeholder="e.g. LUMS"
                          value={entry.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Year completed</label>
                      <div className="input-wrap">
                        <input type="number" placeholder={String(new Date().getFullYear() - 2)}
                          min={1970} max={new Date().getFullYear()}
                          value={entry.year} onChange={e => updateEdu(i, 'year', e.target.value)} />
                      </div>
                    </div>
                    {education.length > 1 && (
                      <button type="button" className="edu-remove" onClick={() => removeEdu(i)} aria-label="Remove qualification">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="edu-add" onClick={addEdu}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  Add another qualification
                </button>
              </div>

              <div className="step-section">
                <div className={`field ${errors.yearsExp ? 'field--err' : ''}`} style={{ maxWidth: 200 }}>
                  <label htmlFor="ap-exp">Years of teaching experience</label>
                  <div className="input-wrap">
                    <input id="ap-exp" type="number" placeholder="0" min={0} max={50}
                      value={yearsExp}
                      onChange={e => { setYearsExp(e.target.value); clearErr('yearsExp') }} />
                  </div>
                  {errors.yearsExp && <p className="hint hint--error">{errors.yearsExp}</p>}
                </div>
              </div>

              <div className={`field step-section ${errors.bio ? 'field--err' : ''}`}>
                <label htmlFor="ap-bio">
                  Teaching bio
                  <span className="field-note"> — {bio.trim().length}/50 min</span>
                </label>
                <div className="input-wrap">
                  <textarea id="ap-bio" rows={4}
                    placeholder="Describe your teaching approach, what makes you effective, and anything students should know before booking."
                    value={bio}
                    style={{ resize: 'vertical', minHeight: 100 }}
                    onChange={e => { setBio(e.target.value); clearErr('bio') }} />
                </div>
                {errors.bio && <p className="hint hint--error">{errors.bio}</p>}
              </div>
            </>
          )}

          {/* ── STEP 3: Verification ──────────────────────────────────────── */}
          {step === 3 && (
            <>
              <h2 className="step-title">Identity verification</h2>
              <p className="step-sub">Required to confirm your identity. Kept strictly confidential — never shown to students.</p>

              <div className={`field ${errors.cnicNumber ? 'field--err' : ''}`}>
                <label htmlFor="ap-cnic">CNIC number</label>
                <div className="input-wrap">
                  <input id="ap-cnic" type="text" placeholder="00000-0000000-0"
                    value={cnicNumber} onChange={e => handleCnicChange(e.target.value)} />
                </div>
                {errors.cnicNumber
                  ? <p className="hint hint--error">{errors.cnicNumber}</p>
                  : <p className="hint">13-digit CNIC as printed on your card.</p>
                }
              </div>

              <div className="row-2 step-section">
                <div className="field">
                  <label>CNIC — Front side</label>
                  {errors.cnicFront && <p className="hint hint--error">{errors.cnicFront}</p>}
                  <div className={`file-zone${cnicFront ? ' has-file' : ''}${errors.cnicFront ? ' err' : ''}`}>
                    <input type="file" accept="image/*,.pdf"
                      onChange={e => handleFileChange(e, setCnicFront, setCnicFrontPreview, 'cnicFront')} />
                    {cnicFrontPreview ? (
                      <>
                        <img src={cnicFrontPreview} alt="CNIC front preview" className="fz-preview" />
                        <p className="fz-name">{cnicFront?.name}</p>
                      </>
                    ) : cnicFront ? (
                      <>
                        <div className="fz-icon" style={{ color: 'var(--evergreen)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                        </div>
                        <p className="fz-name">{cnicFront.name}</p>
                      </>
                    ) : (
                      <>
                        <div className="fz-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                        </div>
                        <p className="fz-label">Click to upload front</p>
                        <p className="fz-sub">JPG, PNG, or PDF</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="field">
                  <label>CNIC — Back side</label>
                  {errors.cnicBack && <p className="hint hint--error">{errors.cnicBack}</p>}
                  <div className={`file-zone${cnicBack ? ' has-file' : ''}${errors.cnicBack ? ' err' : ''}`}>
                    <input type="file" accept="image/*,.pdf"
                      onChange={e => handleFileChange(e, setCnicBack, setCnicBackPreview, 'cnicBack')} />
                    {cnicBackPreview ? (
                      <>
                        <img src={cnicBackPreview} alt="CNIC back preview" className="fz-preview" />
                        <p className="fz-name">{cnicBack?.name}</p>
                      </>
                    ) : cnicBack ? (
                      <>
                        <div className="fz-icon" style={{ color: 'var(--evergreen)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                        </div>
                        <p className="fz-name">{cnicBack.name}</p>
                      </>
                    ) : (
                      <>
                        <div className="fz-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                        </div>
                        <p className="fz-label">Click to upload back</p>
                        <p className="fz-sub">JPG, PNG, or PDF</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {education.some(e => e.degree && e.institution) && (
                <div className="step-section">
                  <p className="step-section-label">
                    Qualification documents
                    <span className="field-note"> — optional but recommended</span>
                  </p>
                  <p className="hint" style={{ marginBottom: 12 }}>
                    Upload a scan or photo of your degree certificate or transcript. Helps speed up approval.
                  </p>
                  {education.map((entry, i) => {
                    if (!entry.degree || !entry.institution) return null
                    const degLabel = entry.degree === 'Other' ? (entry.degreeOther?.trim() || 'Other') : entry.degree
                    return (
                      <div key={i} className="field" style={{ marginBottom: 16 }}>
                        <label>{degLabel} — {entry.institution}</label>
                        <div className={`file-zone${entry.verificationFile ? ' has-file' : ''}`}>
                          <input type="file" accept="image/*,.pdf"
                            onChange={ev => {
                              const file = ev.target.files?.[0] ?? null
                              if (file?.type.startsWith('image/')) {
                                const reader = new FileReader()
                                reader.onload = e2 => updateEduFile(i, file, e2.target?.result as string)
                                reader.readAsDataURL(file)
                              } else {
                                updateEduFile(i, file, '')
                              }
                            }} />
                          {entry.verificationPreview ? (
                            <>
                              <img src={entry.verificationPreview} alt="" className="fz-preview" />
                              <p className="fz-name">{entry.verificationFile?.name}</p>
                            </>
                          ) : entry.verificationFile ? (
                            <>
                              <div className="fz-icon" style={{ color: 'var(--evergreen)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                              </div>
                              <p className="fz-name">{entry.verificationFile.name}</p>
                            </>
                          ) : (
                            <>
                              <div className="fz-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              </div>
                              <p className="fz-label">Click to upload certificate or transcript</p>
                              <p className="fz-sub">JPG, PNG, or PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="privacy-note">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--evergreen)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p>Your documents are encrypted at rest and only reviewed by our verification team. They are never shared with students, teachers, or third parties.</p>
              </div>
            </>
          )}

          {/* ── STEP 4: Review & Submit ────────────────────────────────────── */}
          {step === 4 && (
            <>
              <h2 className="step-title">Review &amp; submit</h2>
              <p className="step-sub">Check everything is correct. Use the edit links to go back and make changes.</p>

              <div className="review-section">
                <div className="rev-head">
                  <h3>Personal details</h3>
                  <button className="rev-edit" onClick={() => setStep(1)}>Edit →</button>
                </div>
                <div className="rev-grid">
                  <div className="rev-item"><span className="rev-key">Name</span><span className="rev-val">{firstName} {lastName}</span></div>
                  <div className="rev-item"><span className="rev-key">City</span><span className="rev-val">{city || '—'}</span></div>
                  <div className="rev-item"><span className="rev-key">Country</span><span className="rev-val">{country}</span></div>
                  <div className="rev-item"><span className="rev-key">WhatsApp</span><span className="rev-val">{phone}</span></div>
                </div>
              </div>

              <div className="review-section step-section">
                <div className="rev-head">
                  <h3>Teaching background</h3>
                  <button className="rev-edit" onClick={() => setStep(2)}>Edit →</button>
                </div>
                <div className="rev-item" style={{ marginBottom: 8 }}>
                  <span className="rev-key">Teaching levels</span>
                  <div className="rev-pills" style={{ marginTop: 4 }}>
                    {Array.from(levels).map(l => <span key={l} className="rev-pill">{l}</span>)}
                  </div>
                </div>
                <div className="rev-item" style={{ marginBottom: 8 }}>
                  <span className="rev-key">Subjects</span>
                  <div className="rev-pills" style={{ marginTop: 4 }}>
                    {Array.from(subjects).map(s => (
                      <span key={s} className="rev-pill">
                        {s === '__other__' ? (otherSubject.trim() || 'Other') : s}
                      </span>
                    ))}
                  </div>
                </div>
                {boards.size > 0 && (
                  <div className="rev-item" style={{ marginBottom: 8 }}>
                    <span className="rev-key">Exam boards</span>
                    <div className="rev-pills" style={{ marginTop: 4 }}>
                      {Array.from(boards).map(b => (
                        <span key={b} className="rev-pill">
                          {b === 'Other' ? (otherBoard.trim() || 'Other') : b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rev-grid">
                  <div className="rev-item"><span className="rev-key">Experience</span><span className="rev-val">{yearsExp} {parseInt(yearsExp) === 1 ? 'year' : 'years'}</span></div>
                </div>
              </div>

              <div className="review-section step-section">
                <div className="rev-head">
                  <h3>Identity verification</h3>
                  <button className="rev-edit" onClick={() => setStep(3)}>Edit →</button>
                </div>
                <div className="rev-grid">
                  <div className="rev-item">
                    <span className="rev-key">CNIC</span>
                    <span className="rev-val">{cnicNumber.slice(0, 5)}-•••••••-{cnicNumber.slice(-1)}</span>
                  </div>
                  <div className="rev-item">
                    <span className="rev-key">Documents</span>
                    <span className="rev-val" style={{ color: 'var(--evergreen)' }}>✓ Both uploaded</span>
                  </div>
                </div>
              </div>

              <div className="declaration-box step-section">
                <p>By submitting this application, I confirm that all information provided is accurate and truthful. I understand that submitting false information may result in immediate removal from the platform.</p>
                <label className="checkbox terms">
                  <input type="checkbox" checked={declared}
                    onChange={e => { setDeclared(e.target.checked); clearErr('declared') }} />
                  <span className="box"><CheckIcon /></span>
                  <span>
                    I confirm the above information is accurate.
                    {errors.declared && <span className="hint hint--error" style={{ display: 'block' }}>{errors.declared}</span>}
                  </span>
                </label>
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
          {step < 4 && (
            <button className="btn btn-primary" onClick={handleNext}>
              Next step →
            </button>
          )}
          {step === 4 && (
            <button
              className={`btn btn-primary submit${submitting ? ' loading' : ''}`}
              onClick={handleSubmit}
              disabled={submitting}
            >
              Submit application
              {submitting && <span className="spin"><span className="spinner" aria-label="Submitting…" /></span>}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
