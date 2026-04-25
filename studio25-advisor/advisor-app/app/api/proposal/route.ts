import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

const PROPOSAL_NOTIFY_TO = 'jeffrey.l.walter@studio25.xyz'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function intakeString(value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(v => String(v)).filter(Boolean).join(', ')
  return String(value)
}

function subjectFragment(s: string): string {
  const t = s.replace(/[\r\n]+/g, ' ').trim()
  return t || '(not provided)'
}

function formatBodyParagraphs(text: string): string {
  return escapeHtml(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').join('<br/>')
}

async function sendProposalSubmissionEmail(params: {
  intakeForm: Record<string, unknown>
  narrativeScope: string
  commercialTerms: string
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return

  const from = process.env.RESEND_FROM_EMAIL?.trim() || 'onboarding@resend.dev'
  const { intakeForm, narrativeScope, commercialTerms } = params

  const firmName = intakeString(intakeForm.firm_name)
  const rfpTitle = intakeString(intakeForm.rfp_project_title)
  const subject = `new proposal submission — ${subjectFragment(firmName)} / ${subjectFragment(rfpTitle)}`

  const section = (label: string, value: string) => `
<section style="margin:0 0 1.1em 0;">
  <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#555;margin:0 0 0.25em 0;">${escapeHtml(label)}</div>
  <div style="margin:0;color:#111;">${value ? formatBodyParagraphs(value) : '<span style="color:#888;">(not provided)</span>'}</div>
</section>`

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>${escapeHtml(subject)}</title></head>
<body style="margin:16px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.5;color:#111;">
<h1 style="font-size:15px;font-weight:600;margin:0 0 1em 0;">new proposal submission</h1>
${section('firm name', firmName)}
${section('firm type', intakeString(intakeForm.firm_type))}
${section('client / asset owner', intakeString(intakeForm.client_name))}
${section('sector', intakeString(intakeForm.sectors))}
${section('project phase', intakeString(intakeForm.project_phase))}
${section('rfp title', rfpTitle)}
${section('studio 2.5 fee range', intakeString(intakeForm.fee_range))}
${section('contract value range', intakeString(intakeForm.contract_value))}
<hr style="border:none;border-top:1px solid #ddd;margin:1.25em 0;"/>
${section('generated contribution narrative and scope of work', narrativeScope)}
<hr style="border:none;border-top:1px solid #ddd;margin:1.25em 0;"/>
${section('generated commercial terms', commercialTerms)}
</body>
</html>`

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: PROPOSAL_NOTIFY_TO,
      subject,
      html,
    })
    if (error) {
      console.error('resend proposal notification error:', error)
    } else {
      console.log('resend proposal notification sent', data?.id)
    }
  } catch (e) {
    console.error('resend proposal notification failed:', e)
  }
}

function getPublicAppOrigin(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  const origin = request.headers.get('origin')?.trim().replace(/\/$/, '')
  if (origin) return origin
  return request.nextUrl.origin.replace(/\/$/, '')
}

function adaptiveCardPlainText(value: unknown, maxLen: number): string {
  const t = intakeString(value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
  if (!t) return '(not provided)'
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`
}

async function sendTeamsProposalNotification(params: {
  intakeForm: Record<string, unknown>
  dashboardUrl: string
}) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL?.trim()
  if (!webhookUrl) return

  const { intakeForm, dashboardUrl } = params

  const card = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: 'new studio 2.5 proposal submission',
        weight: 'Bolder',
        size: 'Large',
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Firm name', value: adaptiveCardPlainText(intakeForm.firm_name, 400) },
          { title: 'RFP title', value: adaptiveCardPlainText(intakeForm.rfp_project_title, 500) },
          { title: 'Client name', value: adaptiveCardPlainText(intakeForm.client_name, 400) },
          { title: 'Sector', value: adaptiveCardPlainText(intakeForm.sectors, 400) },
          { title: 'Phase', value: adaptiveCardPlainText(intakeForm.project_phase, 300) },
          { title: 'Fee range', value: adaptiveCardPlainText(intakeForm.fee_range, 300) },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'Open advisor dashboard',
        url: dashboardUrl,
      },
    ],
  }

  const body = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card,
      },
    ],
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('teams proposal webhook failed:', res.status, detail)
    }
  } catch (e) {
    console.error('teams proposal webhook error:', e)
  }
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CONTEXT_ANALYST_SYSTEM_PROMPT = `You are the context analyst for studio 2.5, an executive advisory practice specializing in AI transformation for physical asset owners and infrastructure organizations.

Your job is to read an intake form submission and produce a structured internal brief that will be passed to the narrative writer and commercial terms agents. Do not write any proposal copy. Only produce the JSON brief.

Studio 2.5 positioning:
- We operate at the intersection of spatial intelligence, agentic AI, digital twins, and lifecycle asset management
- Our foundation is decades of experience across BIM, GIS, IoT/OT systems, and real-world infrastructure operations
- We design what we call the world model stack, where spatial data, operational intelligence, and human context converge
- We serve asset owners and AEC firms simultaneously
- We are not a vendor or tool provider, we are a strategic design practice
- Our three service pillars are: Align (strategic alignment), Architect (digital architecture design), Transform (daily activations and capability building)

Brand voice rules:
- Lowercase throughout
- No em-dashes, use commas instead
- Spare, declarative prose
- No marketing inflation
- No italics or all-caps in UI elements

Analyze the intake form and return ONLY a valid JSON object with this exact structure:

{
  "opportunity_summary": "2-3 sentence synthesis of what this RFP is and what the client needs",
  "studio_fit_score": 1-5,
  "primary_service_angle": "which single studio 2.5 service pillar leads, Align, Architect, or Transform",
  "secondary_angles": ["array of supporting angles"],
  "tone_flag": "technical" | "strategic" | "visionary",
  "key_differentiators": ["3-5 specific studio 2.5 claims or capabilities most relevant to this opportunity"],
  "risk_flags": ["anything that should modulate the output, vague scope, mismatch, missing info, etc"],
  "suggested_engagement_type": "advisory retainer" | "fixed-fee deliverable" | "T&M with ceiling" | "phased options"
}

Return only the JSON. No preamble, no explanation, no markdown formatting.`

