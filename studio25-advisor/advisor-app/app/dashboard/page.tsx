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
        .md-h1{font-size:1.1rem;font-weight:700;color:#121f04;margin:1.2rem 0 0.4rem}
        .md-h2{font-size:0.95rem;font-weight:700;color:#121f04;margin:1rem 0 0.3rem;border-bottom:1px solid rgba(68,107,26,0.15);padding-bottom:4px}
        .md-h3{font-size:0.875rem;font-weight:700;color:#446b1a;margin:0.8rem 0 0.25rem}
        .md-p{margin-bottom:0.75rem;line-height:1.85;font-size:0.875rem;color:#0e1209}
        .md-ul{margin:0.4rem 0 0.6rem 1.1rem}
        .md-li{margin-bottom:0.25rem;font-size:0.875rem;line-height:1.75;color:#0e1209}
        .md-hr{border:none;border-top:1px solid rgba(68,107,26,0.18);margin:1rem 0}
        .md-cite{color:#6f9f25;font-size:0.68rem;font-weight:700;vertical-align:super;font-style:normal}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.6)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 16px rgba(123,201,6,0.35)}50%{box-shadow:0 0 36px rgba(123,201,6,0.75)}}
        .q-card:hover{background:rgba(255,255,255,0.06)!important;border-color:rgba(123,201,6,0.35)!important}
        .topic-card:hover{background:rgba(123,201,6,0.07)!important;border-color:rgba(123,201,6,0.35)!important}
        .nav-pill{transition:all 0.15s;cursor:pointer;appearance:none;-webkit-appearance:none}
        .nav-pill:hover{background:rgba(255,255,255,0.1)!important}
        .nav-pill.active{background:#ffffff!important;color:#000000!important;border-color:#ffffff!important}
        .cta-book:hover{background:#8bda07!important}
        .arrow-btn:hover{background:rgba(123,201,6,0.2)!important}
        button{-webkit-appearance:none;appearance:none}
        button:focus{outline:none}
        .research-btn:hover:not([disabled]){background:#8bda07!important}
        .research-btn:focus{outline:none}

        /* DESKTOP hero is position:sticky with absolute children */
        .hero-desktop { display: block; }
        /* MOBILE hero is normal flow — no absolute positioning */
        .hero-mobile { display: none; }

        @media (max-width: 640px) {
          /* hide desktop hero, show mobile hero */
          .hero-desktop { display: none !important; }
          .hero-mobile { display: block !important; }

          /* nav */
          .nav-inner { padding: 0 16px !important; }
          .nav-logo { height: 28px !important; }
          .nav-pill { font-size: 10px !important; padding: 5px 10px !important; }
          .nav-studio-link { display: none !important; }

          /* content */
          .content-inner { padding: 0 16px !important; }
          .question-box { padding: 16px !important; }
          .question-textarea { font-size: 15px !important; }
          .research-row { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .research-btn { width: 100% !important; justify-content: center !important; }
          .q-card { font-size: 13px !important; padding: 12px 16px !important; }
          .topic-card { padding: 12px 14px !important; }
          .result-header { padding: 16px !important; }
          .result-body { padding: 18px !important; }
          .sources-grid { grid-template-columns: 1fr !important; }
          .calendly-cta-wrap { flex-direction: column !important; }
          .calendly-cta-btn { width: 100% !important; min-height: 56px !important; }
          .footer-inner { flex-direction: column !important; gap: 8px !important; align-items: center !important; padding: 16px !important; }
        }
      `}</style>

      {isLoading && (
        <div style={{position:'fixed',top:56,left:0,right:0,zIndex:40,background:'#0a0a0a',borderBottom:'1.5px solid #7BC906',padding:'10px 16px',display:'flex',alignItems:'center',gap:12,animation:'fadeIn 0.2s ease'}}>
          <div style={{width:14,height:14,border:'2px solid rgba(123,201,6,0.2)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}}/>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'#ffffff'}}>{loadingState==='searching'?'searching current sources...':'synthesizing intelligence...'}</div>
            <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'rgba(123,201,6,0.5)',marginTop:1}}>{loadingState==='searching'?'tavily retrieving results':'claude synthesizing'}</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:4}}>
            {[0,1,2].map(i => <div key={i} style={{width:5,height:5,borderRadius:'50%',background:'#7BC906',animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:'#000000',borderBottom:'0.5px solid rgba(255,255,255,0.08)',height:56,display:'flex',alignItems:'center'}}>
        <div className="nav-inner" style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px'}}>
          <img className="nav-logo" src={LOGO} style={{height:36,width:'auto',display:'block',flexShrink:0}} alt="studio 2.5"/>
          <div style={{display:'flex',gap:8}}>
            {(['query','briefing'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setResult(null); setQuestion('') }}
                className={`nav-pill${mode===m?' active':''}`}
                style={{background:'transparent',border:'1.5px solid rgba(255,255,255,0.45)',color:'#ffffff',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,fontWeight:700,padding:'7px 22px',borderRadius:999,whiteSpace:'nowrap'}}>
                {m==='query'?'strategic q&a':'signals briefings'}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:16,flexShrink:0}}>
            <a className="nav-studio-link" href="https://studio25.xyz" style={{display:'flex',alignItems:'center',gap:6,color:'#7BC906',fontSize:12,fontWeight:700,textDecoration:'none',whiteSpace:'nowrap'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M15 12H9M12 9l-3 3 3 3"/></svg>
              studio 2.5.xyz
            </a>
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>
      </nav>

      {/* ── DESKTOP HERO (sticky, absolute positioned children) ── */}
      <div className="hero-desktop" style={{position:'sticky',top:56,zIndex:30,height:500,overflow:'hidden',background:'#000000'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:`url(${BANNER})`,backgroundSize:'cover',backgroundPosition:'center center',filter:'brightness(0.72) saturate(1.1)'}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:200,background:'linear-gradient(to bottom,transparent,#000000)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',top:0,left:0,bottom:0,width:'65%',background:'linear-gradient(to right,rgba(0,0,0,0.65),transparent)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:60,left:48,right:'38%'}}>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,fontWeight:500,color:'rgba(255,255,255,0.7)',marginBottom:12,letterSpacing:'0.04em'}}>
            a new type of design company.
          </div>
          <img src={LOGO} style={{height:36,width:'auto',display:'block',marginBottom:14,opacity:0.9}} alt="studio 2.5"/>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'clamp(72px, 9vw, 120px)',fontWeight:800,lineHeight:0.92,color:'#ffffff',letterSpacing:'-0.03em',textShadow:'0 2px 20px rgba(0,0,0,0.5)'}}>
            how to<br/><span style={{color:'#7BC906'}}>grow 3d.</span>
          </div>
        </div>
        <div style={{position:'absolute',right:48,top:40,background:'rgba(0,0,0,0.88)',borderRadius:20,padding:'24px 24px 20px',width:288,display:'flex',flexDirection:'column',gap:16,backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.14)'}}>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="arrow-btn"
            style={{width:52,height:52,borderRadius:12,border:'2px solid #7BC906',background:'rgba(123,201,6,0.08)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',transition:'all 0.15s',animation:'glow 2.5s ease-in-out infinite',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7BC906" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.65,margin:0}}>
            connect with the studio to find out how to turn these insights into actionable innovation outcomes.
          </p>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="cta-book"
            style={{display:'block',background:'#7BC906',color:'#121f04',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:800,padding:'12px 16px',borderRadius:10,textDecoration:'none',textAlign:'center' as const,letterSpacing:'0.03em',transition:'all 0.15s'}}>
            book a free conversation →
          </a>
        </div>
      </div>

      {/* ── MOBILE HERO (normal document flow, no absolute positioning) ── */}
      <div className="hero-mobile" style={{position:'relative',background:'#000000'}}>
        {/* Banner image as background */}
        <div style={{position:'relative',height:240,overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:`url(${BANNER})`,backgroundSize:'cover',backgroundPosition:'center center',filter:'brightness(0.72) saturate(1.1)'}}/>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,background:'linear-gradient(to bottom,transparent,#000000)',pointerEvents:'none'}}/>
        </div>
        {/* Content below banner in normal flow */}
        <div style={{padding:'0 20px 24px',background:'#000000'}}>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.55)',marginBottom:8,letterSpacing:'0.04em'}}>
            a new type of design company.
          </div>
          <img src={LOGO} style={{height:28,width:'auto',display:'block',marginBottom:12,opacity:0.85}} alt="studio 2.5"/>
          {/* Headline in normal flow — no overlap possible */}
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:'clamp(52px,14vw,72px)',fontWeight:800,lineHeight:0.92,color:'#ffffff',letterSpacing:'-0.03em',marginBottom:24}}>
            how to<br/><span style={{color:'#7BC906'}}>grow 3d.</span>
          </div>
          {/* CTA button below headline, full width */}
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer"
            style={{display:'block',background:'#7BC906',color:'#121f04',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:15,fontWeight:800,padding:'16px 20px',borderRadius:12,textDecoration:'none',textAlign:'center' as const,letterSpacing:'0.03em'}}>
            book a free conversation →
          </a>
        </div>
      </div>

      {/* SCROLL CONTENT */}
      <div style={{position:'relative',zIndex:50,background:'#000000',minHeight:'100vh',padding:'40px 0 80px'}}>
        <div className="content-inner" style={{maxWidth:1100,margin:'0 auto',padding:'0 48px'}}>

          {mode==='query' && !result && (
            <>
              <div className="question-box" style={{background:'rgba(12,22,4,0.97)',border:'1.5px solid #7BC906',borderRadius:14,padding:'24px 28px 20px',marginBottom:24,boxShadow:'0 4px 40px rgba(0,0,0,0.5)'}}>
                <textarea className="question-textarea" value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitQuery()} }}
                  placeholder="ask a question about world models and AI transformation."
                  disabled={isLoading} rows={3}
                  style={{width:'100%',background:'transparent',border:'none',outline:'none',color:'rgba(255,255,255,0.9)',caretColor:'#7BC906',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:17,lineHeight:1.7,resize:'none',marginBottom:16,display:'block'}}/>
                <div className="research-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.35)',letterSpacing:'0.05em'}}>
                    enter to research · shift+enter for new line
                  </span>
                  <button onClick={() => submitQuery()} disabled={isLoading||!question.trim()} className="research-btn"
                    style={{background:'#7BC906',border:'none',color:'#121f04',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,fontWeight:800,padding:'12px 44px',borderRadius:10,display:'flex',alignItems:'center',gap:8,opacity:(!question.trim()||isLoading)?0.35:1,transition:'all 0.15s',letterSpacing:'0.04em',cursor:'pointer',flexShrink:0}}>
                    research
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'0.14em',textTransform:'lowercase',marginBottom:14}}>suggested questions</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {SUGGESTED_QUESTIONS.map((q,i) => (
                  <button key={i} onClick={() => submitQuery(q)} className="q-card"
                    style={{textAlign:'left',background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.09)',borderRadius:10,padding:'14px 22px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:14,fontWeight:400,color:'rgba(255,255,255,0.65)',lineHeight:1.55,transition:'all 0.15s',width:'100%'}}>
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {mode==='briefing' && !result && (
            <>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'0.14em',textTransform:'lowercase',marginBottom:14}}>signal areas</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {SIGNAL_TOPICS.map(topic => (
                  <button key={topic.id} onClick={() => submitBriefing(topic.id)} disabled={isLoading} className="topic-card"
                    style={{display:'flex',alignItems:'center',gap:14,background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.09)',borderRadius:10,padding:'15px 22px',cursor:'pointer',textAlign:'left',width:'100%',transition:'all 0.15s',opacity:isLoading?0.5:1,color:'#ffffff'}}>
                    <span style={{fontSize:20,flexShrink:0}}>{topic.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.85)',marginBottom:2,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{topic.label}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',fontFamily:"'Hedvig Letters Serif',serif",lineHeight:1.45}}>{topic.description}</div>
                    </div>
                    {activeTopic===topic.id&&isLoading
                      ? <div style={{width:13,height:13,border:'2px solid rgba(255,255,255,0.15)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.7s linear infinite',flexShrink:0}}/>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7BC906" strokeWidth="2" style={{flexShrink:0}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    }
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <div style={{background:'rgba(185,28,28,0.1)',border:'0.5px solid rgba(185,28,28,0.35)',borderRadius:10,padding:'12px 18px',fontSize:13,color:'#fca5a5',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              {error}
              <button onClick={()=>setError('')} style={{background:'none',border:'none',color:'#fca5a5',cursor:'pointer',fontWeight:700,fontSize:12,flexShrink:0,marginLeft:12}}>dismiss</button>
            </div>
          )}

          {result && !isLoading && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              <div className="result-header" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(123,201,6,0.2)',borderRadius:14,padding:'20px 28px',marginBottom:8,display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
                <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.9)',lineHeight:1.45,flex:1}}>
                  {result.question||result.topic}
                </div>
                <img src={LOGO} style={{height:24,width:'auto',flexShrink:0,marginTop:2,opacity:0.4}} alt="studio 2.5"/>
              </div>
              <div className="result-body" style={{background:'#ffffff',borderRadius:14,padding:'28px 32px',marginBottom:8}}>
                <div dangerouslySetInnerHTML={{__html:renderMarkdown(bodyText)}}/>
              </div>
              {result.sources && result.sources.length > 0 && (
                <div style={{background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'16px 20px',marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>
                    sources · {result.sources.length} retrieved
                  </div>
                  <div className="sources-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                    {result.sources.map((s,i) => <SourceCard key={i} source={s}/>)}
                  </div>
                </div>
              )}
              <div className="calendly-cta-wrap" style={{display:'flex',border:'1px solid rgba(123,201,6,0.2)',borderRadius:14,overflow:'hidden',marginBottom:16}}>
                <div style={{flex:1,background:'rgba(12,22,4,0.5)',padding:'22px 24px'}}>
                  <div style={{fontSize:10,fontWeight:700,color:'#7BC906',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:8}}>from insight to outcome</div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:16,fontWeight:700,color:'#ffffff',marginBottom:8,lineHeight:1.25}}>ready to turn this into a deliverable?</div>
                  <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.65}}>
                    studio 2.5 converts intelligence into scoped advisory outcomes, research reports, business cases, gap analyses, and transformation roadmaps, in 1 to 2 weeks.
                  </div>
                </div>
                <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="cta-book calendly-cta-btn"
                  style={{flexShrink:0,width:220,background:'#7BC906',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:15,fontWeight:800,color:'#121f04',textDecoration:'none',textAlign:'center' as const,padding:'0 20px',lineHeight:1.3,transition:'all 0.15s'}}>
                  book a free conversation
                </a>
              </div>
              <button onClick={() => { setResult(null); setQuestion('') }}
                style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.28)',background:'transparent',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:999,padding:'7px 18px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'all 0.15s'}}>
                ← new {mode==='query'?'question':'briefing'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="footer-inner" style={{background:'#000000',borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'20px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <img src={LOGO} style={{height:26,width:'auto',opacity:0.28}} alt="studio 2.5"/>
        <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(255,255,255,0.14)'}}>© 2026 studio 2.5 · advisor.studio25.xyz</span>
        <a href="https://studio25.xyz" style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.3)',textDecoration:'none'}}>studio25.xyz →</a>
      </div>
    </div>
  )
}
