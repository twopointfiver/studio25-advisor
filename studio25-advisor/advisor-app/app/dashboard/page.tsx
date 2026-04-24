'use client'
import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { SIGNAL_TOPICS, SUGGESTED_QUESTIONS } from '@/lib/config'

const CALENDLY = 'https://calendly.com/jeffrey-l-walter-studio25/jeff-walter-studio-2-5-connect?primary_color=6f9f25'
const LOGO = 'https://studio25assets.pages.dev/studio25-logo.png'

type Mode = 'query' | 'briefing'
type LoadingState = 'idle' | 'searching' | 'synthesizing' | 'done'

interface Source { title: string; url: string }
interface Result {
  type: 'query' | 'briefing'
  question?: string
  topic?: string
  answer?: string
  briefing?: string
  sources?: Source[]
  timestamp: string
}

function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  let html = ''
  let inList = false
  for (const line of lines) {
    if (/^\s*$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false }
      continue
    }
    if (/^### (.+)$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h3 class="md-h3">${line.replace(/^### /, '')}</h3>`
    } else if (/^## (.+)$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h2 class="md-h2">${line.replace(/^## /, '')}</h2>`
    } else if (/^# (.+)$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false }
      html += `<h1 class="md-h1">${line.replace(/^# /, '')}</h1>`
    } else if (/^---$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false }
      html += '<hr class="md-hr"/>'
    } else if (/^[*-] (.+)$/.test(line)) {
      if (!inList) { html += '<ul class="md-ul">'; inList = true }
      html += `<li class="md-li">${line.replace(/^[*-] /, '')}</li>`
    } else if (/^\d+\. (.+)$/.test(line)) {
      if (!inList) { html += '<ul class="md-ul">'; inList = true }
      html += `<li class="md-li">${line.replace(/^\d+\. /, '')}</li>`
    } else {
      if (inList) { html += '</ul>'; inList = false }
      let l = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(\d+)\]/g, '<cite class="md-cite">[$1]</cite>')
      html += `<p class="md-p">${l}</p>`
    }
  }
  if (inList) html += '</ul>'
  return html
}

