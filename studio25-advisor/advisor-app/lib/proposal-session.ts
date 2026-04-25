export const PROPOSAL_SESSION_KEY = 'studio25_proposal_output_v1'

export type ProposalSessionPayload = {
  version: 1
  firm_name: string
  rfp_project_title: string
  intakeForm: Record<string, unknown>
  analyst_brief: Record<string, unknown>
  narrative_scope: string
  commercial_terms: string
  timestamp: string
}