const NARRATIVE_WRITER_SYSTEM_PROMPT = `You are the proposal narrative writer for studio 2.5, an executive advisory practice specializing in AI transformation for physical asset owners and infrastructure organizations.

You will receive two inputs:
1. An analyst brief (JSON) summarizing the opportunity and strategic fit
2. The original intake form submission

Your job is to produce two outputs:

OUTPUT 1, CONTRIBUTION NARRATIVE (300-400 words)
Write studio 2.5's contribution narrative exactly as it would appear in a proposal submission. This is the "who we are and why we fit" section. Write it in first person plural (we/our). Make it specific to this opportunity, reference the client, the sector, and the project phase. Do not write generic boilerplate. Ground every claim in the specific context provided.

OUTPUT 2, SCOPE OF WORK (3-5 task items)
Write a structured scope of work with exactly this format for each task:

Task [number]: [Task title]
[2-3 sentence description of what studio 2.5 will do]
Deliverable: [specific output]

Scope tasks must be grounded in the project phase and the contribution types selected in the intake form. Write them to slot directly into a WBS or scope exhibit in a proposal.

Studio 2.5 positioning to draw from:
- World model stack: spatial data, operational intelligence, and human context converging into a unified design environment
- BIM/GIS/IoT/OT integration and interoperability
- Agentic AI and generative design frameworks for infrastructure
- Digital twin strategy and asset information model design
- Owner advisory and strategic alignment for AI transformation
- Lifecycle asset management and ISO 55000/19650 alignment

Brand voice rules, strictly enforced:
- Lowercase throughout, including headings and task titles
- No em-dashes, use commas instead
- Spare and declarative prose
- No marketing inflation or filler phrases
- No words like "cutting-edge", "revolutionary", "transformative", "leverage", "synergy"
- Short sentences preferred

Format your response exactly like this:

CONTRIBUTION NARRATIVE
[narrative text]

SCOPE OF WORK
[task items]`

const COMMERCIAL_TERMS_SYSTEM_PROMPT = `You are the commercial terms writer for studio 2.5, an executive advisory practice specializing in AI transformation for physical asset owners and infrastructure organizations.

You will receive the intake form submission including fee ranges, contract value, project phase, and contribution types selected.

Your job is to produce a commercial terms block that can be dropped directly into a proposal's commercial exhibit or teaming agreement annex.

Standard studio 2.5 commercial principles:
- studio 2.5 participates as a named sub-consultant with direct client access during workshops and advisory sessions
- All intellectual property developed during the engagement remains with studio 2.5 unless explicitly transferred by separate agreement
- Travel and disbursements are billed at cost, not included in fees unless stated
- studio 2.5 requires a minimum 30-day notice for scope changes affecting fee
- Payment terms are net-30 from invoice date
- studio 2.5 does not provide stamped engineering drawings or assume design liability

Use the fee range and contract value from the intake form to select the most appropriate engagement type:
- Under $25K fee, fixed-fee deliverable, single milestone payment
- $25K-$75K fee, fixed-fee deliverable with 2-3 milestone payments, or advisory retainer
- $75K-$150K fee, T&M with ceiling, or phased fixed-fee
- $150K+ fee, phased options with go/no-go gates, or advisory retainer with quarterly review

Produce the commercial terms block in this exact format:

COMMERCIAL TERMS

engagement type
[one sentence describing the engagement structure]

fee structure
[fee range stated, payment milestone schedule]

inclusions
[bullet list of what is included in the fee]

exclusions
[bullet list of what is not included]

teaming notes
[1-2 sentences on how studio 2.5 participates in the team structure]

standard conditions
[3-4 key commercial conditions from the studio 2.5 principles above, relevant to this engagement]

Brand voice rules, strictly enforced:
- Lowercase throughout including all headings
- No em-dashes, use commas instead
- Spare, plain language
- No legal inflation or unnecessary complexity`