function SourceCard({ source }: { source: Source }) {
  let domain = ''
  try { domain = new URL(source.url).hostname.replace('www.', '') } catch {}
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer"
      style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 14px',background:'rgba(255,255,255,0.95)',border:'0.5px solid rgba(255,255,255,0.3)',borderRadius:10,textDecoration:'none',transition:'all 0.15s'}}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='#ffffff'; el.style.transform='translateY(-1px)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.95)'; el.style.transform='translateY(0)' }}>
      <img src={faviconUrl} alt={domain} width={16} height={16} style={{marginTop:2,flexShrink:0,borderRadius:3,opacity:0.85}} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'#446b1a',letterSpacing:'0.03em',marginBottom:2}}>{domain}</div>
        <div style={{fontSize:12,fontWeight:600,color:'#0e1209',lineHeight:1.4}}>{source.title}</div>
      </div>
      <div style={{color:'#6f9f25',fontSize:13,flexShrink:0,marginTop:1}}>→</div>
    </a>
  )
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
    setError(''); setResult(null); setLoadingState('searching')
    setTimeout(() => setLoadingState('synthesizing'), 2500)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({question})
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ type: 'query', ...data })
    } catch (e: any) {
      setError(e.message || 'query failed')
    } finally {
      setLoadingState('done'); setTimeout(() => setLoadingState('idle'), 300)
    }
  }

  async function submitBriefing(topicId: string) {
    if (loadingState !== 'idle') return
    setError(''); setResult(null); setActiveTopic(topicId); setLoadingState('searching')
    setTimeout(() => setLoadingState('synthesizing'), 2500)
    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({topicId})
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ type: 'briefing', ...data })
    } catch (e: any) {
      setError(e.message || 'briefing failed')
    } finally {
      setLoadingState('done'); setActiveTopic(null); setTimeout(() => setLoadingState('idle'), 300)
    }
  }

  const isLoading = loadingState === 'searching' || loadingState === 'synthesizing'
  const bodyText = result?.answer || result?.briefing || ''

  return (
    <div style={{minHeight:'100vh',background:'#121f04',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hedvig+Letters+Serif:opsz@12..24&display=swap');
        * { box-sizing: border-box; }
        .md-h1{font-size:1.15rem;font-weight:700;color:#121f04;margin:1.3rem 0 0.4rem}
        .md-h2{font-size:1rem;font-weight:700;color:#121f04;margin:1.1rem 0 0.3rem;border-bottom:1px solid rgba(68,107,26,0.15);padding-bottom:4px}
        .md-h3{font-size:0.875rem;font-weight:700;color:#446b1a;margin:0.9rem 0 0.25rem}
        .md-p{margin-bottom:0.8rem;line-height:1.85;font-size:0.875rem;color:#0e1209}
        .md-ul{margin:0.4rem 0 0.6rem 1.1rem}
        .md-li{margin-bottom:0.25rem;font-size:0.875rem;line-height:1.75;color:#0e1209}
        .md-hr{border:none;border-top:1px solid rgba(68,107,26,0.18);margin:1.1rem 0}
        .md-cite{color:#6f9f25;font-size:0.68rem;font-weight:700;vertical-align:super;font-style:normal}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.6)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .q-card:hover{background:rgba(255,255,255,0.97)!important;transform:translateY(-1px)}
        .topic-card:hover{background:rgba(255,255,255,0.12)!important;border-color:rgba(255,255,255,0.35)!important}
        .nav-pill{transition:all 0.15s}
        .nav-pill:hover{background:rgba(255,255,255,0.15)!important}
        .nav-pill.active{background:#ffffff!important;color:#000000!important;border-color:#ffffff!important}
      `}</style>

      {/* LOADING BANNER */}
      {isLoading && (
        <div style={{position:'fixed',top:52,left:0,right:0,zIndex:40,background:'#000000',borderBottom:'2px solid #7BC906',padding:'12px 24px',display:'flex',alignItems:'center',gap:12,animation:'fadeIn 0.2s ease'}}>
          <div style={{width:16,height:16,border:'2px solid rgba(123,201,6,0.2)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}}/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'#ffffff'}}>{loadingState==='searching'?'searching current sources...':'synthesizing intelligence...'}</div>
            <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'rgba(123,201,6,0.5)',marginTop:1}}>{loadingState==='searching'?'tavily retrieving real-time results':'claude synthesizing findings'}</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:4}}>
            {[0,1,2].map(i => <div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#7BC906',animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav style={{
        position:'sticky',top:0,zIndex:50,
        background:'#000000',
        height:52,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 28px',
      }}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <img src={LOGO} style={{height:28,display:'block'}} alt="studio 2.5"/>
        </div>

        {/* Center pills */}
        <div style={{display:'flex',gap:8}}>
          {(['query','briefing'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setQuestion('') }}
              className={`nav-pill${mode===m?' active':''}`}
              style={{
                background:'transparent',
                border:'1.5px solid rgba(255,255,255,0.6)',
                color:'#ffffff',
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontSize:12,fontWeight:700,
                padding:'7px 20px',
                borderRadius:999,
                cursor:'pointer',
                letterSpacing:'0.02em',
              }}>
              {m==='query'?'strategic q&a':'signals briefings'}
            </button>
          ))}
        </div>

        {/* Right: back link */}
        <a href="https://studio25.xyz" style={{display:'flex',alignItems:'center',gap:6,color:'#7BC906',fontSize:12,fontWeight:700,textDecoration:'none',letterSpacing:'0.04em'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 12H9M12 9l-3 3 3 3"/>
          </svg>
          studio 2.5.xyz
        </a>
      </nav>

      {/* ── HERO (sticky) ── */}
      <div style={{
        position:'sticky',top:52,zIndex:30,
        height:340,
        overflow:'hidden',
      }}>
        {/* BG photo */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:'url(https://studio25assets.pages.dev/studio25-web-banner.jpg)',
          backgroundSize:'cover',
          backgroundPosition:'center 35%',
          filter:'brightness(0.82) saturate(1.1)',
        }}/>
        {/* bottom fade into content section */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:100,background:'linear-gradient(to bottom,transparent,#1a3a08)',pointerEvents:'none'}}/>

        {/* Left: label + wordmark */}
        <div style={{position:'absolute',bottom:48,left:44}}>
          <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontStyle:'italic',fontSize:15,color:'rgba(255,255,255,0.9)',marginBottom:8,letterSpacing:'0.01em'}}>
            a new type of design company.
          </div>
          <img src={LOGO} style={{height:56,display:'block'}} alt="studio 2.5"/>
        </div>

        {/* Right: CTA card */}
        <div style={{
          position:'absolute',right:44,top:'50%',transform:'translateY(-50%)',
          background:'rgba(0,0,0,0.82)',
          borderRadius:20,
          padding:'22px 24px',
          width:280,
          display:'flex',flexDirection:'column',gap:14,
          backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.1)',
        }}>
          <button
            onClick={() => { setMode('query'); setResult(null) }}
            style={{
              width:52,height:52,
              borderRadius:14,
              border:'2px solid #ffffff',
              background:'transparent',
              display:'flex',alignItems:'center',justifyContent:'center',
              cursor:'pointer',
              transition:'background 0.15s',
              flexShrink:0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.12)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.65,margin:0}}>
            connect with the studio to find out how to turn these insights into actionable innovation outcomes.
          </p>
        </div>
      </div>

      {/* ── SCROLL CONTENT ── */}
      <div style={{
        position:'relative',zIndex:50,
        background:'linear-gradient(160deg, #1a3a08 0%, #2d6b0a 40%, #7BC906 100%)',
        minHeight:'100vh',
        padding:'48px 0 80px',
      }}>

        {/* ── HOME VIEW (query mode, no result yet, show landing) ── */}
        {mode==='query' && !result && (
          <div style={{maxWidth:680,margin:'0 auto',padding:'0 24px'}}>

            {/* Query input block */}
            <div style={{
              background:'#000000',
              borderRadius:16,
              padding:'24px 24px 20px',
              marginBottom:28,
            }}>
              <div style={{display:'flex',gap:12,alignItems:'flex-end'}}>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitQuery()} }}
                  placeholder="ask a question about world models and AI transformation."
                  disabled={isLoading}
                  rows={2}
                  style={{
                    flex:1,
                    background:'transparent',border:'none',outline:'none',
                    color:'rgba(255,255,255,0.85)',
                    fontFamily:"'Hedvig Letters Serif',serif",
                    fontSize:15,lineHeight:1.6,
                    resize:'none',
                    boxSizing:'border-box' as const,
                  }}
                />
                <button
                  onClick={submitQuery}
                  disabled={isLoading||!question.trim()}
                  style={{
                    flexShrink:0,
                    background:'transparent',
                    border:'2px solid #ffffff',
                    color:'#ffffff',
                    fontFamily:"'Plus Jakarta Sans',sans-serif",
                    fontSize:13,fontWeight:800,
                    padding:'10px 20px',
                    borderRadius:10,
                    cursor:'pointer',
                    display:'flex',alignItems:'center',gap:8,
                    opacity:(!question.trim()||isLoading)?0.4:1,
                    transition:'all 0.15s',
                    letterSpacing:'0.03em',
                  }}
                  onMouseEnter={e => { if(question.trim()&&!isLoading)(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
                >
                  research
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Suggested questions */}
            <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'lowercase',marginBottom:12}}>
              suggested questions
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {SUGGESTED_QUESTIONS.map((q,i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(q); submitQuery() }}
                  className="q-card"
                  style={{
                    textAlign:'left',
                    background:'rgba(255,255,255,0.9)',
                    border:'none',
                    borderRadius:10,
                    padding:'14px 18px',
                    cursor:'pointer',
                    fontFamily:"'Hedvig Letters Serif',serif",
                    fontSize:13,color:'#0e1209',lineHeight:1.55,
                    transition:'all 0.15s',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── BRIEFING MODE ── */}
        {mode==='briefing' && !result && (
          <div style={{maxWidth:680,margin:'0 auto',padding:'0 24px'}}>
            <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'lowercase',marginBottom:16}}>
              signal areas
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {SIGNAL_TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => submitBriefing(topic.id)}
                  disabled={isLoading}
                  className="topic-card"
                  style={{
                    display:'flex',alignItems:'center',gap:14,
                    background:'rgba(0,0,0,0.35)',
                    border:'1px solid rgba(255,255,255,0.15)',
                    borderRadius:12,
                    padding:'16px 18px',
                    cursor:'pointer',textAlign:'left',width:'100%',
                    transition:'all 0.15s',
                    opacity:isLoading?0.6:1,
                  }}
                >
                  <span style={{fontSize:22,flexShrink:0}}>{topic.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:'#ffffff',marginBottom:3,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{topic.label}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',fontFamily:"'Hedvig Letters Serif',serif",lineHeight:1.5}}>{topic.description}</div>
                  </div>
                  {activeTopic===topic.id&&isLoading
                    ? <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}}/>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  }
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div style={{maxWidth:680,margin:'0 auto 16px',padding:'0 24px'}}>
            <div style={{background:'rgba(185,28,28,0.15)',border:'1px solid rgba(185,28,28,0.4)',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#fca5a5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              {error}
              <button onClick={()=>setError('')} style={{background:'none',border:'none',color:'#fca5a5',cursor:'pointer',fontWeight:700,fontSize:12}}>dismiss</button>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {result && !isLoading && (
          <div style={{maxWidth:680,margin:'0 auto',padding:'0 24px',animation:'fadeIn 0.3s ease'}}>

            {/* Question header */}
            <div style={{
              background:'#000000',
              borderRadius:14,
              padding:'20px 22px',
              marginBottom:8,
              display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,
            }}>
              <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:15,color:'rgba(255,255,255,0.9)',lineHeight:1.45,flex:1}}>
                {result.question||result.topic}
              </div>
              <img src={LOGO} style={{height:22,flexShrink:0,marginTop:2}} alt="studio 2.5"/>
            </div>

            {/* Answer */}
            <div style={{
              background:'#ffffff',
              borderRadius:14,
              padding:'26px 28px',
              marginBottom:8,
            }}>
              <div dangerouslySetInnerHTML={{__html:renderMarkdown(bodyText)}}/>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div style={{background:'rgba(0,0,0,0.3)',borderRadius:14,padding:'16px 18px',marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.4)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>
                  sources · {result.sources.length} retrieved
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {result.sources.map((s,i) => <SourceCard key={i} source={s}/>)}
                </div>
              </div>
            )}

            {/* Calendly CTA */}
            <div style={{
              display:'flex',
              borderRadius:14,
              overflow:'hidden',
              marginBottom:16,
            }}>
              <div style={{flex:1,background:'#000000',padding:'20px 22px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.9)',marginBottom:6,lineHeight:1.3}}>
                  ready to turn this into a deliverable?
                </div>
                <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(255,255,255,0.5)',lineHeight:1.6}}>
                  studio 2.5 converts intelligence into scoped advisory outcomes, research reports, business cases, gap analyses, and transformation roadmaps, in 1 to 2 weeks.
                </div>
              </div>
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink:0,width:180,
                  background:'#ffffff',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:14,fontWeight:800,
                  color:'#000000',textDecoration:'none',
                  textAlign:'center',
                  padding:'0 16px',
                  lineHeight:1.3,
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='#f0f0f0'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='#ffffff'}
              >
                book a free conversation
              </a>
            </div>

            {/* New question button */}
            <button
              onClick={() => { setResult(null); setQuestion('') }}
              style={{
                fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.6)',
                background:'rgba(0,0,0,0.3)',
                border:'1px solid rgba(255,255,255,0.15)',
                borderRadius:999,padding:'7px 18px',
                cursor:'pointer',
                fontFamily:"'Plus Jakarta Sans',sans-serif",
                transition:'all 0.15s',
              }}
            >
              ← new {mode==='query'?'question':'briefing'}
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background:'#000000',
        padding:'20px 28px',
        borderTop:'0.5px solid rgba(123,201,6,0.12)',
        display:'flex',alignItems:'center',justifyContent:'space-between',
      }}>
        <img src={LOGO} style={{height:24,opacity:0.35}} alt="studio 2.5"/>
        <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'rgba(255,255,255,0.18)'}}>
          © 2026 studio 2.5 · advisor.studio25.xyz
        </span>
        <a href="https://studio25.xyz" style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'rgba(123,201,6,0.35)',textDecoration:'none'}}>
          studio25.xyz →
        </a>
      </div>
    </div>
  )
}
