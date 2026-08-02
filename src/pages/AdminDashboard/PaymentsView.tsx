import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './PaymentsView.css'

/* ══════════════════════════════════════════════════════════════════════════════
   Admin: verify manual bank transfers, and manage the accounts students pay to.
══════════════════════════════════════════════════════════════════════════════ */

export type ProofRow = {
  id: string
  enrollment_id: string
  student_id: string
  amount: number
  currency: string
  paid_to: string | null
  sender_name: string | null
  reference: string | null
  paid_on: string | null
  proof_path: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
  student: { first_name: string | null; last_name: string | null } | null
  enrollment: {
    start_date: string | null
    sessions_per_week: number
    courses: { title: string; level: string } | null
    teacher: { first_name: string | null; last_name: string | null } | null
  } | null
}

type Account = {
  id: string
  label: string
  account_name: string
  account_number: string
  bank_name: string | null
  instructions: string | null
  sort_order: number
  is_active: boolean
}

const BLANK = {
  label: '', account_name: '', account_number: '',
  bank_name: '', instructions: '',
}

function name(p: { first_name: string | null; last_name: string | null } | null | undefined) {
  return [p?.first_name, p?.last_name].filter(Boolean).join(' ') || '—'
}

function money(n: number, c: string) {
  return c === 'USD' ? `$${Number(n).toLocaleString()}` : `Rs ${Number(n).toLocaleString('en-PK')}`
}

