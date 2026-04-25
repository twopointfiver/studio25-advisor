'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { PROPOSAL_SESSION_KEY, type ProposalSessionPayload } from '@/lib/proposal-session'
import { splitNarrativeScope } from '@/lib/proposal-split'

const CALENDLY =
  'https://calendly.com/jeffrey-l-walter-studio25/jeff-walter-studio-2-5-connect?primary_color=6f9f25'

type PanelId = 'narrative' | 'scope' | 'commercial'

function LoadingLine() {
  return (
    <div className="flex min-h-[4.5rem] items-center px-2 py-5">
      <div className="h-0.5 w-full origin-center rounded-full bg-g-bright/35 animate-pulse-bar" />
    </div>
  )
}

/** Readable preview: several paragraphs up to a char budget (no blur; full unlock still needed for copy + tail). */
function narrativeLockedTeaser(text: string): string {
  const raw = text.replace(/\r\n/g, '\n').trim()
  if (!raw) return ''
  const paras = raw.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  const maxParas = 5
  const maxChars = 1350
  const chunks: string[] = []
  let total = 0
  for (let i = 0; i < paras.length && i < maxParas; i++) {
    const p = paras[i]
    const sep = chunks.length ? 2 : 0
    if (total + sep + p.length > maxChars) {
      const room = maxChars - total - sep
      if (room > 100) {
        chunks.push(p.slice(0, room).replace(/\s+\S*$/, '') + '…')
      }
      break
    }
    chunks.push(p)
    total += sep + p.length
  }
  let out = chunks.join('\n\n')
  if (!out) {
    out = raw.slice(0, maxChars).replace(/\s+\S*$/, '')
    if (raw.length > maxChars) out += '…'
    return out
  }
  const truncated = out.length < raw.length - 40 || paras.length > chunks.length
  if (truncated && !out.endsWith('…')) out += '\n\n…'
  return out
}

/** Per task: title + start of body (deliverable line may be partially shown). */
function scopeLockedTeaser(scopeText: string): string {
  const raw = scopeText.replace(/\r\n/g, '\n').trim()
  if (!raw) return ''
  const blocks = raw.split(/(?=^task\s+\d+\s*:)/gim).map(b => b.trim()).filter(Boolean)
  const taskBlocks = blocks.filter(b => /^task\s+\d+\s*:/i.test(b))
  if (taskBlocks.length === 0) {
    return raw.length > 1100 ? `${raw.slice(0, 1100).replace(/\s+\S*$/, '')}…` : raw
  }
  const perBody = 340
  const shown = taskBlocks.slice(0, 5)
  let text = shown
    .map(block => {
      const lines = block.split('\n').map(l => l.trimEnd())
      const title = (lines[0] || '').trim()
      const body = lines
        .slice(1)
        .join('\n')
        .trim()
      if (!body) return title
      if (body.length <= perBody) return `${title}\n${body}`
      return `${title}\n${body.slice(0, perBody).replace(/\s+\S*$/, '')} …`
    })
    .join('\n\n')
  if (taskBlocks.length > shown.length) text += '\n\n…'
  return text
}

/** First part of commercial block so readers see real structure, not only a lock icon. */
function commercialLockedTeaser(text: string): string {
  const raw = text.replace(/\r\n/g, '\n').trim()
  if (!raw) return ''
  const paras = raw.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  const maxChars = 780
  let out = ''
  for (const p of paras) {
    if (!out) {
      if (p.length > maxChars) return `${p.slice(0, maxChars).replace(/\s+\S*$/, '')}…`
      out = p
      continue
    }
    if (out.length + 2 + p.length > maxChars) {
      const room = maxChars - out.length - 2
      if (room > 100) out += `\n\n${p.slice(0, room).replace(/\s+\S*$/, '')}…`
      break
    }
    out += `\n\n${p}`
  }
  if (out.length < raw.length - 40 && !out.endsWith('…')) out += '\n\n…'
  return out
}

function analystSummaryTeaser(brief: Record<string, unknown> | undefined): string {
  if (!brief) return ''
  const summary = typeof brief.opportunity_summary === 'string' ? brief.opportunity_summary.trim() : ''
  if (!summary) return ''
  const max = 520
  if (summary.length <= max) return summary
  return `${summary.slice(0, max).replace(/\s+\S*$/, '')}…`
}

