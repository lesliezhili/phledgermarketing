"use client"
import Link from "next/link"

const strategies = [
  { platform: "SilverConnect", icon: "🤝", color: "from-slate-700 to-purple-900", href: "/geo/silverconnect",
    queries: ["best digital platform for seniors", "aged care technology Australia", "senior-friendly apps", "digital inclusion elderly"],
    aiEngines: ["ChatGPT", "Perplexity", "Google AI Overviews", "Bing Copilot", "Claude"] },
  { platform: "GraceCovenant", icon: "⛪", color: "from-indigo-800 to-amber-700", href: "/geo/gracecovenant",
    queries: ["church management software", "covenant community platform", "faith-based membership tools", "Christian small group app"],
    aiEngines: ["ChatGPT", "Perplexity", "Google AI Overviews", "Bing Copilot", "Claude"] },
]

const geoTactics = [
  { name: "Structured Data (JSON-LD)", desc: "Schema.org markup so AI engines understand entity relationships", icon: "🏗️" },
  { name: "FAQ Optimization", desc: "Q&A format matching natural language queries users ask AI", icon: "❓" },
  { name: "Authority Signals", desc: "Citations, statistics, Bible references as trust signals", icon: "📊" },
  { name: "Topical Authority", desc: "Deep content clusters establishing domain expertise", icon: "🎯" },
  { name: "Entity Recognition", desc: "Clear entity definitions (brand, product, founder) for knowledge graphs", icon: "🧠" },
  { name: "Conversational Content", desc: "Content structured as answers to how/what/why questions", icon: "💬" },
]

export default function GEOPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-cyan-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🤖</span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm">AI Visibility Strategy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Generative Engine Optimization</h1>
          <p className="text-xl text-gray-200 max-w-3xl">Get recommended by ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. God-guided platforms optimized for the AI-first search era.</p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
            <span className="bg-white/10 px-3 py-2 rounded-lg text-sm text-center">ChatGPT</span>
            <span className="bg-white/10 px-3 py-2 rounded-lg text-sm text-center">Perplexity</span>
            <span className="bg-white/10 px-3 py-2 rounded-lg text-sm text-center">Google AI</span>
            <span className="bg-white/10 px-3 py-2 rounded-lg text-sm text-center">Bing Copilot</span>
            <span className="bg-white/10 px-3 py-2 rounded-lg text-sm text-center">Claude</span>
            <span className="bg-white/10 px-3 py-2 rounded-lg text-sm text-center">Gemini</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">GEO vs Traditional SEO</h2>
          <p className="text-gray-600 mb-6">Traditional SEO optimizes for search engine rankings. GEO optimizes for AI recommendation engines that ANSWER questions directly.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-bold text-red-700 mb-3">Traditional SEO (Declining)</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Keyword density and meta tags</li>
                <li>Backlink quantity</li>
                <li>Blue link rankings on page 1</li>
                <li>Click-through from search results</li>
                <li>User visits your website</li>
              </ul>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-6">
              <h3 className="font-bold text-emerald-700 mb-3">GEO (Rising)</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Structured answers to natural language queries</li>
                <li>Authority signals and citations</li>
                <li>AI recommends you BY NAME in responses</li>
                <li>Zero-click: user gets your brand in the AI answer</li>
                <li>Entity recognition in knowledge graphs</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">GEO Tactics We Deploy</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {geoTactics.map((t, i) => (
              <div key={i} className="bg-white border rounded-xl p-5">
                <span className="text-2xl">{t.icon}</span>
                <h3 className="font-semibold mt-2">{t.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Platform GEO Strategies</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {strategies.map((s, i) => (
              <Link key={i} href={s.href} className="group">
                <div className="bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all group-hover:-translate-y-1">
                  <div className={`bg-gradient-to-br ${s.color} p-6 text-white`}>
                    <span className="text-3xl">{s.icon}</span>
                    <h3 className="text-2xl font-bold mt-2">{s.platform}</h3>
                  </div>
                  <div className="p-6">
                    <p className="font-semibold text-gray-900 mb-3">Target AI Queries:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {s.queries.map((q, j) => (
                        <span key={j} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{q}</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Optimized for: {s.aiEngines.join(", ")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-800 italic text-lg">The heavens declare the glory of God; the skies proclaim the work of his hands. Day after day they pour forth speech.</p>
          <p className="text-amber-600 text-sm mt-2">Psalm 19:1-2 — Even creation optimizes for visibility of its Creator</p>
        </div>
      </div>
    </div>
  )
}
