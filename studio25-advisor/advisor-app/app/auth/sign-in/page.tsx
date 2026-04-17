import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main style={{minHeight:'100vh',background:'#000000',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 16px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{fontFamily:'Ruthie,cursive',fontSize:'2.2rem',color:'#7BC906',marginBottom:'6px'}}>
            studio 2.5
          </div>
          <div style={{fontFamily:'Hedvig Letters Serif,serif',fontSize:'13px',color:'rgba(255,255,255,0.45)'}}>
            advisor · sign in to continue
          </div>
        </div>
        <SignIn
          routing="path"
          path="/signin"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: { background:'#0a1002', border:'1px solid rgba(123,201,6,0.2)', borderRadius:'12px', boxShadow:'0 8px 40px rgba(0,0,0,0.6)' },
              headerTitle: { color:'#ffffff', fontWeight:'600' },
              headerSubtitle: { color:'rgba(255,255,255,0.45)' },
              socialButtonsBlockButton: { border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.8)', background:'transparent' },
              dividerLine: { background:'rgba(255,255,255,0.08)' },
              dividerText: { color:'rgba(255,255,255,0.25)' },
              formFieldLabel: { color:'rgba(255,255,255,0.55)', fontSize:'12px' },
              formFieldInput: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.15)', color:'#ffffff', borderRadius:'8px' },
              formButtonPrimary: { background:'#7BC906', color:'#121f04', fontWeight:'700' },
              footerActionLink: { color:'#7BC906' },
              identityPreviewText: { color:'rgba(255,255,255,0.7)' },
              identityPreviewEditButton: { color:'#7BC906' },
            },
          }}
        />
      </div>
    </main>
  )
}
