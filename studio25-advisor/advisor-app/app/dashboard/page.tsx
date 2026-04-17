'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { SIGNAL_TOPICS, SUGGESTED_QUESTIONS } from '@/lib/config'

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

function SourceCard({ source, index }: { source: Source; index: number }) {
  let domain = ''
  try { domain = new URL(source.url).hostname.replace('www.', '') } catch {}
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 16px',background:'#ffffff',border:'0.5px solid rgba(68,107,26,0.2)',borderRadius:8,textDecoration:'none',marginBottom:6,transition:'all 0.15s'}}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(123,201,6,0.5)'; (e.currentTarget as HTMLElement).style.background='#f4f7ed' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(68,107,26,0.2)'; (e.currentTarget as HTMLElement).style.background='#ffffff' }}>
      <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'#a8bc88',flexShrink:0,width:20,marginTop:2}}>{String(index+1).padStart(2,'0')}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'#7a9058',letterSpacing:'0.03em',marginBottom:3}}>{domain}</div>
        <div style={{fontSize:12,fontWeight:600,color:'#0e1209',lineHeight:1.4}}>{source.title}</div>
      </div>
      <div style={{color:'#7BC906',fontSize:14,flexShrink:0}}>→</div>
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
      const res = await fetch('/api/query', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question}) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ type:'query', ...data })
    } catch (e: any) { setError(e.message || 'query failed') }
    finally { setLoadingState('done'); setTimeout(() => setLoadingState('idle'), 300) }
  }

  async function submitBriefing(topicId: string) {
    if (loadingState !== 'idle') return
    setError(''); setResult(null); setActiveTopic(topicId); setLoadingState('searching')
    setTimeout(() => setLoadingState('synthesizing'), 2500)
    try {
      const res = await fetch('/api/briefing', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({topicId}) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ type:'briefing', ...data })
    } catch (e: any) { setError(e.message || 'briefing failed') }
    finally { setLoadingState('done'); setActiveTopic(null); setTimeout(() => setLoadingState('idle'), 300) }
  }

  const isLoading = loadingState === 'searching' || loadingState === 'synthesizing'
  const bodyText = result?.answer || result?.briefing || ''

  return (
    <div style={{minHeight:'100vh',background:'#f8faf3',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Hedvig+Letters+Serif:opsz@12..24&family=Ruthie&display=swap');
        .md-h1{font-size:1.2rem;font-weight:700;color:#121f04;margin:1.4rem 0 0.4rem}
        .md-h2{font-size:1.05rem;font-weight:700;color:#121f04;margin:1.2rem 0 0.35rem;border-bottom:1px solid rgba(68,107,26,0.15);padding-bottom:4px}
        .md-h3{font-size:0.9rem;font-weight:700;color:#446b1a;margin:1rem 0 0.3rem}
        .md-p{margin-bottom:0.85rem;line-height:1.85;font-size:0.875rem;color:#0e1209}
        .md-ul{margin:0.4rem 0 0.7rem 1.2rem}
        .md-li{margin-bottom:0.3rem;font-size:0.875rem;line-height:1.75;color:#0e1209}
        .md-hr{border:none;border-top:1px solid rgba(68,107,26,0.18);margin:1.2rem 0}
        .md-cite{color:#7BC906;font-size:0.7rem;font-weight:700;vertical-align:super;font-style:normal}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.65)}}
        .suggest-btn:hover{border-color:rgba(123,201,6,0.35)!important;background:#f4f7ed!important}
        .topic-btn-inner:hover{border-color:rgba(123,201,6,0.45)!important;background:#f4f7ed!important}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(0,0,0,0.97)',backdropFilter:'blur(10px)',borderBottom:'0.5px solid rgba(123,201,6,0.15)',height:'52px',display:'flex',alignItems:'center'}}>
        <div style={{width:'100%',maxWidth:1100,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <img src="https://studio25assets.pages.dev/studio25-logo.png" style={{height:40,opacity:0.9}} alt="studio 2.5"/>
            <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.45)'}}>advisor</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:3,background:'rgba(255,255,255,0.06)',borderRadius:20,padding:3}}>
            {(['query','briefing'] as Mode[]).map(m => (
              <button key={m} onClick={() => {setMode(m);setResult(null)}}
                style={{padding:'5px 14px',borderRadius:20,fontSize:11,fontWeight:600,border:'none',cursor:'pointer',transition:'all 0.15s',background:mode===m?'#7BC906':'transparent',color:mode===m?'#121f04':'rgba(255,255,255,0.5)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {m==='query'?'strategic Q&A':'signal briefings'}
              </button>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <a href="https://studio25.xyz" style={{fontSize:11,color:'rgba(123,201,6,0.4)',textDecoration:'none',fontFamily:"'Hedvig Letters Serif',serif"}}>← studio25.xyz</a>
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{background:"linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.85)),url(https://studio25assets.pages.dev/studio25-web-banner.jpg) center/cover no-repeat",padding:'48px 24px 40px',borderBottom:'3px solid #7BC906'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#7BC906',animation:'pulse 2.5s ease-in-out infinite'}}/>
            <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:12,color:'rgba(123,201,6,0.65)'}}>
              {mode==='query'?'strategic intelligence · real-time research':'signal briefings · curated by signal area'}
            </span>
          </div>
          <h1 style={{fontFamily:"'Ruthie',cursive",fontSize:'clamp(32px,5vw,58px)',color:'#ffffff',lineHeight:1,margin:'0 0 10px',letterSpacing:'0.01em'}}>
            {mode==='query'?<>ask <span style={{color:'#7BC906'}}>anything.</span></>:<>signal <span style={{color:'#7BC906'}}>intelligence.</span></>}
          </h1>
          <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:14,color:'rgba(232,240,216,0.55)',maxWidth:520,lineHeight:1.75,margin:0}}>
            {mode==='query'?'infrastructure AI transformation intelligence grounded in real-time research. domain-specific, evidence-based, built for executive decision-making.':'select a signal area to receive a concise briefing on current developments and implications for infrastructure leaders.'}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px'}}>

        {/* QUERY INPUT */}
        {mode==='query' && !result && (
          <>
            <div style={{background:'#ffffff',border:'0.5px solid rgba(68,107,26,0.2)',borderRadius:12,padding:4,marginBottom:20,boxShadow:'0 2px 12px rgba(68,107,26,0.05)'}}>
              <textarea value={question} onChange={e=>setQuestion(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitQuery()}}}
                placeholder="ask a question about infrastructure AI transformation..."
                disabled={isLoading} rows={3}
                style={{width:'100%',padding:'14px 16px',fontSize:14,color:'#0e1209',background:'transparent',border:'none',outline:'none',resize:'none',lineHeight:1.7,fontFamily:"'Plus Jakarta Sans',sans-serif",boxSizing:'border-box'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 12px 12px'}}>
                <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(68,107,26,0.4)'}}>shift+enter for new line · enter to submit</span>
                <button onClick={submitQuery} disabled={isLoading||!question.trim()}
                  style={{background:'#7BC906',color:'#121f04',fontSize:12,fontWeight:700,padding:'8px 20px',borderRadius:8,border:'none',cursor:'pointer',opacity:(!question.trim()||isLoading)?0.4:1,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  {isLoading?'...':'research →'}
                </button>
              </div>
            </div>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(68,107,26,0.5)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>suggested questions</div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {SUGGESTED_QUESTIONS.map((q,i)=>(
                <button key={i} onClick={()=>setQuestion(q)} className="suggest-btn"
                  style={{textAlign:'left',fontSize:13,color:'#0e1209',background:'#ffffff',border:'0.5px solid rgba(68,107,26,0.15)',borderRadius:8,padding:'11px 16px',cursor:'pointer',fontFamily:"'Hedvig Letters Serif',serif",lineHeight:1.5,transition:'all 0.15s'}}>{q}</button>
              ))}
            </div>
          </>
        )}

        {/* BRIEFING TOPICS */}
        {mode==='briefing' && !result && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:8}}>
            {SIGNAL_TOPICS.map(topic=>(
              <button key={topic.id} onClick={()=>submitBriefing(topic.id)} disabled={isLoading} className="topic-btn-inner"
                style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:'#ffffff',border:`0.5px solid ${activeTopic===topic.id?'#7BC906':'rgba(68,107,26,0.2)'}`,borderRadius:10,cursor:'pointer',textAlign:'left',width:'100%',transition:'all 0.15s',opacity:isLoading?0.6:1,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                <span style={{fontSize:22,flexShrink:0}}>{topic.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#0e1209',marginBottom:3}}>{topic.label}</div>
                  <div style={{fontSize:11,color:'#7a9058',fontFamily:"'Hedvig Letters Serif',serif",lineHeight:1.5}}>{topic.description}</div>
                </div>
                {activeTopic===topic.id&&isLoading&&<div style={{width:16,height:16,border:'2px solid rgba(123,201,6,0.25)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.8s linear infinite',flexShrink:0}}/>}
              </button>
            ))}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div style={{background:'#ffffff',border:'0.5px solid rgba(68,107,26,0.2)',borderRadius:12,padding:'24px',display:'flex',alignItems:'center',gap:16,marginTop:8}}>
            <div style={{width:20,height:20,border:'2px solid rgba(123,201,6,0.2)',borderTopColor:'#7BC906',borderRadius:'50%',animation:'spin 0.8s linear infinite',flexShrink:0}}/>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#121f04'}}>{loadingState==='searching'?'searching current sources...':'synthesizing intelligence...'}</div>
              <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'#7a9058',marginTop:3}}>
                {loadingState==='searching'?'tavily is retrieving real-time results from across the web':'claude is synthesizing findings into a structured response'}
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div style={{background:'#fff5f5',border:'0.5px solid #fca5a5',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#b91c1c',marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            {error}
            <button onClick={()=>setError('')} style={{background:'none',border:'none',color:'#b91c1c',cursor:'pointer',fontWeight:600,fontSize:12}}>dismiss</button>
          </div>
        )}

        {/* RESULT */}
        {result && !isLoading && (
          <div>
            <div style={{background:'linear-gradient(135deg,#000000 0%,#0a1002 60%,#000000 100%)',borderRadius:10,padding:'22px 26px',marginBottom:2,border:'0.5px solid #1a3208'}}>
              <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:10,color:'rgba(123,201,6,0.55)',letterSpacing:'0.05em',marginBottom:8}}>
                {result.type==='query'?'strategic advisory response':'signal intelligence briefing'} · studio 2.5 advisor
              </div>
              <div style={{fontSize:17,fontWeight:700,color:'#ffffff',lineHeight:1.35,marginBottom:6}}>{result.question||result.topic}</div>
              <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.4)'}}>
                {new Date(result.timestamp).toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
              </div>
            </div>

            <div style={{background:'#ffffff',border:'0.5px solid rgba(68,107,26,0.15)',borderRadius:10,padding:'28px 32px',marginBottom:2}}>
              <div dangerouslySetInnerHTML={{__html:renderMarkdown(bodyText)}}/>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div style={{background:'#f8faf3',border:'0.5px solid rgba(68,107,26,0.15)',borderRadius:10,padding:'18px 22px',marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(68,107,26,0.5)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>
                  sources · {result.sources.length} retrieved
                </div>
                {result.sources.map((s,i)=><SourceCard key={i} source={s} index={i}/>)}
              </div>
            )}

            <button onClick={()=>{setResult(null);setQuestion('')}}
              style={{fontSize:11,fontWeight:600,color:'#446b1a',background:'none',border:'0.5px solid rgba(68,107,26,0.3)',borderRadius:20,padding:'7px 18px',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              ← new {mode==='query'?'question':'briefing'}
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{background:'#000000',padding:'24px',borderTop:'0.5px solid rgba(123,201,6,0.1)',marginTop:48,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <img src="https://studio25assets.pages.dev/studio25-logo.png" style={{height:28,opacity:0.4}} alt="studio 2.5"/>
        <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(255,255,255,0.2)'}}>© 2026 studio 2.5 · advisor.studio25.xyz</span>
        <a href="https://studio25.xyz" style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:11,color:'rgba(123,201,6,0.35)',textDecoration:'none'}}>studio25.xyz →</a>
      </div>
    </div>
  )
}
