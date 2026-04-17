'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { SIGNAL_TOPICS, SUGGESTED_QUESTIONS } from '@/lib/config'

type Mode = 'query' | 'briefing'
type LoadingState = 'idle' | 'searching' | 'synthesizing' | 'done'

interface Result {
  type: 'query' | 'briefing'
  question?: string
  topic?: string
  answer?: string
  briefing?: string
  sources?: { title: string; url: string }[]
  timestamp: string
}

export default function Dashboard() {
  const [mode, setMode] = useState<Mode>('query')
  const [question, setQuestion] = useState('')
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [activeTopic, setActiveTopic] = useState<string | null>(null)

  async function submitQuery() {
    if (!question.trim() || loadingState !== 'idle') return
    setError('')
    setResult(null)
    setLoadingState('searching')

    setTimeout(() => setLoadingState('synthesizing'), 2000)

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ type: 'query', ...data })
    } catch (e: any) {
      setError(e.message || 'query failed')
    } finally {
      setLoadingState('done')
      setTimeout(() => setLoadingState('idle'), 500)
    }
  }

  async function submitBriefing(topicId: string) {
    if (loadingState !== 'idle') return
    setError('')
    setResult(null)
    setActiveTopic(topicId)
    setLoadingState('searching')
    setTimeout(() => setLoadingState('synthesizing'), 2000)

    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ type: 'briefing', ...data })
    } catch (e: any) {
      setError(e.message || 'briefing failed')
    } finally {
      setLoadingState('done')
      setActiveTopic(null)
      setTimeout(() => setLoadingState('idle'), 500)
    }
  }

  const isLoading = loadingState === 'searching' || loadingState === 'synthesizing'

  return (
    <div className="min-h-screen bg-[#f8faf3]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-black/97 backdrop-blur border-b border-[#7BC906]/15 h-13 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="https://studio25assets.pages.dev/studio25-logo.png" className="h-8 opacity-90" alt="studio 2.5" />
            <span className="text-white/40 text-sm" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>advisor</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
            <button
              onClick={() => { setMode('query'); setResult(null) }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'query' ? 'bg-[#7BC906] text-[#121f04]' : 'text-white/50 hover:text-white'}`}
            >
              strategic Q&A
            </button>
            <button
              onClick={() => { setMode('briefing'); setResult(null) }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'briefing' ? 'bg-[#7BC906] text-[#121f04]' : 'text-white/50 hover:text-white'}`}
            >
              signal briefings
            </button>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://studio25.xyz" className="text-xs text-white/40 hover:text-white/60 transition-colors hidden md:block" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
              ← studio25.xyz
            </a>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="w-full max-w-4xl mx-auto px-6 py-10">

        {/* ── QUERY MODE ── */}
        {mode === 'query' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#121f04] mb-2">strategic Q&A</h1>
              <p className="text-sm text-[#446b1a]" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                ask any question about infrastructure AI transformation. answers are grounded in real-time research.
              </p>
            </div>

            {/* INPUT */}
            <div className="bg-white border border-[#446b1a]/20 rounded-xl p-1 mb-4 shadow-sm">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuery() } }}
                placeholder="ask a question about infrastructure AI transformation..."
                className="w-full px-4 pt-4 pb-2 text-sm text-[#0e1209] bg-transparent outline-none resize-none leading-relaxed placeholder:text-[#446b1a]/40"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <span className="text-xs text-[#446b1a]/50" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                  shift+enter for new line · enter to submit
                </span>
                <button
                  onClick={submitQuery}
                  disabled={isLoading || !question.trim()}
                  className="bg-[#7BC906] text-[#121f04] text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? '...' : 'research →'}
                </button>
              </div>
            </div>

            {/* SUGGESTED QUESTIONS */}
            {!result && !isLoading && (
              <div>
                <div className="text-xs font-semibold text-[#446b1a]/60 mb-3 uppercase tracking-wider">
                  suggested questions
                </div>
                <div className="grid gap-2">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setQuestion(q)}
                      className="text-left text-sm text-[#0e1209] bg-white border border-[#446b1a]/15 rounded-lg px-4 py-3 hover:border-[#7BC906]/40 hover:bg-[#f4f7ed] transition-all"
                      style={{fontFamily: 'Hedvig Letters Serif, serif'}}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── BRIEFING MODE ── */}
        {mode === 'briefing' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#121f04] mb-2">signal briefings</h1>
              <p className="text-sm text-[#446b1a]" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                select a signal area to receive a concise intelligence briefing grounded in current research.
              </p>
            </div>

            {!result && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SIGNAL_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => submitBriefing(topic.id)}
                    disabled={isLoading}
                    className={`flex items-center gap-3 p-4 bg-white border rounded-xl text-left transition-all hover:border-[#7BC906]/40 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${activeTopic === topic.id ? 'border-[#7BC906] bg-[#f4f7ed]' : 'border-[#446b1a]/20'}`}
                  >
                    <span className="text-2xl flex-shrink-0">{topic.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-[#0e1209]">{topic.label}</div>
                      <div className="text-xs text-[#446b1a]/70 mt-0.5" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                        {topic.description}
                      </div>
                    </div>
                    {activeTopic === topic.id && isLoading && (
                      <div className="ml-auto w-4 h-4 border-2 border-[#7BC906]/30 border-t-[#7BC906] rounded-full animate-spin flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── LOADING STATE ── */}
        {isLoading && (
          <div className="mt-8 bg-white border border-[#446b1a]/20 rounded-xl p-8 flex items-center gap-4">
            <div className="w-5 h-5 border-2 border-[#7BC906]/30 border-t-[#7BC906] rounded-full animate-spin flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#0e1209]">
                {loadingState === 'searching' ? 'searching current sources...' : 'synthesizing intelligence...'}
              </div>
              <div className="text-xs text-[#446b1a]/60 mt-1" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                {loadingState === 'searching' ? 'tavily is retrieving real-time results from across the web' : 'claude is synthesizing findings into a structured response'}
              </div>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-3 text-red-500 hover:text-red-700 font-semibold">dismiss</button>
          </div>
        )}

        {/* ── RESULT ── */}
        {result && !isLoading && (
          <div className="mt-8">
            {/* Result header */}
            <div className="bg-[#121f04] rounded-xl p-6 mb-1 border border-[#7BC906]/20">
              <div className="text-xs text-[#7BC906]/60 mb-2" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                {result.type === 'query' ? 'strategic advisory response' : 'signal intelligence briefing'} · studio 2.5 advisor
              </div>
              <div className="text-lg font-bold text-white leading-tight">
                {result.question || result.topic}
              </div>
              <div className="text-xs text-[#7BC906]/40 mt-2" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                {new Date(result.timestamp).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Result body */}
            <div className="bg-white border border-[#446b1a]/15 rounded-xl p-8">
              <div
                className="answer-content text-sm text-[#0e1209] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: (result.answer || result.briefing || '')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>')
                }}
              />
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="bg-[#f8faf3] border border-[#446b1a]/15 rounded-xl p-5 mt-1">
                <div className="text-xs font-semibold text-[#446b1a]/60 uppercase tracking-wider mb-3">sources</div>
                <div className="flex flex-col gap-2">
                  {result.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-xs text-[#446b1a] hover:text-[#7BC906] transition-colors group"
                    >
                      <span className="text-[#7BC906]/50 flex-shrink-0 font-semibold">[{i + 1}]</span>
                      <span className="group-hover:underline leading-relaxed" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* New query button */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setResult(null); setQuestion('') }}
                className="text-xs font-semibold text-[#446b1a] border border-[#446b1a]/30 rounded-full px-4 py-2 hover:border-[#7BC906]/50 hover:text-[#6f9f25] transition-all"
              >
                ← new {mode === 'query' ? 'question' : 'briefing'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