type AnalystBrief = {
  opportunity_summary: string
  studio_fit_score: number
  primary_service_angle: string
  secondary_angles: string[]
  tone_flag: 'technical' | 'strategic' | 'visionary'
  key_differentiators: string[]
  risk_flags: string[]
  suggested_engagement_type: 'advisory retainer' | 'fixed-fee deliverable' | 'T&M with ceiling' | 'phased options'
}

function getTextContent(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    .trim()
}

function parseJsonBlock(text: string): AnalystBrief {
  const normalized = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  return JSON.parse(normalized) as AnalystBrief
}

async function runPrompt(system: string, userContent: string, maxTokens: number) {
  return anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userContent }],
  })
}

async function extractPdfContextFromBlob(pdfUrl: string): Promise<string> {
  const res = await fetch(pdfUrl)
  if (!res.ok) {
    throw new Error(`failed to fetch pdf: ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('pdf')) {
    throw new Error('uploaded file is not a pdf')
  }

  const arrayBuffer = await res.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system:
      'extract plain text from the attached pdf. return only extracted text. no commentary, no markdown formatting.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: 'extract the full rfp text and preserve headings where possible.',
          },
        ],
      } as any,
    ],
  })

  return getTextContent(message)
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'missing anthropic api key' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const intakeForm = body?.intakeForm ?? body?.intake ?? body

    if (!intakeForm || typeof intakeForm !== 'object') {
      return NextResponse.json({ error: 'intake form payload required' }, { status: 400 })
    }

    let extractedPdfContext = ''
    if (typeof intakeForm.rfp_pdf_url === 'string' && intakeForm.rfp_pdf_url.trim()) {
      extractedPdfContext = await extractPdfContextFromBlob(intakeForm.rfp_pdf_url.trim())
    }

    const analystInput = {
      ...intakeForm,
      rfp_pdf_extracted_context: extractedPdfContext || undefined,
    }

    const intakeJson = JSON.stringify(analystInput, null, 2)

    const analystResponse = await runPrompt(
      CONTEXT_ANALYST_SYSTEM_PROMPT,
      `intake form submission:\n${intakeJson}`,
      1800
    )
    const analystText = getTextContent(analystResponse)

    let analystBrief: AnalystBrief
    try {
      analystBrief = parseJsonBlock(analystText)
    } catch {
      return NextResponse.json(
        { error: 'context analyst returned invalid json', raw: analystText },
        { status: 502 }
      )
    }

    const narrativeResponse = await runPrompt(
      NARRATIVE_WRITER_SYSTEM_PROMPT,
      `analyst brief (json):\n${JSON.stringify(analystBrief, null, 2)}\n\noriginal intake form submission:\n${intakeJson}`,
      2500
    )
    const narrativeAndScope = getTextContent(narrativeResponse)

    const commercialResponse = await runPrompt(
      COMMERCIAL_TERMS_SYSTEM_PROMPT,
      `intake form submission:\n${intakeJson}`,
      1600
    )
    const commercialTerms = getTextContent(commercialResponse)

    const intakeRecord = intakeForm as Record<string, unknown>
    const dashboardUrl = new URL('/dashboard', `${getPublicAppOrigin(request)}/`).toString()

    await sendProposalSubmissionEmail({
      intakeForm: intakeRecord,
      narrativeScope: narrativeAndScope,
      commercialTerms,
    })

    await sendTeamsProposalNotification({
      intakeForm: intakeRecord,
      dashboardUrl,
    })

    return NextResponse.json({
      analyst_brief: analystBrief,
      narrative_scope: narrativeAndScope,
      commercial_terms: commercialTerms,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Proposal route error:', error)
    return NextResponse.json(
      { error: error?.message || 'proposal generation failed' },
      { status: 500 }
    )
  }
}
