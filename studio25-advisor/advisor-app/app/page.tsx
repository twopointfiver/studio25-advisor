import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

const CALENDLY = 'https://calendly.com/jeffrey-l-walter-studio25/jeff-walter-studio-2-5-connect?primary_color=6f9f25'
const LOGO = 'https://studio25assets.pages.dev/studio25-logo.png'

export default function Home() {
  return (
    <main style={{minHeight:'100vh',background:'#000000',color:'#ffffff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Hedvig+Letters+Serif:opsz@12..24&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.65)}}
        .cta-btn:hover{opacity:0.9;transform:translateY(-1px)}
        .cta-outline:hover{border-color:rgba(255,255,255,0.5)!important;color:#ffffff!important}
        .cap-card:hover{border-color:rgba(123,201,6,0.3)!important}
        .advisory-item:hover{border-color:rgba(123,201,6,0.4)!important;background:rgba(123,201,6,0.04)!important}
        .book-btn:hover{background:#8bda07!important;transform:translateY(-1px);box-shadow:0 8px 28px rgba(123,201,6,0.35)!important}
        @media(max-width:768px){
          .above-fold{grid-template-columns:1fr!important;gap:40px!important}
          .cta-panel{border-left:none!important;padding-left:0!important;border-top:0.5px solid rgba(255,255,255,0.06)!important;padding-top:40px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{borderBottom:'0.5px solid rgba(255,255,255,0.08)',padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <img src={LOGO} alt="studio 2.5" style={{height:44}} />
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <SignedOut>
            <Link href="/signin" style={{fontSize:'13px',fontWeight:600,color:'rgba(255,255,255,0.55)',textDecoration:'none',transition:'color 0.15s'}}>sign in</Link>
            <Link href="/signup" style={{fontSize:'13px',fontWeight:700,background:'#7BC906',color:'#121f04',padding:'8px 20px',borderRadius:'20px',textDecoration:'none',transition:'opacity 0.15s'}}>get access</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" style={{fontSize:'13px',fontWeight:700,background:'#7BC906',color:'#121f04',padding:'8px 20px',borderRadius:'20px',textDecoration:'none'}}>open advisor</Link>
          </SignedIn>
        </div>
      </nav>

      {/* ABOVE THE FOLD */}
      <div style={{maxWidth:1080,margin:'0 auto',padding:'56px 32px 64px'}}>
        <div className="above-fold" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'start'}}>

          {/* LEFT: hero */}
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(123,201,6,0.08)',border:'0.5px solid rgba(123,201,6,0.25)',borderRadius:'20px',padding:'6px 16px',marginBottom:24}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#7BC906',animation:'pulse 2.5s ease-in-out infinite'}}/>
              <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.8)',letterSpacing:'0.04em'}}>executive advisory · infrastructure AI transformation</span>
            </div>
            <h1 style={{fontSize:'clamp(32px,4.5vw,58px)',fontWeight:700,lineHeight:1.05,marginBottom:20,letterSpacing:'-0.03em'}}>
              intelligence for<br/>
              <span style={{color:'#7BC906'}}>infrastructure leaders</span>
            </h1>
            <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'16px',color:'rgba(255,255,255,0.55)',lineHeight:1.8,maxWidth:480,marginBottom:12}}>
              real-time research intelligence and strategic advisory for executives navigating AI transformation in airports, transit, utilities, and capital infrastructure programs.
            </p>
            <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'13px',color:'rgba(255,255,255,0.3)',lineHeight:1.8,maxWidth:440,marginBottom:36}}>
              ask any question about infrastructure AI transformation and receive a researched, evidence-based answer grounded in current developments.
            </p>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              <SignedOut>
                <Link href="/signup" className="cta-btn" style={{background:'#7BC906',color:'#121f04',fontWeight:700,padding:'13px 26px',borderRadius:'10px',textDecoration:'none',fontSize:'14px',transition:'all 0.15s',display:'inline-block'}}>
                  request access
                </Link>
                <Link href="/signin" className="cta-outline" style={{border:'0.5px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.55)',fontWeight:600,padding:'13px 26px',borderRadius:'10px',textDecoration:'none',fontSize:'14px',transition:'all 0.15s',display:'inline-block'}}>
                  sign in
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="cta-btn" style={{background:'#7BC906',color:'#121f04',fontWeight:700,padding:'13px 26px',borderRadius:'10px',textDecoration:'none',fontSize:'14px',transition:'all 0.15s',display:'inline-block'}}>
                  open advisor
                </Link>
              </SignedIn>
            </div>
          </div>

          {/* RIGHT: advisory CTA panel */}
          <div className="cta-panel" style={{borderLeft:'0.5px solid rgba(255,255,255,0.06)',paddingLeft:48}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <div style={{width:20,height:1,background:'rgba(123,201,6,0.5)'}}/>
              <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'10px',color:'rgba(123,201,6,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>from insight to outcome</span>
            </div>
            <h2 style={{fontSize:'clamp(18px,2.2vw,28px)',fontWeight:700,lineHeight:1.2,letterSpacing:'-0.02em',marginBottom:14}}>
              what a big advisory firm takes<br/>
              <span style={{color:'#7BC906'}}>6 months to produce.</span><br/>
              delivered in 1 to 2 weeks.
            </h2>
            <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'13px',color:'rgba(255,255,255,0.45)',lineHeight:1.8,marginBottom:20}}>
              studio 2.5 converts intelligence into concrete advisory deliverables, scoped and structured for executive action, drawing on a partner ecosystem of world model platforms, spatial intelligence tools, and lifecycle infrastructure specialists.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:24}}>
              {[
                {icon:'📊',title:'research, market or trend report'},
                {icon:'⚡',title:'rapid business case'},
                {icon:'🔍',title:'gap analysis and recommendation'},
                {icon:'🗺️',title:'innovation or transformation roadmap'},
              ].map(item => (
                <div key={item.title} className="advisory-item" style={{display:'flex',gap:10,padding:'11px 14px',background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.07)',borderRadius:8,transition:'all 0.15s',alignItems:'center'}}>
                  <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
                  <div style={{fontSize:'12px',fontWeight:600,color:'rgba(255,255,255,0.8)'}}>{item.title}</div>
                </div>
              ))}
            </div>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="book-btn"
              style={{display:'inline-flex',alignItems:'center',gap:8,background:'#7BC906',color:'#121f04',fontWeight:700,fontSize:'13px',padding:'13px 24px',borderRadius:'10px',textDecoration:'none',transition:'all 0.18s',boxShadow:'0 4px 20px rgba(123,201,6,0.2)'}}>
              book a free 30 min conversation
            </a>
            <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.4)',marginTop:8}}>no commitment, scoped in the first conversation</div>
          </div>
        </div>
      </div>

      {/* CAPABILITY CARDS */}
      <div style={{borderTop:'0.5px solid rgba(255,255,255,0.05)',background:'rgba(255,255,255,0.01)'}}>
        <div style={{maxWidth:1080,margin:'0 auto',padding:'48px 32px 64px'}}>
          <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'10px',color:'rgba(255,255,255,0.2)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:20}}>what the advisor does</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10}}>
            {[
              {num:'01',title:'strategic Q&A',desc:'ask any question about infrastructure AI transformation. get a researched, cited answer grounded in current evidence.'},
              {num:'02',title:'signal briefings',desc:'select from 8 signal areas and receive a concise intelligence briefing on what is happening right now.'},
              {num:'03',title:'domain-specific',desc:'every response is grounded in the studio 2.5 advisory framework, covering world models, 3d as code, physical AI, and spatial intelligence.'},
            ].map(card => (
              <div key={card.num} className="cap-card" style={{border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:24,background:'rgba(255,255,255,0.02)',transition:'border-color 0.15s'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'rgba(123,201,6,0.5)',letterSpacing:'0.06em',marginBottom:10}}>{card.num}</div>
                <div style={{fontWeight:600,fontSize:'14px',marginBottom:8}}>{card.title}</div>
                <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'12px',color:'rgba(255,255,255,0.4)',lineHeight:1.65}}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'28px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <img src={LOGO} alt="studio 2.5" style={{height:28,opacity:0.35}} />
        <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(255,255,255,0.2)'}}>© 2026 studio 2.5 · ontario, canada · advisor.studio25.xyz</div>
        <a href="https://studio25.xyz" style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.35)',textDecoration:'none'}}>studio25.xyz</a>
      </div>
    </main>
  )
}
