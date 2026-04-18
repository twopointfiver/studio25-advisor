import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="https://studio25assets.pages.dev/studio25-logo.png"
            alt="studio 2.5"
            style={{ height: 36 }}
          />
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/signin"
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#7BC906] text-[#121f04] px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              get access
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-[#7BC906] text-[#121f04] px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              open advisor →
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-5xl mx-auto px-8 pt-14 pb-16">
        <div className="inline-flex items-center gap-2 bg-[#7BC906]/10 border border-[#7BC906]/30 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#7BC906] animate-pulse" />
          <span className="text-xs font-semibold text-[#7BC906]" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
            executive advisory · infrastructure AI transformation
          </span>
        </div>

        <h1 className="text-6xl font-bold leading-tight mb-8 tracking-tight">
          intelligence for<br />
          <span className="text-[#7BC906]">infrastructure leaders</span>
        </h1>

        <p className="text-xl text-white/60 leading-relaxed max-w-2xl mb-4" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
          real-time research intelligence and strategic advisory for executives and leaders navigating AI transformation in design studios and asset owner organizations.
        </p>
        <p className="text-base text-white/40 leading-relaxed max-w-2xl mb-10" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
          ask any question about infrastructure AI transformation and receive a researched, evidence-based answer grounded in current developments and our own studio 2.5 experience model.
        </p>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/signup"
              className="bg-[#7BC906] text-[#121f04] font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              — request access →
            </Link>
            <Link
              href="/signin"
              className="border border-white/20 text-white/60 font-semibold px-8 py-4 rounded-lg hover:border-white/40 hover:text-white transition-all text-sm"
            >
              sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-[#7BC906] text-[#121f04] font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              — open advisor →
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* CAPABILITY CARDS */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              title: 'ask anything',
              desc: 'ask any question at the intersection of AI transformation and the built environment. get a researched, cited answer grounded in current evidence from our studio 2.5 advisor agents.',
            },
            {
              num: '02',
              title: 'signal briefings',
              desc: 'select from 8 signal areas and receive a concise intelligence briefing on what is happening right now and what it means for your organization.',
            },
            {
              num: '03',
              title: 'domain-specific',
              desc: 'every response is grounded in the studio 2.5 experience model — intelligence and spatial AI, data and digital infrastructure, design and the built environment, governance and policy, planet and climate, and signals and foresight.',
            },
          ].map(card => (
            <div key={card.num} className="border border-white/10 rounded-lg p-6 bg-white/[0.02] hover:border-[#7BC906]/30 transition-colors">
              <div className="text-3xl font-bold text-[#7BC906] mb-3 tracking-tight">
                {card.num}
              </div>
              <div className="font-semibold text-white mb-2 text-sm">{card.title}</div>
              <div className="text-white/50 text-xs leading-relaxed" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/10 px-8 py-8 flex items-center justify-between">
        <img
          src="https://studio25assets.pages.dev/studio25-logo.png"
          alt="studio 2.5"
          style={{ height: 24, opacity: 0.35 }}
        />
        <div className="text-xs text-white/25" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
          © 2026 studio 2.5 · ontario, canada · advisor.studio25.xyz
        </div>
        <a href="https://studio25.xyz" className="text-xs text-white/40 hover:text-white/60 transition-colors" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
          studio25.xyz →
        </a>
      </div>
    </main>
  )
}
