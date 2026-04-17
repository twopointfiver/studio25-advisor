import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="font-marker text-2xl text-[#7BC906]" style={{fontFamily: 'Ruthie, cursive'}}>
          studio 2.5
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
            >
              sign in
            </Link>
            <Link
              href="/sign-up"
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
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-[#7BC906]/10 border border-[#7BC906]/30 rounded-full px-4 py-2 mb-10">
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
          real-time research intelligence and strategic advisory for executives navigating AI transformation in airports, transit, utilities, and capital infrastructure programs.
        </p>
        <p className="text-base text-white/40 leading-relaxed max-w-2xl mb-12" style={{fontFamily: 'Hedvig Letters Serif, serif'}}>
          ask any question about infrastructure AI transformation and receive a researched, evidence-based answer grounded in current developments — not generic AI output.
        </p>

        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-up"
              className="bg-[#7BC906] text-[#121f04] font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              — request access →
            </Link>
            <Link
              href="/sign-in"
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
              title: 'strategic Q&A',
              desc: 'ask any question about infrastructure AI transformation. get a researched, cited answer grounded in current evidence — not generic output.',
            },
            {
              num: '02',
              title: 'signal briefings',
              desc: 'select from 8 signal areas and receive a concise intelligence briefing on what is happening right now and what it means for your organization.',
            },
            {
              num: '03',
              title: 'domain-specific',
              desc: 'every response is grounded in the studio 2.5 advisory framework — infrastructure AI, digital twins, lifecycle intelligence, and governance.',
            },
          ].map(card => (
            <div key={card.num} className="border border-white/10 rounded-lg p-6 bg-white/[0.02] hover:border-[#7BC906]/30 transition-colors">
              <div className="font-marker text-3xl text-[#7BC906] mb-3" style={{fontFamily: 'Ruthie, cursive'}}>
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
        <div className="font-marker text-xl text-[#7BC906]/40" style={{fontFamily: 'Ruthie, cursive'}}>studio 2.5</div>
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
