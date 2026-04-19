import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

const CALENDLY = 'https://calendly.com/jeffrey-l-walter-studio25/jeff-walter-studio-2-5-connect?primary_color=6f9f25'

export default function Home() {
  return (
    <main style={{minHeight:'100vh',background:'#000000',color:'#ffffff',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Hedvig+Letters+Serif:opsz@12..24&family=Ruthie&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.65)}}
        .cta-btn:hover{opacity:0.9;transform:translateY(-1px)}
        .cta-outline:hover{border-color:rgba(255,255,255,0.5)!important;color:#ffffff!important}
        .cap-card:hover{border-color:rgba(123,201,6,0.3)!important}
        .advisory-item:hover{border-color:rgba(123,201,6,0.4)!important;background:rgba(123,201,6,0.04)!important}
        .book-btn:hover{background:#8bda07!important;transform:translateY(-1px);box-shadow:0 8px 28px rgba(123,201,6,0.35)!important}
      `}</style>

      {/* NAV */}
      <nav style={{borderBottom:'0.5px solid rgba(255,255,255,0.08)',padding:'12px 32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:"'Ruthie',cursive",fontSize:'3rem',color:'#7BC906',lineHeight:1}}>studio 2.5</div>
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

      {/* HERO */}
      <div style={{maxWidth:960,margin:'0 auto',padding:'48px 32px 40px'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(123,201,6,0.08)',border:'0.5px solid rgba(123,201,6,0.25)',borderRadius:'20px',padding:'6px 16px',marginBottom:24}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'#7BC906',animation:'pulse 2.5s ease-in-out infinite'}}/>
          <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.8)',letterSpacing:'0.04em'}}>executive advisory · infrastructure AI transformation</span>
        </div>

        <h1 style={{fontSize:'clamp(36px,6vw,72px)',fontWeight:700,lineHeight:1.05,marginBottom:24,letterSpacing:'-0.03em'}}>
          intelligence for<br/>
          <span style={{color:'#7BC906'}}>infrastructure leaders</span>
        </h1>

        <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'17px',color:'rgba(255,255,255,0.55)',lineHeight:1.8,maxWidth:560,marginBottom:12}}>
          real-time research intelligence and strategic advisory for executives navigating AI transformation in airports, transit, utilities, and capital infrastructure programs.
        </p>
        <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'14px',color:'rgba(255,255,255,0.35)',lineHeight:1.8,maxWidth:520,marginBottom:36}}>
          ask any question about infrastructure AI transformation and receive a researched, evidence-based answer grounded in current developments.
        </p>

        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <SignedOut>
            <Link href="/signup" className="cta-btn" style={{background:'#7BC906',color:'#121f04',fontWeight:700,padding:'14px 28px',borderRadius:'10px',textDecoration:'none',fontSize:'14px',transition:'all 0.15s',display:'inline-block'}}>
              request access
            </Link>
            <Link href="/signin" className="cta-outline" style={{border:'0.5px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.55)',fontWeight:600,padding:'14px 28px',borderRadius:'10px',textDecoration:'none',fontSize:'14px',transition:'all 0.15s',display:'inline-block'}}>
              sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="cta-btn" style={{background:'#7BC906',color:'#121f04',fontWeight:700,padding:'14px 28px',borderRadius:'10px',textDecoration:'none',fontSize:'14px',transition:'all 0.15s',display:'inline-block'}}>
              open advisor
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* CAPABILITY CARDS */}
      <div style={{maxWidth:960,margin:'0 auto',padding:'0 32px 64px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10}}>
          {[
            {num:'01',title:'strategic Q&A',desc:'ask any question about infrastructure AI transformation. get a researched, cited answer grounded in current evidence.'},
            {num:'02',title:'signal briefings',desc:'select from 8 signal areas and receive a concise intelligence briefing on what is happening right now.'},
            {num:'03',title:'domain-specific',desc:'every response is grounded in the studio 2.5 advisory framework, covering infrastructure AI, digital twins, lifecycle intelligence, and governance.'},
          ].map(card => (
            <div key={card.num} className="cap-card" style={{border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:24,background:'rgba(255,255,255,0.02)',transition:'border-color 0.15s'}}>
              <div style={{fontFamily:"'Ruthie',cursive",fontSize:'2rem',color:'#7BC906',marginBottom:10,lineHeight:1}}>{card.num}</div>
              <div style={{fontWeight:600,fontSize:'14px',marginBottom:8}}>{card.title}</div>
              <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'12px',color:'rgba(255,255,255,0.45)',lineHeight:1.65}}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ADVISORY CTA SECTION */}
      <div style={{borderTop:'0.5px solid rgba(255,255,255,0.06)',borderBottom:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(123,201,6,0.03)'}}>
        <div style={{maxWidth:960,margin:'0 auto',padding:'64px 32px'}}>

          {/* Section header */}
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
            <div style={{width:24,height:1,background:'rgba(123,201,6,0.5)'}}/>
            <span style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.65)',letterSpacing:'0.08em',textTransform:'uppercase'}}>from insight to outcome</span>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'start'}}>

            {/* LEFT */}
            <div>
              <h2 style={{fontSize:'clamp(22px,3vw,36px)',fontWeight:700,lineHeight:1.15,letterSpacing:'-0.025em',marginBottom:16}}>
                what a big 4 firm takes<br/>
                <span style={{color:'#7BC906'}}>6 months to produce.</span><br/>
                delivered in 1 to 2 weeks.
              </h2>
              <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'14px',color:'rgba(255,255,255,0.5)',lineHeight:1.8,marginBottom:24}}>
                the advisor surfaces intelligence fast. but intelligence without action is just information. studio 2.5 converts that intelligence into a concrete advisory deliverable, scoped, structured, and ready to act on.
              </p>
              <p style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'14px',color:'rgba(255,255,255,0.35)',lineHeight:1.8,marginBottom:32}}>
                drawing on the studio 2.5 partner ecosystem, world model platforms, spatial intelligence tools, and lifecycle infrastructure specialists, we produce outputs that combine current research with direct practitioner experience.
              </p>

              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="book-btn"
                style={{display:'inline-flex',alignItems:'center',gap:8,background:'#7BC906',color:'#121f04',fontWeight:700,fontSize:'14px',padding:'14px 28px',borderRadius:'10px',textDecoration:'none',transition:'all 0.18s',boxShadow:'0 4px 20px rgba(123,201,6,0.2)'}}>
                book a free 30 min conversation
              </a>
              <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.4)',marginTop:10}}>no commitment · scoped in the first conversation</div>
            </div>

            {/* RIGHT */}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {icon:'📊',title:'research, market or trend report',desc:'current-state analysis of a technology, market, or regulatory shift relevant to your infrastructure program.'},
                {icon:'⚡',title:'rapid business case',desc:'evidence-based investment rationale for a specific AI or digital transformation initiative. structured for executive approval.'},
                {icon:'🔍',title:'gap analysis and recommendation',desc:'where your organization is relative to the leading edge. what the gap costs. what to do about it.'},
                {icon:'🗺️',title:'innovation or transformation roadmap',desc:'a 90-day to 12-month action plan for a specific transformation objective, grounded in current platform and standards landscape.'},
              ].map(item => (
                <div key={item.title} className="advisory-item"
                  style={{display:'flex',gap:14,padding:'16px 18px',background:'rgba(255,255,255,0.02)',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:10,transition:'all 0.15s'}}>
                  <span style={{fontSize:20,flexShrink:0,marginTop:2}}>{item.icon}</span>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:600,marginBottom:4,color:'#ffffff'}}>{item.title}</div>
                    <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(255,255,255,0.4)',lineHeight:1.6}}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{borderTop:'0.5px solid rgba(255,255,255,0.06)',padding:'32px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div style={{fontFamily:"'Ruthie',cursive",fontSize:'2rem',color:'rgba(123,201,6,0.4)',lineHeight:1}}>studio 2.5</div>
        <div style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(255,255,255,0.2)'}}>© 2026 studio 2.5 · ontario, canada · advisor.studio25.xyz</div>
        <a href="https://studio25.xyz" style={{fontFamily:"'Hedvig Letters Serif',serif",fontSize:'11px',color:'rgba(123,201,6,0.35)',textDecoration:'none'}}>studio25.xyz</a>
      </div>
    </main>
  )
}
