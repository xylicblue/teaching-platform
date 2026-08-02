import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { fmtPrice } from '../../../lib/catalog'
import './PaymentPanel.css'

/* ══════════════════════════════════════════════════════════════════════════════
   Manual bank transfer.

   There is no payment gateway. We show the student where to send the money,
   they upload a screenshot of the transfer, and an admin verifies it by hand.
══════════════════════════════════════════════════════════════════════════════ */

export type PaymentAccount = {
  id: string
  label: string
  account_name: string
  account_number: string
  bank_name: string | null
  instructions: string | null
}

export type Proof = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  proof_path: string
  sender_name: string | null
  reference: string | null
  paid_on: string | null
  created_at: string
  reviewed_at: string | null
}

type Props = {
  enrollmentId: string
  studentId:    string
  courseId:     string
  courseTitle:  string
  teacherName:  string
  amount:       number
  currency:     string
  startDate:    string | null
  /** 'pending_payment' | 'awaiting_verification' */
  status:       string
  onSubmitted:  () => void
}

const MAX_MB = 5

export default function PaymentPanel({
  enrollmentId, studentId, courseId, courseTitle, teacherName,
  amount, currency, startDate, status, onSubmitted,
}: Props) {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const [proofs,   setProofs]   = useState<Proof[]>([])
  const [loading,  setLoading]  = useState(true)

  const [chosen,     setChosen]     = useState<string | null>(null)
  const [senderName, setSenderName] = useState('')
  const [reference,  setReference]  = useState('')
  const [paidOn,     setPaidOn]     = useState(new Date().toISOString().slice(0, 10))
  const [file,       setFile]       = useState<File | null>(null)
  const [preview,    setPreview]    = useState<string>('')
  const [copied,     setCopied]     = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [err,        setErr]        = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  /* ── Load accounts + this student's proof history ────────────────────────── */
  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('payment_accounts')
        .select('id, label, account_name, account_number, bank_name, instructions')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase.from('payment_proofs')
        .select('id, status, admin_note, proof_path, sender_name, reference, paid_on, created_at, reviewed_at')
        .eq('enrollment_id', enrollmentId)
        .order('created_at', { ascending: false }),
    ]).then(([accRes, proofRes]) => {
      if (!alive) return
      const accs = (accRes.data as PaymentAccount[]) ?? []
      setAccounts(accs)
      setProofs((proofRes.data as Proof[]) ?? [])
      if (accs.length === 1) setChosen(accs[0].label)
      setLoading(false)
    })
    return () => { alive = false }
  }, [enrollmentId])

  /* Preview object URLs must be revoked or they leak. */
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const latest   = proofs[0] ?? null
  const rejected = latest?.status === 'rejected' ? latest : null
  const waiting  = status === 'awaiting_verification' && latest?.status === 'pending'

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(c => (c === key ? null : c)), 1800)
    } catch {
      setErr('Could not copy — please select the number and copy it manually.')
    }
  }

  function pickFile(f: File | null) {
    setErr('')
    if (!f) { setFile(null); return }
    if (!/^image\/|^application\/pdf$/.test(f.type)) {
      setErr('Upload a screenshot (PNG or JPG) or a PDF receipt.')
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErr(`That file is ${(f.size / 1048576).toFixed(1)} MB. Keep it under ${MAX_MB} MB.`)
      return
    }
    setFile(f)
  }

  async function handleSubmit() {
    if (!file || submitting) return
    setSubmitting(true)
    setErr('')

    const ext  = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${studentId}/${enrollmentId}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('payment-proofs')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (upErr) {
      setSubmitting(false)
      setErr('Could not upload the screenshot. Please check your connection and try again.')
      return
    }

    // amount + currency are set server-side from the enrollment.
    const { error } = await supabase.from('payment_proofs').insert({
      enrollment_id: enrollmentId,
      student_id:    studentId,
      paid_to:       chosen,
      sender_name:   senderName.trim() || null,
      reference:     reference.trim() || null,
      paid_on:       paidOn || null,
      proof_path:    path,
    })

    setSubmitting(false)

    if (error) {
      setErr(
        error.code === '23505'
          ? 'You already have a payment awaiting review for this course.'
          : 'Could not submit your payment. Please try again.'
      )
      return
    }
    onSubmitted()
  }

  if (loading) {
    return <div className="pay-panel"><p className="pay-loading">Loading payment details…</p></div>
  }

  /* ── Submitted, waiting on an admin ──────────────────────────────────────── */
  if (waiting) {
    return (
      <div className="pay-panel">
        <span className="pay-pill pay-pill--wait">Awaiting verification</span>
        <h1 className="display">We&rsquo;re checking your payment.</h1>
        <p className="pay-lede">
          Your screenshot for <b>{courseTitle}</b> is with our team. We usually verify
          within a few hours, and you&rsquo;ll be notified the moment it&rsquo;s confirmed.
        </p>

        <dl className="pay-receipt">
          <div><dt>Amount</dt><dd>{fmtPrice(amount, currency)}</dd></div>
          <div><dt>Teacher</dt><dd>{teacherName}</dd></div>
          {latest?.reference && <div><dt>Reference</dt><dd>{latest.reference}</dd></div>}
          <div>
            <dt>Submitted</dt>
            <dd>{new Date(latest!.created_at).toLocaleString('en-GB', {
              day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
            })}</dd>
          </div>
        </dl>

        <div className="pay-foot">
          <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
          <Link className="btn btn-outline" to={`/courses/${courseId}`}>Back to course</Link>
        </div>
      </div>
    )
  }

  /* ── No accounts configured yet ──────────────────────────────────────────── */
  if (accounts.length === 0) {
    return (
      <div className="pay-panel">
        <span className="pay-pill pay-pill--wait">Payment setup pending</span>
        <h1 className="display">Your place is held.</h1>
        <p className="pay-lede">
          You&rsquo;re registered for <b>{courseTitle}</b>, but our payment details
          aren&rsquo;t published yet. Our team will contact you on WhatsApp with
          transfer instructions. Nothing has been charged.
        </p>
        <div className="pay-foot">
          <Link className="btn btn-primary" to="/dashboard">Go to my dashboard</Link>
        </div>
      </div>
    )
  }

  /* ── Pay now ─────────────────────────────────────────────────────────────── */
  return (
    <div className="pay-wrap">
      <div className="pay-head">
        <span className="pay-pill">Step 3 of 3 · Payment</span>
        <h1 className="pay-title display">Transfer {fmtPrice(amount, currency)} to confirm your place.</h1>
        <p className="pay-lede">
          Send the amount to any one of the accounts below, then upload a screenshot
          of the transfer. An admin verifies it and your classes are confirmed.
        </p>
      </div>

      {rejected && (
        <div className="pay-rejected" role="alert">
          <b>Your last payment could not be verified.</b>
          <span>
            {rejected.admin_note?.trim() ||
              'We could not match the screenshot to a transfer. Please check the details and upload it again.'}
          </span>
        </div>
      )}

      <div className="pay-grid">
        {/* ── 1. Where to send ── */}
        <section className="pay-step">
          <div className="pay-step-head">
            <span className="pay-num mono">01</span>
            <div>
              <h2>Send the money</h2>
              <p>Transfer the exact amount. Pick whichever account is easiest for you.</p>
            </div>
          </div>

          <div className="pay-amount-call">
            <span>Amount to transfer</span>
            <b>{fmtPrice(amount, currency)}</b>
            <button
              type="button"
              className="pay-copy pay-copy--amount"
              onClick={() => copy(String(amount), 'amount')}
            >
              {copied === 'amount' ? 'Copied' : 'Copy amount'}
            </button>
          </div>

          <div className="pay-accounts">
            {accounts.map(a => (
              <article
                key={a.id}
                className={`pay-account${chosen === a.label ? ' selected' : ''}`}
                onClick={() => setChosen(a.label)}
              >
                <div className="pay-account-top">
                  <b>{a.label}</b>
                  {a.bank_name && <span className="pay-bank">{a.bank_name}</span>}
                </div>

                <div className="pay-row">
                  <span className="pay-row-lbl">Account title</span>
                  <span className="pay-row-val">{a.account_name}</span>
                </div>

                <div className="pay-row">
                  <span className="pay-row-lbl">Number</span>
                  <span className="pay-row-val mono pay-number">{a.account_number}</span>
                  <button
                    type="button"
                    className="pay-copy"
                    onClick={e => { e.stopPropagation(); copy(a.account_number, a.id) }}
                    aria-label={`Copy ${a.label} account number`}
                  >
                    {copied === a.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                {a.instructions && <p className="pay-instructions">{a.instructions}</p>}
              </article>
            ))}
          </div>
        </section>

        {/* ── 2. Prove it ── */}
        <section className="pay-step">
          <div className="pay-step-head">
            <span className="pay-num mono">02</span>
            <div>
              <h2>Upload your proof</h2>
              <p>A screenshot of the confirmation screen, or the PDF receipt.</p>
            </div>
          </div>

          <div
            className={`pay-drop${file ? ' has-file' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0] ?? null) }}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click() }}
            aria-label="Upload proof of payment"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={e => pickFile(e.target.files?.[0] ?? null)}
            />

            {file ? (
              <div className="pay-file">
                {preview && file.type.startsWith('image/')
                  ? <img src={preview} alt="Payment screenshot preview" className="pay-thumb" />
                  : <span className="pay-thumb pay-thumb--pdf">PDF</span>}
                <div className="pay-file-meta">
                  <b>{file.name}</b>
                  <span>{(file.size / 1024).toFixed(0)} KB · tap to replace</span>
                </div>
              </div>
            ) : (
              <div className="pay-drop-empty">
                <span className="pay-drop-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5M12 3v13" />
                  </svg>
                </span>
                <b>Tap to upload your screenshot</b>
                <span>PNG, JPG or PDF · up to {MAX_MB} MB</span>
              </div>
            )}
          </div>

          <div className="pay-fields">
            <label className="pay-field">
              <span>Name on the sending account</span>
              <input
                type="text"
                value={senderName}
                maxLength={80}
                placeholder="Who the transfer came from"
                onChange={e => setSenderName(e.target.value)}
              />
            </label>
            <label className="pay-field">
              <span>Transaction ID <em>(optional)</em></span>
              <input
                type="text"
                value={reference}
                maxLength={60}
                placeholder="From your receipt"
                onChange={e => setReference(e.target.value)}
              />
            </label>
            <label className="pay-field">
              <span>Date of transfer</span>
              <input
                type="date"
                value={paidOn}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setPaidOn(e.target.value)}
              />
            </label>
          </div>

          {err && <p className="pay-err" role="alert">{err}</p>}

          <div className="pay-submit">
            <button
              className="btn btn-primary btn-lg"
              disabled={!file || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting…' : 'Submit payment for verification'}
            </button>
            {!file && <span className="pay-submit-hint">Upload your screenshot to continue.</span>}
          </div>
        </section>
      </div>

      {/* ── Summary rail ── */}
      <aside className="pay-summary">
        <div className="pay-sum-card">
          <div className="pay-sum-title">{courseTitle}</div>
          <div className="pay-sum-sub">with {teacherName}</div>

          <div className="pay-sum-amount">
            <span>Due now</span>
            <b>{fmtPrice(amount, currency)}</b>
            <span className="pay-sum-note">first month</span>
          </div>

          {startDate && (
            <div className="pay-sum-row">
              <span>Classes start</span>
              <b>{new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</b>
            </div>
          )}

          <ol className="pay-steps-mini">
            <li className="done">Demo completed</li>
            <li className="done">Registered</li>
            <li className="current">Transfer &amp; upload proof</li>
            <li>Admin verifies · classes begin</li>
          </ol>

          <p className="pay-sum-safety">
            Keep your receipt until your first class is confirmed. If anything looks
            wrong, contact us before transferring.
          </p>
        </div>
      </aside>
    </div>
  )
}