export default function PaymentsView({ onReviewed }: { onReviewed?: () => void }) {
  const [tab, setTab] = useState<'verify' | 'accounts'>('verify')

  /* ── Proofs ── */
  const [proofs,  setProofs]  = useState<ProofRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<'pending' | 'all'>('pending')
  const [open,    setOpen]    = useState<ProofRow | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [note,    setNote]    = useState('')
  const [busy,    setBusy]    = useState(false)
  const [err,     setErr]     = useState('')
  const [rejecting, setRejecting] = useState(false)

  /* ── Accounts ── */
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accLoading, setAccLoading] = useState(true)
  const [draft, setDraft] = useState(BLANK)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [accBusy, setAccBusy] = useState(false)
  const [accErr,  setAccErr]  = useState('')

  const loadProofs = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payment_proofs')
      .select(`
        id, enrollment_id, student_id, amount, currency, paid_to, sender_name,
        reference, paid_on, proof_path, status, admin_note, reviewed_at, created_at,
        student:profiles!student_id ( first_name, last_name ),
        enrollment:enrollments!enrollment_id (
          start_date, sessions_per_week,
          courses ( title, level ),
          teacher:profiles!teacher_id ( first_name, last_name )
        )
      `)
      .order('created_at', { ascending: false })
    setProofs((data as unknown as ProofRow[]) ?? [])
    setLoading(false)
  }, [])

  const loadAccounts = useCallback(async () => {
    setAccLoading(true)
    const { data } = await supabase
      .from('payment_accounts')
      .select('id, label, account_name, account_number, bank_name, instructions, sort_order, is_active')
      .order('sort_order', { ascending: true })
    setAccounts((data as Account[]) ?? [])
    setAccLoading(false)
  }, [])

  useEffect(() => { loadProofs(); loadAccounts() }, [loadProofs, loadAccounts])

  /* Private bucket — the screenshot needs a signed URL to be viewable. */
  useEffect(() => {
    if (!open) { setProofUrl(''); return }
    let alive = true
    setUrlLoading(true)
    supabase.storage
      .from('payment-proofs')
      .createSignedUrl(open.proof_path, 3600)
      .then(({ data }) => {
        if (!alive) return
        setProofUrl(data?.signedUrl ?? '')
        setUrlLoading(false)
      })
    return () => { alive = false }
  }, [open])

  async function decide(status: 'approved' | 'rejected') {
    if (!open || busy) return
    if (status === 'rejected' && !note.trim()) {
      setErr('Tell the student what was wrong so they can fix it.')
      return
    }
    setBusy(true); setErr('')
    const { error } = await supabase
      .from('payment_proofs')
      .update({ status, admin_note: note.trim() || null })
      .eq('id', open.id)
    setBusy(false)
    if (error) { setErr('Could not save that. Please try again.'); return }
    setOpen(null); setNote(''); setRejecting(false)
    loadProofs()
    onReviewed?.()
  }

  async function saveAccount() {
    if (accBusy) return
    if (!draft.label.trim() || !draft.account_name.trim() || !draft.account_number.trim()) {
      setAccErr('Label, account title and number are all required.')
      return
    }
    setAccBusy(true); setAccErr('')
    const payload = {
      label:          draft.label.trim(),
      account_name:   draft.account_name.trim(),
      account_number: draft.account_number.trim(),
      bank_name:      draft.bank_name.trim() || null,
      instructions:   draft.instructions.trim() || null,
    }
    const { error } = editingId
      ? await supabase.from('payment_accounts').update(payload).eq('id', editingId)
      : await supabase.from('payment_accounts').insert({ ...payload, sort_order: accounts.length })
    setAccBusy(false)
    if (error) { setAccErr('Could not save the account. Please try again.'); return }
    setDraft(BLANK); setEditingId(null)
    loadAccounts()
  }

  async function toggleAccount(a: Account) {
    await supabase.from('payment_accounts').update({ is_active: !a.is_active }).eq('id', a.id)
    loadAccounts()
  }

  const pending  = proofs.filter(p => p.status === 'pending')
  const shown    = filter === 'pending' ? pending : proofs
  const noAccounts = !accLoading && accounts.filter(a => a.is_active).length === 0

  return (
    <>
      <div className="admin-filter-row">
        <button
          className={`afilter${tab === 'verify' ? ' active' : ''}`}
          onClick={() => setTab('verify')}
        >
          Verify payments
          <span className="afilter-n afilter-n--pending">{pending.length}</span>
        </button>
        <button
          className={`afilter${tab === 'accounts' ? ' active' : ''}`}
          onClick={() => setTab('accounts')}
        >
          Our accounts
          <span className="afilter-n afilter-n--total">{accounts.length}</span>
        </button>
      </div>

      {noAccounts && (
        <div className="pv-warn" role="alert">
          <b>No payment account is published.</b>
          <span>
            Students who register are told we&rsquo;ll contact them, and cannot pay.
            Add an account under <button className="pv-linkbtn" onClick={() => setTab('accounts')}>Our accounts</button>.
          </span>
        </div>
      )}

      {/* ════ VERIFY ════════════════════════════════════════════════════════ */}
      {tab === 'verify' && (
        <>
          {proofs.length > 0 && (
            <div className="pv-subfilter">
              <button aria-pressed={filter === 'pending'} onClick={() => setFilter('pending')}>
                Awaiting review
              </button>
              <button aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                All submissions
              </button>
            </div>
          )}

          {loading ? (
            <p className="admin-empty">Loading payments…</p>
          ) : shown.length === 0 ? (
            <p className="admin-empty">
              {filter === 'pending'
                ? 'No payments waiting to be verified.'
                : 'No payment proofs have been submitted yet.'}
            </p>
          ) : (
            <div className="pv-list">
              {shown.map(p => (
                <article
                  key={p.id}
                  className={`pv-card pv-card--${p.status}`}
                  onClick={() => { setOpen(p); setNote(p.admin_note ?? ''); setRejecting(false); setErr('') }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') { setOpen(p); setNote(p.admin_note ?? '') } }}
                >
                  <div className="pv-card-main">
                    <div className="pv-card-top">
                      <span className={`astatus astatus--${
                        p.status === 'approved' ? 'approved'
                        : p.status === 'rejected' ? 'rejected' : 'pending'
                      }`}>
                        {p.status === 'pending' ? 'Needs review'
                          : p.status === 'approved' ? 'Verified' : 'Rejected'}
                      </span>
                      <span className="pv-when">
                        {new Date(p.created_at).toLocaleString('en-GB', {
                          day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="pv-card-title">{p.enrollment?.courses?.title ?? 'Course'}</h3>
                    <p className="pv-card-meta">
                      {name(p.student)} → {name(p.enrollment?.teacher)}
                      {p.paid_to ? ` · paid to ${p.paid_to}` : ''}
                    </p>
                    {p.sender_name && (
                      <p className="pv-card-sender">Sender: <b>{p.sender_name}</b></p>
                    )}
                  </div>

                  <div className="pv-card-side">
                    <b className="pv-amount">{money(p.amount, p.currency)}</b>
                    <span className="pv-review-cta">Review →</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════ ACCOUNTS ══════════════════════════════════════════════════════ */}
      {tab === 'accounts' && (
        <div className="pv-accounts">
          <p className="pv-hint">
            These are shown to a student at checkout. Double-check every digit —
            a wrong number sends their money to the wrong place.
          </p>

          {accLoading ? (
            <p className="admin-empty">Loading accounts…</p>
          ) : (
            <div className="pv-acc-list">
              {accounts.map(a => (
                <article key={a.id} className={`pv-acc${a.is_active ? '' : ' pv-acc--off'}`}>
                  <div className="pv-acc-main">
                    <div className="pv-acc-top">
                      <b>{a.label}</b>
                      {a.bank_name && <span className="pv-acc-bank">{a.bank_name}</span>}
                      {!a.is_active && <span className="pv-acc-off-tag">Hidden</span>}
                    </div>
                    <div className="pv-acc-num mono">{a.account_number}</div>
                    <div className="pv-acc-name">{a.account_name}</div>
                    {a.instructions && <p className="pv-acc-note">{a.instructions}</p>}
                  </div>
                  <div className="pv-acc-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setEditingId(a.id)
                        setDraft({
                          label: a.label, account_name: a.account_name,
                          account_number: a.account_number,
                          bank_name: a.bank_name ?? '', instructions: a.instructions ?? '',
                        })
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleAccount(a)}>
                      {a.is_active ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="pv-acc-form">
            <h3>{editingId ? 'Edit account' : 'Add an account'}</h3>
            <div className="pv-form-grid">
              <label>
                <span>Label <em>shown to students</em></span>
                <input
                  value={draft.label}
                  placeholder="Meezan Bank / JazzCash"
                  onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                />
              </label>
              <label>
                <span>Bank or provider <em>optional</em></span>
                <input
                  value={draft.bank_name}
                  placeholder="Meezan Bank Ltd"
                  onChange={e => setDraft(d => ({ ...d, bank_name: e.target.value }))}
                />
              </label>
              <label>
                <span>Account title</span>
                <input
                  value={draft.account_name}
                  placeholder="Name the account is registered to"
                  onChange={e => setDraft(d => ({ ...d, account_name: e.target.value }))}
                />
              </label>
              <label>
                <span>Account number / IBAN</span>
                <input
                  className="mono"
                  value={draft.account_number}
                  placeholder="PK00 MEZN 0000 0000 0000 0000"
                  onChange={e => setDraft(d => ({ ...d, account_number: e.target.value }))}
                />
              </label>
              <label className="pv-form-wide">
                <span>Instructions <em>optional</em></span>
                <input
                  value={draft.instructions}
                  placeholder="e.g. Use your full name as the payment reference"
                  onChange={e => setDraft(d => ({ ...d, instructions: e.target.value }))}
                />
              </label>
            </div>

            {accErr && <p className="pv-err" role="alert">{accErr}</p>}

            <div className="pv-form-foot">
              {editingId && (
                <button
                  className="btn btn-outline"
                  onClick={() => { setEditingId(null); setDraft(BLANK); setAccErr('') }}
                >
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" onClick={saveAccount} disabled={accBusy}>
                {accBusy ? 'Saving…' : editingId ? 'Save changes' : 'Add account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ REVIEW DRAWER ═════════════════════════════════════════════════ */}
      {open && (
        <>
          <div className="admin-detail-bd" onClick={() => setOpen(null)} aria-hidden="true" />
          <aside className="admin-detail pv-detail" aria-label="Review payment">
            <header className="pv-detail-head">
              <div>
                <h2>{money(open.amount, open.currency)}</h2>
                <p>{open.enrollment?.courses?.title ?? 'Course'} · {name(open.student)}</p>
              </div>
              <button className="pv-close" onClick={() => setOpen(null)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </header>

            <div className="pv-detail-body">
              {/* The screenshot is the whole point — show it big and first. */}
              <div className="pv-proof">
                {urlLoading ? (
                  <p className="pv-proof-loading">Loading screenshot…</p>
                ) : !proofUrl ? (
                  <p className="pv-proof-loading">Could not load the file.</p>
                ) : open.proof_path.toLowerCase().endsWith('.pdf') ? (
                  <a className="btn btn-outline" href={proofUrl} target="_blank" rel="noopener noreferrer">
                    Open PDF receipt
                  </a>
                ) : (
                  <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                    <img src={proofUrl} alt="Proof of payment" className="pv-proof-img" />
                  </a>
                )}
              </div>

              <dl className="pv-detail-facts">
                <div><dt>Student</dt><dd>{name(open.student)}</dd></div>
                <div><dt>Teacher</dt><dd>{name(open.enrollment?.teacher)}</dd></div>
                <div><dt>Course</dt><dd>{open.enrollment?.courses?.title ?? '—'}</dd></div>
                <div><dt>Expected</dt><dd><b>{money(open.amount, open.currency)}</b></dd></div>
                <div><dt>Paid to</dt><dd>{open.paid_to ?? '—'}</dd></div>
                <div><dt>Sender</dt><dd>{open.sender_name ?? '—'}</dd></div>
                <div><dt>Reference</dt><dd className="mono">{open.reference ?? '—'}</dd></div>
                <div>
                  <dt>Transfer date</dt>
                  <dd>{open.paid_on
                    ? new Date(open.paid_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}</dd>
                </div>
              </dl>

              {open.status === 'pending' ? (
                <>
                  <div className="pv-decide">
                    <label className="pv-note-label" htmlFor="pv-note">
                      {rejecting ? 'Why can’t this be verified?' : 'Note (optional)'}
                    </label>
                    <textarea
                      id="pv-note"
                      rows={3}
                      value={note}
                      maxLength={400}
                      placeholder={rejecting
                        ? 'e.g. The amount is Rs 2,000 short, or the screenshot shows a pending transfer.'
                        : 'Anything worth recording about this payment.'}
                      onChange={e => { setNote(e.target.value); setErr('') }}
                    />
                    {err && <p className="pv-err" role="alert">{err}</p>}
                  </div>

                  <div className="pv-actions">
                    {rejecting ? (
                      <>
                        <button className="btn btn-outline" onClick={() => { setRejecting(false); setErr('') }}>
                          Back
                        </button>
                        <button className="btn ad-btn-reject" onClick={() => decide('rejected')} disabled={busy}>
                          {busy ? 'Saving…' : 'Confirm rejection'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-outline" onClick={() => setRejecting(true)} disabled={busy}>
                          Can&rsquo;t verify
                        </button>
                        <button className="btn ad-btn-approve" onClick={() => decide('approved')} disabled={busy}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          {busy ? 'Confirming…' : 'Payment received — enrol student'}
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className={`ad-decided ad-decided--${open.status === 'approved' ? 'approved' : 'rejected'}`}>
                  {open.status === 'approved'
                    ? '✓ Verified — the student is enrolled and both parties were notified.'
                    : '✗ Rejected — the student was asked to upload a corrected screenshot.'}
                  {open.admin_note && <span className="pv-decided-note">“{open.admin_note}”</span>}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  )
}
