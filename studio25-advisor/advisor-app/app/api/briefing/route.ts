import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SIGNAL_TOPICS, ADVISOR_SYSTEM_PROMPT } from '@/lib/config'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function tavilySearch(query: string) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 5,
      exclude_domains: ['twitter.com', 'reddit.com', 'linkedin.com', 'facebook.com'],
    }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.results || []
}

export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { topicId } = await request.json()
  const topic = SIGNAL_TOPICS.find(t => t.id === topicId)
  if (!topic) {
    return NextResponse.json({ error: 'topic not found' }, { status: 400 })
  }

  try {
    const results = await tavilySearch(topic.query)

    if (results.length === 0) {
      return NextResponse.json({ error: 'no results found' }, { status: 404 })
    }

    const formatted = results.map((r: any, i: number) => (
      `[${i + 1}] ${r.title}\nURL: ${r.url}\nContent: ${r.content?.substring(0, 400) || ''}`
    )).join('\n\n')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: ADVISOR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Produce a concise intelligence briefing on: ${topic.label}\n\nFocus area: ${topic.description}\n\nCurrent search results:\n\n${formatted}\n\nFormat the briefing as:\n1. the signal (what is happening right now — 2-3 sentences)\n2. why it matters (implication for infrastructure leaders — 2-3 sentences)\n3. what to watch (1-2 specific things to monitor)\n\nInclude source citations [1], [2] etc. Keep it tight and actionable.`,
        },
      ],
    })

    const briefing = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({
      topic: topic.label,
      briefing,
      sources: results.map((r: any) => ({ title: r.title, url: r.url })),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Briefing error:', error)
    return NextResponse.json(
      { error: error.message || 'briefing failed' },
      { status: 500 }
    )
  }
}
