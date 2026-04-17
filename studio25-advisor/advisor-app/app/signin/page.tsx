import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main style={{minHeight:'100vh',background:'#000000',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 16px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{fontFamily:'Ruthie,cursive',fontSize:'2.2rem',color:'#7BC906'}}>studio 2.5</div>
          <div style={{fontFamily:'Hedvig Letters Serif,serif',fontSize:'13px',color:'rgba(255,255,255,0.45)'}}>advisor sign in</div>
        </div>
        <SignIn routing="path" path="/signin"
          appearance={{elements:{
            card:{background:'#0a1002',border:'1px solid rgba(123,201,6,0.2)',borderRadius:'12px'},
            headerTitle:{color:'#ffffff'},
            formFieldInput:{background:'rgba(255,255,255,0.05)',color:'#ffffff'},
            formButtonPrimary:{background:'#7BC906',color:'#121f04'},
            footerActionLink:{color:'#7BC906'},
          }}}
        />
      </div>
    </main>
  )
}
