'use client'
import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { SIGNAL_TOPICS, SUGGESTED_QUESTIONS } from '@/lib/config'

const CALENDLY = 'https://calendly.com/jeffrey-l-walter-studio25/jeff-walter-studio-2-5-connect?primary_color=6f9f25&month=2026-04'
const LOGO = '/studio25-logo.png'
const BANNER = '/studio25-banner.jpg'

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
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer"
      style={{display:'flex',alignItems:'flex-start',gap:10,padding:'12px 16px',background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:8,textDecoration:'none',transition:'all 0.15s'}}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(123,201,6,0.5)'; el.style.background='rgba(255,255,255,0.07)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(255,255,255,0.1)'; el.style.background='rgba(255,255,255,0.04)' }}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'rgba(123,201,6,0.6)',letterSpacing:'0.03em',marginBottom:2}}>{domain}</div>
        <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.8)',lineHeight:1.4}}>{source.title}</div>
      </div>
      <div style={{color:'#7BC906',fontSize:14,flexShrink:0,marginTop:1}}>→</div>
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

  async function submitQuery(q?: string) {
    const text = q || question
    if (!text.trim() || loadingState !== 'idle') return
    if (q) setQuestion(q)
    setError(''); setResult(null); setLoadingState('searching')
    setTimeout(() => setLoadingState('synthesizing'), 2500)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({question: text})
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
    <div style={{minHeight:'100vh',background:'#000000',color:'#ffffff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hedvig+Letters+Serif:opsz@12..24&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .md-h1{font-size:1.15rem;font-weight:700;color:#121f04;margin:1.3rem 0 0.4rem}
        .md-h2{font-size:1rem;font-weight:700;color:#121f04;margin:1.1rem 0 0.3rem;border-bottom:1px solid rgba(68,107,26,0.15);padding-bottom:4px}
        .md-h3{font-size:0.875rem;font-weight:700;color:#446b1a;margin:0.9rem 0 0.25rem}
        .md-p{margin-bottom:0.8rem;line-height:1.85;font-size:0.9rem;color:#0e1209}
        .md-ul{margin:0.4rem 0 0.6rem 1.1rem}
        .md-li{margin-bottom:0.25rem;font-size:0.9rem;line-height:1.75;color:#0e1209}
        .md-hr{border:none;border-top:1px solid rgba(68,107,26,0.18);margin:1.1rem 0}
        .md-cite{color:#6f9f25;font-size:0.68rem;font-weight:700;vertical-align:super;font-style:normal}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.6)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(123,201,6,0.4)}50%{box-shadow:0 0 40px rgba(123,201,6,0.8)}}
        .q-card:hover{background:rgba(255,255,255,0.07)!important;border-color:rgba(123,201,6,0.4)!important;transform:translateX(4px)}
        .topic-card:hover{background:rgba(123,201,6,0.08)!important;border-color:rgba(123,201,6,0.4)!important}
        .nav-pill{transition:all 0.15s;cursor:pointer;appearance:none;-webkit-appearance:none}
        .nav-pill:hover{background:rgba(255,255,255,0.1)!important}
        .nav-pill.active{background:#ffffff!important;color:#000000!important;border-color:#ffffff!important}
        .cta-book:hover{background:#8bda07!important;transform:scale(1.02)}
        .connect-btn:hover{background:rgba(123,201,6,0.15)!important}
        button{-webkit-appearance:none;appearance:none}
        button:focus{outline:none}
        .research-btn:hover:not([disabled]){background:#8bda07!important}
        .research-btn:focus{outline:none}
      `}</style>

      {isLoading && (
        <div style={{position:'fixed',top:64,left:0,right:0,zIndex:40,background:'#0a0a0a',borderBottom:'1.5px solid #7BC906',padding:'12px 32px',display:'flex',alignItems:'center',gap:14,animation:'fadeIn 0.2s ease'}}>
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

      {/* NAV — logo uses width not height to handle wide PNG */}
      <nav style={{
        position:'sticky',top:0,zIndex:50,
        background:'#000000',
        borderBottom:'0.5px solid rgba(255,255,255,0.08)',
        height:64,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'0 40px',
      }}>
        <img src={LOGO} style={{width:200,height:'auto',display:'block'}} alt="studio 2.5"/>
        <div style={{display:'flex',gap:8}}>
          {(['query','briefing'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setQuestion('') }}
              className={`nav-pill${mode===m?' active':''}`}
              style={{background:'transparent',border:'1.5px solid rgba(255,255,255,0.45)',color:'#ffffff',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,fontWeight:700,padding:'8px 24px',borderRadius:999}}>
              {m==='query'?'strategic q&a':'signals briefings'}
            </button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <a href="https://studio25.xyz" style={{display:'flex',alignItems:'center',gap:6,color:'#7BC906',fontSize:12,fontWeight:700,textDecoration:'none',letterSpacing:'0.03em'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 12H9M12 9l-3 3 3 3"/></svg>
            studio 2.5.xyz
          </a>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </nav>

      {/* HERO — sticky, tall enough to show CTA card, banner at top so grass shows fully */}
      <div style={{
        position:'sticky',top:64,zIndex:30,
        height:480,
        overflow:'hidden',
        background:'#000000',
      }}>
        {/* backgroundPosition: center top shows the grass crown, not cuts it */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:`url(${BANNER})`,
          backgroundSize:'cover',
          backgroundPosition:'center top',
          filter:'brightness(0.72) saturate(1.15)',
        }}/>
        {/* Fade to black at bottom */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:180,background:'linear-gradient(to bottom,transparent,#000000)',pointerEvents:'none'}}/>
        {/* Subtle left darken for text */}
        <div style={{position:'absolute',top:0,left:0,bottom:0,width:'50%',background:'linear-gradient(to right,rgba(0,0,0,0.45),transparent)',pointerEvents:'none'}}/>

        {/* Left: label + wordmark — uses width for wide PNG */}
        <div style={{position:'absolute',bottom:72,left:48}}>
          <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontStyle:'italic',fontSize:18,color:'rgba(255,255,255,0.85)',marginBottom:20,letterSpacing:'0.01em'}}>
            a new type of design company.
          </div>
          {/* width:420px renders the wide logo at proper readable scale */}
          <img src={LOGO} style={{width:420,height:'auto',display:'block'}} alt="studio 2.5"/>
        </div>

        {/* Right: CTA card with Calendly link — properly positioned */}
        <div style={{
          position:'absolute',
          right:48,
          top:40,
          background:'rgba(0,0,0,0.88)',
          borderRadius:20,
          padding:'28px 28px 24px',
          width:300,
          display:'flex',flexDirection:'column',gap:18,
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.15)',
        }}>
          {/* Arrow button — links to Calendly */}
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="connect-btn"
            style={{
              width:58,height:58,
              borderRadius:14,
              border:'2px solid #7BC906',
              background:'rgba(123,201,6,0.1)',
              display:'flex',alignItems:'center',justifyContent:'center',
              cursor:'pointer',
              transition:'all 0.15s',
              flexShrink:0,
              textDecoration:'none',
              animation:'glow 3s ease-in-out infinite',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7BC906" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:13,color:'rgba(255,255,255,0.78)',lineHeight:1.7,margin:0}}>
            connect with the studio to find out how to turn these insights into actionable innovation outcomes.
          </p>
          {/* Explicit book button */}
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-book"
            style={{
              display:'block',
              background:'#7BC906',
              color:'#121f04',
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:13,fontWeight:800,
              padding:'12px 16px',
              borderRadius:10,
              textDecoration:'none',
              textAlign:'center' as const,
              letterSpacing:'0.03em',
              transition:'all 0.15s',
            }}
          >
            book a free conversation →
          </a>
        </div>
      </div>

      {/* SCROLL CONTENT */}
      <div style={{position:'relative',zIndex:50,background:'#000000',minHeight:'100vh',padding:'48px 0 80px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 48px'}}>

          {mode==='query' && !result && (
            <>
              {/* Question box — dark with vivid green accents, not muddy green */}
              <div style={{
                background:'rgba(18,31,4,0.95)',
                border:'1.5px solid #7BC906',
                borderRadius:16,
                padding:'28px 32px 22px',
                marginBottom:32,
                boxShadow:'0 0 0 1px rgba(123,201,6,0.1), 0 8px 40px rgba(0,0,0,0.6)',
              }}>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitQuery()} }}
                  placeholder="ask a question about world models and AI transformation."
                  disabled={isLoading}
                  rows={3}
                  style={{
                    width:'100%',
                    background:'transparent',border:'none',outline:'none',
                    color:'#ffffff',
                    caretColor:'#7BC906',
                    fontFamily:"'Plus Jakarta Sans',sans-serif",
                    fontSize:18,lineHeight:1.7,
                    resize:'none',
                    marginBottom:20,
                    display:'block',
                  }}
                />
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.4)',letterSpacing:'0.06em'}}>
                    enter to research · shift+enter for new line
                  </span>
                  <button
                    onClick={() => submitQuery()}
                    disabled={isLoading||!question.trim()}
                    className="research-btn"
                    style={{
                      background:'#7BC906',
                      border:'none',
                      color:'#121f04',
                      fontFamily:"'Plus Jakarta Sans',sans-serif",
                      fontSize:15,fontWeight:800,
                      padding:'13px 48px',
                      borderRadius:10,
                      display:'flex',alignItems:'center',gap:10,
                      opacity:(!question.trim()||isLoading)?0.4:1,
                      transition:'all 0.15s',
                      letterSpacing:'0.04em',
                      cursor:'pointer',
                    }}
                  >
                    research
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>

              <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.25)',letterSpacing:'0.14em',textTransform:'lowercase',marginBottom:16}}>suggested questions</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {SUGGESTED_QUESTIONS.map((q,i) => (
                  <button key={i} onClick={() => submitQuery(q)} className="q-card"
                    style={{
                      textAlign:'left',
                      background:'rgba(255,255,255,0.03)',
                      border:'0.5px solid rgba(255,255,255,0.1)',
                      borderRadius:10,
                      padding:'15px 24px',
                      cursor:'pointer',
                      fontFamily:"'Plus Jakarta Sans',sans-serif",
                      fontSize:15,fontWeight:400,
                      color:'rgba(255,255,255,0.7)',
                      lineHeight:1.55,
                      transition:'all 0.15s',
                      width:'100%',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode==='briefing' && !result && (
            <>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.25)',letterSpacing:'0.14em',textTransform:'lowercase',marginBottom:16}}>signal areas</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {SIGNAL_TOPICS.map(topic => (
                  <button key={topic.id} onClick={() => submitBriefing(topic.id)} disabled={isLoading} className="topic-card"
                    style={{display:'flex',alignItems:'center',gap:16,background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'16px 24px',cursor:'pointer',textAlign:'left',width:'100%',transition:'all 0.15s',opacity:isLoading?0.5:1,color:'#ffffff'}}>
                    <span style={{fontSize:22,flexShrink:0}}>{topic.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:600,color:'rgba(255,255,255,0.88)',marginBottom:3,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{topic.label}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,0.38)',fontFamily:"'Hedvig Letters Serif',serif",lineHeight:1.5}}>{topic.description}</div>
                    </div>
                    {activeTopic===topic.id&&isLoading
                      ? <div style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.15)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}}/>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7BC906" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    }
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <div style={{background:'rgba(185,28,28,0.1)',border:'0.5px solid rgba(185,28,28,0.35)',borderRadius:10,padding:'12px 18px',fontSize:13,color:'#fca5a5',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              {error}
              <button onClick={()=>setError('')} style={{background:'none',border:'none',color:'#fca5a5',cursor:'pointer',fontWeight:700,fontSize:12}}>dismiss</button>
            </div>
          )}

          {result && !isLoading && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <div style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(123,201,6,0.2)',borderRadius:14,padding:'22px 28px',marginBottom:8,display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:20}}>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:17,fontWeight:600,color:'rgba(255,255,255,0.9)',lineHeight:1.45,flex:1}}>
                  {result.question||result.topic}
                </div>
                <img src={LOGO} style={{width:100,height:'auto',flexShrink:0,marginTop:3,opacity:0.45}} alt="studio 2.5"/>
              </div>

              <div style={{background:'#ffffff',borderRadius:14,padding:'28px 36px',marginBottom:8}}>
                <div dangerouslySetInnerHTML={{__html:renderMarkdown(bodyText)}}/>
              </div>

              {result.sources && result.sources.length > 0 && (
                <div style={{background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'18px 22px',marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>
                    sources · {result.sources.length} retrieved
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                    {result.sources.map((s,i) => <SourceCard key={i} source={s}/>)}
                  </div>
                </div>
              )}

              {/* Calendly CTA */}
              <div style={{display:'flex',border:'1px solid rgba(123,201,6,0.25)',borderRadius:14,overflow:'hidden',marginBottom:16}}>
                <div style={{flex:1,background:'rgba(18,31,4,0.6)',padding:'24px 28px'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#7BC906',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:8}}>from insight to outcome</div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:18,fontWeight:700,color:'#ffffff',marginBottom:10,lineHeight:1.25}}>ready to turn this into a deliverable?</div>
                  <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>
                    studio 2.5 converts intelligence into scoped advisory outcomes, research reports, business cases, gap analyses, and transformation roadmaps, in 1 to 2 weeks.
                  </div>
                </div>
                <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="cta-book"
                  style={{flexShrink:0,width:260,background:'#7BC906',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:16,fontWeight:800,color:'#121f04',textDecoration:'none',textAlign:'center' as const,padding:'0 24px',lineHeight:1.3,transition:'all 0.15s'}}>
                  book a free conversation
                </a>
              </div>

              <button
                onClick={() => { setResult(null); setQuestion('') }}
                style={{
                  fontSize:11,
                  fontWeight:700,
                  color:'rgba(255,255,255,0.3)',
                  background:'transparent',
                  border:'0.5px solid rgba(255,255,255,0.1)',
                  borderRadius:999,
                  padding:'7px 18px',
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
      </div>

      <div style={{background:'#000000',borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'20px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <img src={LOGO} style={{width:120,height:'auto',opacity:0.3}} alt="studio 2.5"/>
        <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(255,255,255,0.15)'}}>© 2026 studio 2.5 · advisor.studio25.xyz</span>
        <a href="https://studio25.xyz" style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.3)',textDecoration:'none'}}>studio25.xyz →</a>
      </div>
    </div>
  )
}
