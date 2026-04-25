'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/lib/brand'
import { PROPOSAL_SESSION_KEY, type ProposalSessionPayload } from '@/lib/proposal-session'

interface ProposalForm {
  firm_name: string
  firm_type: string
  primary_office_location: string
  worked_with_studio_before: string
  firm_role: string
  teaming_model: string
  firm_context: string
  rfp_project_title: string
  client_name: string
  sectors: string[]
  project_phase: string
  procurement_path: string
  opportunity_summary: string
  submission_deadline: string
  innovation_component_called_out: string
  contribution_types: string[]
  requested_outputs: string[]
  fee_range: string
  contract_value: string
  constraints_or_context: string
  specific_ask: string
  rfp_pdf_url: string
  rfp_pdf_filename: string
}

export default function ProposalPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProposalForm>({
    firm_name: '',
    firm_type: '',
    primary_office_location: '',
    worked_with_studio_before: '',
    firm_role: '',
    teaming_model: '',
    firm_context: '',
    rfp_project_title: '',
    client_name: '',
    sectors: [],
    project_phase: '',
    procurement_path: '',
    opportunity_summary: '',
    submission_deadline: '',
    innovation_component_called_out: '',
    contribution_types: [],
    requested_outputs: [],
    fee_range: '',
    contract_value: '',
    constraints_or_context: '',
    specific_ask: '',
    rfp_pdf_url: '',
    rfp_pdf_filename: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const contributionOptions = [
    'executive alignment',
    'world model stack design',
    'digital twin strategy',
    'bim gis iot ot interoperability',
    'agentic ai workflow design',
    'lifecycle asset management'
  ]
  const feeBandOptions = [
    'under $25k',
    '$25k-$75k',
    '$75k-$150k',
    '$150k+'
  ]
  const requestedOutputOptions = [
    'contribution narrative',
    'scope of work',
    'commercial terms block',
    'executive summary',
    'risk and assumptions',
    'teaming language'
  ]
  const isRequiredComplete =
    !!form.firm_name.trim() &&
    !!form.firm_type.trim() &&
    !!form.primary_office_location.trim() &&
    !!form.worked_with_studio_before.trim() &&
    !!form.rfp_project_title.trim() &&
    !!form.client_name.trim() &&
    form.sectors.length > 0 &&
    !!form.project_phase.trim() &&
    !!form.submission_deadline &&
    !!form.opportunity_summary.trim()
  const section1Missing = [
    !form.firm_name.trim(),
    !form.firm_type.trim(),
    !form.primary_office_location.trim(),
    !form.worked_with_studio_before.trim(),
  ].filter(Boolean).length
  const section2Missing = [
    !form.rfp_project_title.trim(),
    !form.client_name.trim(),
    form.sectors.length === 0,
    !form.project_phase.trim(),
    !form.submission_deadline,
    !form.opportunity_summary.trim(),
  ].filter(Boolean).length
  const section3Missing = [
    !form.contract_value.trim(),
    !form.constraints_or_context.trim(),
  ].filter(Boolean).length
  const sectorOptions = [
    'transportation infrastructure',
    'water and wastewater',
    'energy and utilities',
    'public works and civic assets',
    'ports airports and logistics',
    'healthcare and campuses',
    'industrial and manufacturing'
  ]

  async function onSubmit() {
    if (loading) return
    setError('')

    const intakeForm = {
      firm_name: form.firm_name.trim(),
      firm_type: form.firm_type.trim(),
      primary_office_location: form.primary_office_location.trim(),
      worked_with_studio_before: form.worked_with_studio_before.trim(),
      firm_role: form.firm_role.trim(),
      teaming_model: form.teaming_model.trim(),
      firm_context: form.firm_context.trim(),
      rfp_project_title: form.rfp_project_title.trim(),
      client_name: form.client_name.trim(),
      sectors: form.sectors,
      sector: form.sectors.join(', '),
      project_phase: form.project_phase.trim(),
      procurement_path: form.procurement_path.trim(),
      opportunity_summary: form.opportunity_summary.trim(),
      submission_deadline: form.submission_deadline,
      innovation_component_called_out: form.innovation_component_called_out,
      contribution_types: form.contribution_types,
      requested_outputs: form.requested_outputs,
      fee_range: form.fee_range.trim(),
      contract_value: form.contract_value.trim(),
      constraints_or_context: form.constraints_or_context.trim(),
      specific_ask: form.specific_ask.trim(),
      rfp_pdf_url: form.rfp_pdf_url.trim(),
      rfp_pdf_filename: form.rfp_pdf_filename.trim(),
      rfp_summary: `rfp project title: ${form.rfp_project_title.trim()}\nclient or asset owner: ${form.client_name.trim()}\nsectors: ${form.sectors.join(', ') || 'not provided'}\nproject phase: ${form.project_phase.trim()}\nsubmission deadline: ${form.submission_deadline || 'not provided'}\ninnovation component called out: ${form.innovation_component_called_out || 'unknown'}\n\nopportunity summary:\n${form.opportunity_summary.trim()}\n\nconstraints or context:\n${form.constraints_or_context.trim() || 'not provided'}\n\nspecific ask:\n${form.specific_ask.trim()}`,
    }

    if (
      !intakeForm.firm_name ||
      !intakeForm.firm_type ||
      !intakeForm.primary_office_location ||
      !intakeForm.worked_with_studio_before ||
      !intakeForm.rfp_project_title ||
      !intakeForm.client_name ||
      intakeForm.sectors.length === 0 ||
      !intakeForm.project_phase ||
      !intakeForm.submission_deadline
    ) {
      setError('please complete required fields in sections 01 and 02')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeForm }),
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const session: ProposalSessionPayload = {
        version: 1,
        firm_name: intakeForm.firm_name,
        rfp_project_title: intakeForm.rfp_project_title,
        intakeForm: intakeForm as unknown as Record<string, unknown>,
        analyst_brief: data.analyst_brief,
        narrative_scope: data.narrative_scope,
        commercial_terms: data.commercial_terms,
        timestamp: data.timestamp || new Date().toISOString(),
      }
      sessionStorage.setItem(PROPOSAL_SESSION_KEY, JSON.stringify(session))
      router.push('/proposal/generate')
    } catch (e: any) {
      setError(e?.message || 'proposal generation failed')
    } finally {
      setLoading(false)
    }
  }

  function toggleContribution(type: string) {
    setForm(prev => ({
      ...prev,
      contribution_types: prev.contribution_types.includes(type)
        ? prev.contribution_types.filter(t => t !== type)
        : [...prev.contribution_types, type]
    }))
  }

  function toggleRequestedOutput(output: string) {
    setForm(prev => ({
      ...prev,
      requested_outputs: prev.requested_outputs.includes(output)
        ? prev.requested_outputs.filter(t => t !== output)
        : [...prev.requested_outputs, output]
    }))
  }

  function toggleSector(sector: string) {
    setForm(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }))
  }

  async function handlePdfUpload(file: File | null) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('please upload a pdf file')
      return
    }

    setError('')
    setUploadingPdf(true)
    try {
      const payload = new FormData()
      payload.append('file', file)

      const response = await fetch('/api/proposal/upload', {
        method: 'POST',
        body: payload,
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setForm(prev => ({
        ...prev,
        rfp_pdf_url: data.url,
        rfp_pdf_filename: data.filename || file.name,
      }))
    } catch (e: any) {
      setError(e?.message || 'pdf upload failed')
    } finally {
      setUploadingPdf(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: BRAND.bg, color: BRAND.fg, fontFamily: "'Satoshi',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .proposal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 10px; }
        .proposal-control { box-sizing: border-box; width: 100%; max-width: 100%; font-family: 'Satoshi', 'Plus Jakarta Sans', sans-serif; }
        @media (max-width: 900px) { .proposal-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '26px 24px 72px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 700, color: 'rgba(123,201,6,0.8)', marginBottom: 8, textTransform: 'lowercase' }}>
              studio 2.5 / proposal tool
            </p>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>generate proposal contribution pack</h1>
          </div>
          <Link href="/dashboard" style={{ color: BRAND.lime, fontSize: 12, textDecoration: 'none', fontWeight: 700 }}>
            back to dashboard →
          </Link>
        </div>

        <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 780 }}>
          enter opportunity context once, then generate analyst brief, contribution narrative with scope, and commercial terms in one pass.
        </p>

        {error && (
          <div style={{ background: 'rgba(185,28,28,0.1)', border: '0.5px solid rgba(185,28,28,0.4)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#fca5a5', marginBottom: 14 }}>
            {error}
          </div>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, alignItems: 'start' }}>
          <div style={{ background: 'linear-gradient(180deg, rgba(12,22,4,0.96), rgba(8,14,3,0.96))', border: `1.5px solid ${BRAND.lime}`, borderRadius: BRAND.panelRadius, padding: 18, overflow: 'hidden' }}>
            <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(123,201,6,0.78)', fontWeight: 700 }}>intake worksheet</p>

            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '0.5px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 8px', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#c8f486', letterSpacing: '0.04em' }}>01, the firm</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: section1Missing === 0 ? '#7BC906' : 'rgba(255,255,255,0.6)' }}>
                  {section1Missing === 0 ? 'complete' : `missing ${section1Missing} required`}
                </span>
              </div>
              <div className="proposal-grid">
                <input className="proposal-control" value={form.firm_name} onChange={e => setForm(prev => ({ ...prev, firm_name: e.target.value }))} placeholder="firm name * required" disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                <select className="proposal-control" value={form.firm_type} onChange={e => setForm(prev => ({ ...prev, firm_type: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }}>
                  <option value="" style={{ color: '#111' }}>firm type * required</option>
                  <option value="architecture" style={{ color: '#111' }}>architecture</option>
                  <option value="engineering" style={{ color: '#111' }}>engineering</option>
                  <option value="owners rep/pm" style={{ color: '#111' }}>owners rep/pm</option>
                  <option value="construction manager" style={{ color: '#111' }}>construction manager</option>
                  <option value="integrated aec" style={{ color: '#111' }}>integrated aec</option>
                  <option value="other" style={{ color: '#111' }}>other</option>
                </select>
                <input className="proposal-control" value={form.primary_office_location} onChange={e => setForm(prev => ({ ...prev, primary_office_location: e.target.value }))} placeholder="primary office location * required" disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                <select className="proposal-control" value={form.worked_with_studio_before} onChange={e => setForm(prev => ({ ...prev, worked_with_studio_before: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }}>
                  <option value="" style={{ color: '#111' }}>worked with studio 2.5 before? * required</option>
                  <option value="yes" style={{ color: '#111' }}>yes</option>
                  <option value="no" style={{ color: '#111' }}>no</option>
                </select>
                <select className="proposal-control" value={form.firm_role} onChange={e => setForm(prev => ({ ...prev, firm_role: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }}>
                  <option value="" style={{ color: '#111' }}>select firm role</option>
                  <option value="prime consultant" style={{ color: '#111' }}>prime consultant</option>
                  <option value="named sub-consultant" style={{ color: '#111' }}>named sub-consultant</option>
                  <option value="strategic advisor to prime" style={{ color: '#111' }}>strategic advisor to prime</option>
                </select>
                <select className="proposal-control" value={form.teaming_model} onChange={e => setForm(prev => ({ ...prev, teaming_model: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none', gridColumn: '1 / -1' }}>
                  <option value="" style={{ color: '#111' }}>select teaming model</option>
                  <option value="direct to owner" style={{ color: '#111' }}>direct to owner</option>
                  <option value="sub under prime" style={{ color: '#111' }}>sub under prime</option>
                  <option value="owner advisory alongside design team" style={{ color: '#111' }}>owner advisory alongside design team</option>
                </select>
              </div>
              <textarea
                value={form.firm_context}
                onChange={e => setForm(prev => ({ ...prev, firm_context: e.target.value }))}
                placeholder="firm context, differentiators, relevant experience"
                disabled={loading}
                rows={3}
                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Satoshi',sans-serif", background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: 12, fontSize: 13, lineHeight: 1.5, outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '0.5px solid rgba(255,255,255,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 8px', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#c8f486', letterSpacing: '0.04em' }}>02, the opportunity</p>
                <span style={{ fontSize: 10, fontWeight: 700, color: section2Missing === 0 ? '#7BC906' : 'rgba(255,255,255,0.6)' }}>
                  {section2Missing === 0 ? 'complete' : `missing ${section2Missing} required`}
                </span>
              </div>
              <div className="proposal-grid">
                <input className="proposal-control" value={form.rfp_project_title} onChange={e => setForm(prev => ({ ...prev, rfp_project_title: e.target.value }))} placeholder="rfp project title * required" disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none', gridColumn: '1 / -1' }} />
                <input className="proposal-control" value={form.client_name} onChange={e => setForm(prev => ({ ...prev, client_name: e.target.value }))} placeholder="client or asset owner * required" disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                <select className="proposal-control" value={form.project_phase} onChange={e => setForm(prev => ({ ...prev, project_phase: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }}>
                  <option value="" style={{ color: '#111' }}>project phase * required</option>
                  <option value="planning/feasibility" style={{ color: '#111' }}>planning/feasibility</option>
                  <option value="design development" style={{ color: '#111' }}>design development</option>
                  <option value="construction" style={{ color: '#111' }}>construction</option>
                  <option value="operations/maintenance" style={{ color: '#111' }}>operations/maintenance</option>
                  <option value="full lifecycle" style={{ color: '#111' }}>full lifecycle</option>
                </select>
                <select className="proposal-control" value={form.procurement_path} onChange={e => setForm(prev => ({ ...prev, procurement_path: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }}>
                  <option value="" style={{ color: '#111' }}>select procurement path</option>
                  <option value="rfp" style={{ color: '#111' }}>rfp</option>
                  <option value="rfq to rfp" style={{ color: '#111' }}>rfq to rfp</option>
                  <option value="sole source advisory" style={{ color: '#111' }}>sole source advisory</option>
                  <option value="on-call task order" style={{ color: '#111' }}>on-call task order</option>
                </select>
                <input className="proposal-control" type="date" value={form.submission_deadline} onChange={e => setForm(prev => ({ ...prev, submission_deadline: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                <input className="proposal-control" value={form.contract_value} onChange={e => setForm(prev => ({ ...prev, contract_value: e.target.value }))} placeholder="contract value" disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                <select className="proposal-control" value={form.innovation_component_called_out} onChange={e => setForm(prev => ({ ...prev, innovation_component_called_out: e.target.value }))} disabled={loading} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: '10px 12px', fontSize: 13, outline: 'none' }}>
                  <option value="" style={{ color: '#111' }}>explicit innovation or technology component in rfp?</option>
                  <option value="yes" style={{ color: '#111' }}>yes</option>
                  <option value="no" style={{ color: '#111' }}>no</option>
                  <option value="unknown" style={{ color: '#111' }}>unknown</option>
                </select>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>
                    upload rfp pdf, optional
                  </label>
                  <label
                    htmlFor="rfp-pdf-upload"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(111,159,37,0.14)', border: '0.5px solid rgba(111,159,37,0.6)', color: '#d7f0ad', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: (loading || uploadingPdf) ? 'default' : 'pointer' }}
                  >
                    {uploadingPdf ? 'uploading pdf...' : form.rfp_pdf_filename ? 'replace pdf' : 'upload pdf'}
                  </label>
                  <input
                    id="rfp-pdf-upload"
                    type="file"
                    accept="application/pdf"
                    disabled={loading || uploadingPdf}
                    onChange={e => handlePdfUpload(e.target.files?.[0] || null)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
                  />
                  <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.62)' }}>
                    {uploadingPdf
                      ? 'uploading pdf to blob...'
                      : form.rfp_pdf_filename
                        ? `uploaded: ${form.rfp_pdf_filename}`
                        : 'no pdf uploaded'}
                  </div>
                </div>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 10, letterSpacing: '0.09em', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>sector, multi-pick * required</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {sectorOptions.map(option => {
                  const active = form.sectors.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleSector(option)}
                      disabled={loading}
                      style={{
                        background: active ? 'rgba(123,201,6,0.18)' : 'rgba(255,255,255,0.03)',
                        border: active ? '1px solid #7BC906' : '0.5px solid rgba(255,255,255,0.18)',
                        color: active ? '#c8f486' : 'rgba(255,255,255,0.72)',
                        borderRadius: 999,
                        padding: '7px 11px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <textarea
                value={form.opportunity_summary}
                onChange={e => setForm(prev => ({ ...prev, opportunity_summary: e.target.value }))}
                placeholder="opportunity summary * required"
                disabled={loading}
                rows={4}
                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Satoshi',sans-serif", background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: 12, fontSize: 13, lineHeight: 1.5, outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 8px', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#c8f486', letterSpacing: '0.04em' }}>03, the ask</p>
              <span style={{ fontSize: 10, fontWeight: 700, color: section3Missing === 0 ? '#7BC906' : 'rgba(255,255,255,0.6)' }}>
                {section3Missing === 0 ? 'complete' : `${section3Missing} optional missing`}
              </span>
            </div>
            <p style={{ margin: '8px 0 8px', fontSize: 10, letterSpacing: '0.09em', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>contribution types</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {contributionOptions.map(option => {
                const active = form.contribution_types.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleContribution(option)}
                    disabled={loading}
                    style={{
                      background: active ? BRAND.lime : 'rgba(255,255,255,0.04)',
                      border: active ? `1px solid ${BRAND.lime}` : '0.5px solid rgba(255,255,255,0.2)',
                      color: active ? BRAND.ink : 'rgba(255,255,255,0.85)',
                      borderRadius: 999,
                      padding: '7px 11px',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      cursor: 'pointer'
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <p style={{ margin: '10px 0 8px', fontSize: 10, letterSpacing: '0.09em', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>fee range</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
              {feeBandOptions.map(option => {
                const active = form.fee_range === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, fee_range: option }))}
                    disabled={loading}
                    style={{
                      background: active ? 'rgba(123,201,6,0.18)' : 'rgba(255,255,255,0.03)',
                      border: active ? `1px solid ${BRAND.lime}` : '0.5px solid rgba(255,255,255,0.18)',
                      color: active ? '#c8f486' : 'rgba(255,255,255,0.72)',
                      borderRadius: 8,
                      padding: '9px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <p style={{ margin: '10px 0 8px', fontSize: 10, letterSpacing: '0.09em', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>requested outputs</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {requestedOutputOptions.map(option => {
                const active = form.requested_outputs.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleRequestedOutput(option)}
                    disabled={loading}
                    style={{
                      background: active ? 'rgba(123,201,6,0.18)' : 'rgba(255,255,255,0.03)',
                      border: active ? `1px solid ${BRAND.lime}` : '0.5px solid rgba(255,255,255,0.18)',
                      color: active ? '#c8f486' : 'rgba(255,255,255,0.72)',
                      borderRadius: 999,
                      padding: '7px 11px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <textarea
              value={form.constraints_or_context}
              onChange={e => setForm(prev => ({ ...prev, constraints_or_context: e.target.value }))}
              placeholder="constraints or context"
              disabled={loading}
              rows={4}
              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Satoshi',sans-serif", background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: 12, fontSize: 13, lineHeight: 1.6, outline: 'none', resize: 'vertical', marginBottom: 12 }}
            />

            <textarea
              value={form.specific_ask}
              onChange={e => setForm(prev => ({ ...prev, specific_ask: e.target.value }))}
              placeholder="specific ask, what you need the three-agent pack to produce"
              disabled={loading}
              rows={6}
              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Satoshi',sans-serif", background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.9)', padding: 12, fontSize: 13, lineHeight: 1.6, outline: 'none', resize: 'vertical', marginBottom: 12 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'rgba(123,201,6,0.48)', letterSpacing: '0.03em' }}>
                required fields must be complete before generate
              </span>
              <button
                onClick={onSubmit}
                disabled={loading || uploadingPdf || !isRequiredComplete}
                style={{ background: BRAND.lime, border: 'none', color: BRAND.ink, fontWeight: 800, fontSize: 13, borderRadius: 10, padding: '12px 18px', cursor: (loading || uploadingPdf || !isRequiredComplete) ? 'default' : 'pointer', opacity: (loading || uploadingPdf || !isRequiredComplete) ? 0.4 : 1 }}
              >
                {loading ? 'generating...' : 'generate proposal pack'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
