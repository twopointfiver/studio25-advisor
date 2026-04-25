/**
 * Splits agent narrative_scope output into contribution narrative and scope of work.
 * Expected markers: "CONTRIBUTION NARRATIVE" and "SCOPE OF WORK" (case-insensitive).
 */
export function splitNarrativeScope(raw: string): { narrative: string; scope: string } {
  const normalized = raw.replace(/\r\n/g, '\n').trim()
  if (!normalized) return { narrative: '', scope: '' }

  const scopeMatch = normalized.match(/^SCOPE OF WORK\s*$/im)
  if (scopeMatch && scopeMatch.index !== undefined) {
    const before = normalized.slice(0, scopeMatch.index).trim()
    const after = normalized.slice(scopeMatch.index + scopeMatch[0].length).trim()
    const narrative = before.replace(/^CONTRIBUTION NARRATIVE\s*/i, '').trim()
    return { narrative, scope: after }
  }

  return { narrative: normalized.replace(/^CONTRIBUTION NARRATIVE\s*/i, '').trim(), scope: '' }
}