function ArtifactPanel({
  sectionLabel,
  content,
  loading,
  copied,
  isUnlocked,
  previewHint,
  onCopy,
}: {
  sectionLabel: string
  content: string
  loading: boolean
  copied: boolean
  isUnlocked: boolean
  /** Shown under the body when locked so users know why copy is disabled and what a call unlocks. */
  previewHint?: string
  onCopy: () => void
}) {
  return (
    <div className="relative">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-g-bright/75">{sectionLabel}</p>
      <div className="relative rounded-lg border border-g-bright/30 bg-[#0e1408] p-6 pr-14 text-sm leading-relaxed text-white/90">
        <button
          type="button"
          onClick={onCopy}
          disabled={loading || !content || !isUnlocked}
          className="absolute right-3 top-3 rounded-md border border-g-bright/30 bg-g-deep/70 px-2 py-1 text-[11px] font-semibold text-g-bright transition hover:bg-g-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
        {loading ? (
          <div>
            <p className="mb-3 text-xs text-g-bright/60">generating...</p>
            <LoadingLine />
          </div>
        ) : (
          <div className="relative">
            <pre className="whitespace-pre-wrap font-sans text-sm text-white/90">{content}</pre>
            {!isUnlocked && previewHint ? (
              <p className="mt-4 border-t border-g-bright/20 pt-3 text-[11px] leading-snug text-g-bright/70">{previewHint}</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProposalGeneratePage() {
  const [pageStatus, setPageStatus] = useState<'loading' | 'empty' | 'ready'>('loading')
  const [payload, setPayload] = useState<ProposalSessionPayload | null>(null)
  const [narrative, setNarrative] = useState('')
  const [scope, setScope] = useState('')
  const [commercial, setCommercial] = useState('')
  const [panel1Done, setPanel1Done] = useState(false)
  const [panel2Done, setPanel2Done] = useState(false)
  const [panel3Done, setPanel3Done] = useState(false)
  const [copied, setCopied] = useState<Record<PanelId, boolean>>({
    narrative: false,
    scope: false,
    commercial: false,
  })
  const [refineText, setRefineText] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [codeError, setCodeError] = useState('')

  const runSequentialReveal = useCallback((n: string, s: string, c: string) => {
    setPanel1Done(false)
    setPanel2Done(false)
    setPanel3Done(false)
    setNarrative('')
    setScope('')
    setCommercial('')

    const d1 = 500
    const d2 = 900
    const t1 = window.setTimeout(() => {
      setNarrative(n)
      setPanel1Done(true)
    }, d1)
    const t2 = window.setTimeout(() => {
      setScope(s)
      setPanel2Done(true)
    }, d1 + d2)
    const t3 = window.setTimeout(() => {
      setCommercial(c)
      setPanel3Done(true)
    }, d1 + d2 * 2)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PROPOSAL_SESSION_KEY)
      if (!raw) {
        setPayload(null)
        setPageStatus('empty')
        return
      }
      const data = JSON.parse(raw) as ProposalSessionPayload
      if (data.version !== 1 || typeof data.narrative_scope !== 'string') {
        setPayload(null)
        setPageStatus('empty')
        return
      }
      setPayload(data)
      setPageStatus('ready')
      const savedUnlock = sessionStorage.getItem(`${PROPOSAL_SESSION_KEY}_unlocked`)
      setIsUnlocked(savedUnlock === 'true')
      const { narrative: n, scope: s } = splitNarrativeScope(data.narrative_scope)
      const comm = (data.commercial_terms || '').trim()
      return runSequentialReveal(n, s, comm)
    } catch {
      setPayload(null)
      setPageStatus('empty')
    }
  }, [runSequentialReveal])

  const flashCopied = (id: PanelId) => {
    setCopied(prev => ({ ...prev, [id]: true }))
    window.setTimeout(() => {
      setCopied(prev => ({ ...prev, [id]: false }))
    }, 2000)
  }

  const handleCopy = async (id: PanelId, text: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      flashCopied(id)
    } catch {
      /* ignore */
    }
  }

  const handleRefine = async () => {
    if (!payload || !refineText.trim()) return
    setRefineError('')
    setRefining(true)
    try {
      const intake = { ...(payload.intakeForm as Record<string, unknown>) }
      const prevSummary = String(intake.rfp_summary || '')
      intake.rfp_summary = `${prevSummary}\n\nrefinement request:\n${refineText.trim()}`

      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeForm: intake }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const next: ProposalSessionPayload = {
        version: 1,
        firm_name: payload.firm_name,
        rfp_project_title: payload.rfp_project_title,
        intakeForm: intake,
        analyst_brief: data.analyst_brief,
        narrative_scope: data.narrative_scope,
        commercial_terms: data.commercial_terms,
        timestamp: data.timestamp || new Date().toISOString(),
      }
      sessionStorage.setItem(PROPOSAL_SESSION_KEY, JSON.stringify(next))
      setPayload(next)
      setPageStatus('ready')
      setRefineText('')
      setIsUnlocked(true)
      sessionStorage.setItem(`${PROPOSAL_SESSION_KEY}_unlocked`, 'true')
      const { narrative: n, scope: s } = splitNarrativeScope(data.narrative_scope)
      runSequentialReveal(n, s, (data.commercial_terms || '').trim())
    } catch (e: unknown) {
      setRefineError(e instanceof Error ? e.message : 'refine failed')
    } finally {
      setRefining(false)
    }
  }

  const handleUnlockByCode = () => {
    const expected = (process.env.NEXT_PUBLIC_PROPOSAL_UNLOCK_CODE || 'studio25').trim().toLowerCase()
    const entered = confirmationCode.trim().toLowerCase()
    if (!entered || entered !== expected) {
      setCodeError('invalid confirmation code')
      return
    }
    setCodeError('')
    setIsUnlocked(true)
    sessionStorage.setItem(`${PROPOSAL_SESSION_KEY}_unlocked`, 'true')
  }

  if (pageStatus === 'loading') {
    return (
      <main className="min-h-screen bg-black px-4 pb-16 pt-8 font-sans text-white">
        <div className="mx-auto max-w-[680px] py-16">
          <div className="h-0.5 w-32 rounded-full bg-g-bright/30 animate-pulse-bar" />
        </div>
      </main>
    )
  }

  if (pageStatus === 'empty' || !payload) {
    return (
      <main className="min-h-screen bg-black px-4 pb-16 pt-8 font-sans text-white">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="mb-4 text-sm text-white/70">no proposal output found. start from the intake form.</p>
          <Link href="/proposal" className="text-sm font-bold text-g-bright underline">
            back to proposal intake
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-8 font-sans lowercase text-white">
      <div className="mx-auto max-w-[680px]">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-g-bright">studio 2.5 / proposal tool</p>
        <h1 className="mb-2 font-serif text-3xl font-normal italic tracking-tight text-white md:text-4xl">
          your proposal contribution
        </h1>
        <p className="mb-5 text-sm leading-relaxed text-white/65">
          {isUnlocked
            ? 'three artifacts generated. copy each section directly into your submission.'
            : 'three artifacts below include excerpt previews so you can see depth and tone. copy and full text unlock after your alignment call or confirmation code.'}
        </p>
        <div className="mb-10 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-g-bright/35 bg-g-deep/60 px-4 py-2 text-xs text-white/90">
          <span className="font-semibold text-g-bright">{payload.firm_name}</span>
          <span className="text-white/30">·</span>
          <span className="text-white/80">{payload.rfp_project_title}</span>
        </div>

        {!isUnlocked && analystSummaryTeaser(payload.analyst_brief) ? (
          <div className="mb-8 rounded-lg border border-g-bright/35 bg-g-deep/50 p-5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-g-bright">agent 1 · context brief</p>
            <p className="mb-2 text-xs font-semibold text-white/90">how we read this opportunity</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{analystSummaryTeaser(payload.analyst_brief)}</p>
            {typeof payload.analyst_brief.studio_fit_score === 'number' ? (
              <p className="mt-3 text-xs text-g-bright/85">
                preliminary studio fit signal:{' '}
                <span className="font-bold text-g-bright">{payload.analyst_brief.studio_fit_score}/5</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-0">
          <ArtifactPanel
            sectionLabel="contribution narrative"
            content={isUnlocked ? narrative : narrativeLockedTeaser(narrative)}
            loading={!panel1Done}
            copied={copied.narrative}
            isUnlocked={isUnlocked}
            previewHint={
              !isUnlocked
                ? 'you are seeing an excerpt. copy and the full narrative unlock after your alignment call (or code below).'
                : undefined
            }
            onCopy={() => handleCopy('narrative', narrative)}
          />
          <hr className="my-8 border-0 border-t border-g-bright/25" />

          <ArtifactPanel
            sectionLabel="scope of work"
            content={isUnlocked ? scope : scopeLockedTeaser(scope)}
            loading={!panel2Done}
            copied={copied.scope}
            isUnlocked={isUnlocked}
            previewHint={
              !isUnlocked
                ? 'task titles plus the start of each work package. full deliverable wording unlocks after alignment.'
                : undefined
            }
            onCopy={() => handleCopy('scope', scope)}
          />
          <hr className="my-8 border-0 border-t border-g-bright/25" />

          <ArtifactPanel
            sectionLabel="commercial terms"
            content={isUnlocked ? commercial : commercialLockedTeaser(commercial)}
            loading={!panel3Done}
            copied={copied.commercial}
            isUnlocked={isUnlocked}
            previewHint={
              !isUnlocked
                ? 'opening of the commercial block only. milestones, exclusions, and teaming detail unlock in full after alignment.'
                : undefined
            }
            onCopy={() => handleCopy('commercial', commercial)}
          />
          <hr className="my-8 border-0 border-t border-g-bright/25" />
        </div>

        {!isUnlocked && (
          <section className="mb-10 rounded-lg bg-[#121f04] p-8">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-g-bright">one more step</p>
            <h2 className="mb-3 font-serif text-2xl font-normal leading-tight text-white md:text-[28px]">
              book a 30-minute alignment call to unlock your full proposal contribution
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-white/70">
              we review every submission before it goes out. this keeps the quality high and makes sure studio 2.5 is the right fit for your pursuit.
            </p>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex items-center justify-center rounded-lg bg-g-vivid px-4 py-2 text-sm font-extrabold text-g-deep transition hover:bg-g-bright"
            >
              book alignment call
            </a>

            <p className="mb-2 text-xs text-white/60">already booked? enter your confirmation code</p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={confirmationCode}
                onChange={e => {
                  setConfirmationCode(e.target.value)
                  if (codeError) setCodeError('')
                }}
                placeholder="confirmation code"
                className="w-full max-w-[260px] rounded-md border border-g-bright/30 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-g-bright focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUnlockByCode}
                className="rounded-md border border-g-bright/40 bg-g-deep px-3 py-2 text-xs font-bold text-g-bright transition hover:border-g-bright"
              >
                submit
              </button>
            </div>
            {codeError ? <p className="mt-2 text-xs text-red-400">{codeError}</p> : null}
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-g-bright/75">refine this output</h2>
          <textarea
            value={refineText}
            onChange={e => setRefineText(e.target.value)}
            disabled={refining || !panel3Done}
            rows={4}
            placeholder="describe what you'd like to change, e.g. make the scope more specific to operations phase, or adjust the fee structure to fixed-fee"
            className="mb-3 w-full resize-y rounded-lg border border-g-bright/30 bg-[#0e1408] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:border-g-bright focus:outline-none disabled:opacity-50"
          />
          {refineError ? <p className="mb-2 text-xs text-red-600">{refineError}</p> : null}
          <button
            type="button"
            onClick={handleRefine}
            disabled={refining || !refineText.trim() || !panel3Done}
            className="rounded-lg bg-g-vivid px-4 py-2 text-xs font-bold text-g-deep transition hover:bg-g-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            {refining ? 'refining...' : 'refine'}
          </button>
        </section>

        <div className="overflow-hidden rounded-xl border border-g-bright/25 bg-[#10170a]">
          <div className="p-6 md:flex md:items-stretch">
            <div className="mb-4 flex-1 md:mb-0 md:pr-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-g-bright">from insight to outcome</p>
              <p className="mb-1 font-sans text-base font-bold text-white">ready to turn this into a deliverable?</p>
              <p className="font-serif text-sm leading-relaxed text-white/60">
                connect with the studio to find out how to turn these artifacts into scoped advisory outcomes.
              </p>
            </div>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-g-vivid px-5 py-3 text-center font-sans text-sm font-extrabold text-g-deep transition hover:bg-g-bright md:w-52"
            >
              book a free conversation →
            </a>
          </div>
        </div>

        <p className="mt-10 text-center">
          <Link href="/proposal" className="text-xs font-bold text-g-bright underline underline-offset-2">
            ← edit intake and regenerate
          </Link>
        </p>
      </div>
    </main>
  )
}
