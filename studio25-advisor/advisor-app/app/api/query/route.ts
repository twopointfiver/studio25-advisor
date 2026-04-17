import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ADVISOR_SYSTEM_PROMPT } from '@/lib/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function tavilySearch(query: string) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 10,
      include_answer: false,
      exclude_domains: ['twitter.com', 'reddit.com', 'linkedin.com', 'facebook.com'],
    }),
  })
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`)
  const data = await res.json()
  return data.results || []
}

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { question } = await request.json()
  if (!question?.trim()) return NextResponse.json({ error: 'question required' }, { status: 400 })

  try {
    const results = await tavilySearch(question)

    const formatted = results.map((r: any, i: number) =>
      `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content?.substring(0, 400) || ''}`
    ).join('\n\n')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: ADVISOR_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Question: ${question}\n\nReal-time search results:\n\n${formatted}\n\nProvide a researched, structured answer using markdown headings and bold for key points. Cite sources inline using [1], [2] etc. End with a clear implication for infrastructure leaders.`,
      }],
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : ''
    const sources = results.map((r: any) => ({ title: r.title, url: r.url }))

    return NextResponse.json({ answer, question, sources, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'query failed' }, { status: 500 })
  }
}
