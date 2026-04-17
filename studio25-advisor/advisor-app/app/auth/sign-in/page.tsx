import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-marker text-3xl text-[#7BC906] mb-2" style={{fontFamily: 'Ruthie, cursive'}}>
            studio 2.5
          </div>
          <div className="text-white/50 text-sm" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
            advisor · sign in to continue
          </div>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-[#0a1002] border border-[#7BC906]/20 shadow-xl',
              headerTitle: 'text-white font-semibold',
              headerSubtitle: 'text-white/50',
              socialButtonsBlockButton: 'border border-white/20 text-white hover:bg-white/5',
              socialButtonsBlockButtonText: 'text-white/70',
              dividerLine: 'bg-white/10',
              dividerText: 'text-white/30',
              formFieldLabel: 'text-white/60 text-xs',
              formFieldInput: 'bg-white/5 border-white/20 text-white focus:border-[#7BC906]/50',
              formButtonPrimary: 'bg-[#7BC906] text-[#121f04] font-bold hover:opacity-90',
              footerActionLink: 'text-[#7BC906] hover:text-[#6f9f25]',
              identityPreviewText: 'text-white/70',
              identityPreviewEditButton: 'text-[#7BC906]',
            },
          }}
        />
      </div>
    </main>
  )
}
