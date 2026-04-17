import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ADVISOR_SYSTEM_PROMPT } from '@/lib/config'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function tavilySearch(query: string): Promise<string> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 10,
      include_answer: true,
      exclude_domains: ['twitter.com', 'reddit.com', 'linkedin.com', 'facebook.com'],
    }),
  })
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`)
  const data = await res.json()

  // Format results for Claude
  const formatted = (data.results || []).map((r: any, i: number) => (
    `[${i + 1}] ${r.title}\nURL: ${r.url}\nContent: ${r.content?.substring(0, 500) || ''}`
  )).join('\n\n')

  return `Search results for: "${query}"\n\n${formatted}`
}

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { question } = await request.json()
  if (!question?.trim()) {
    return NextResponse.json({ error: 'question required' }, { status: 400 })
  }

  try {
    // Search Tavily with the question
    const searchResults = await tavilySearch(question)

    // Ask Claude to synthesize
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: ADVISOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nReal-time search results:\n\n${searchResults}\n\nProvide a researched, evidence-based answer grounded in these search results. Include specific citations by referencing source numbers [1], [2] etc. End with a clear implication for infrastructure leaders.`,
        },
      ],
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract sources from search
    const sources = await tavilySearch(question).then(() => []).catch(() => [])

    return NextResponse.json({
      answer,
      question,
      sources: [], // sources are cited inline in the answer
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Query error:', error)
    return NextResponse.json(
      { error: error.message || 'query failed' },
      { status: 500 }
    )
  }
}
