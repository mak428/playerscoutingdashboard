import Link from "next/link";

const features = [
  {
    href: "/archetypes",
    icon: "🧬",
    title: "Player Archetypes",
    description:
      "Discover every player's ideal tactical role — GK, Defender, Midfielder, or Forward — identified using K-Means clustering on FBRef statistics.",
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-700/50 hover:border-emerald-500",
  },
  {
    href: "/market-value",
    icon: "📈",
    title: "Transfer Market Value",
    description:
      "View 5-year transfer market value predictions for every player, powered by an ensemble model combining Exponential Smoothing, Linear Regression, SARIMA, and Prophet.",
    color: "from-blue-600 to-indigo-600",
    border: "border-blue-700/50 hover:border-blue-500",
  },
  {
    href: "/tactical-fit",
    icon: "🎯",
    title: "Tactical System Fit",
    description:
      "See how well each player fits different tactical systems — Tiki-Taka, Gegenpressing, Low Block, and Wing Play — using multi-label classification and rule-based scoring.",
    color: "from-purple-600 to-pink-600",
    border: "border-purple-700/50 hover:border-purple-500",
  },
  {
    href: "/shortlist",
    icon: "📋",
    title: "Player Shortlist",
    description:
      "Build your personal shortlist of players you're tracking. Add players from any page and compare them side by side.",
    color: "from-orange-600 to-amber-600",
    border: "border-orange-700/50 hover:border-orange-500",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center pt-8 pb-4 space-y-4">
        <div className="text-6xl">⚽</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Interactive Soccer Dashboard
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Advanced analytics for the Top 5 European Leagues — archetypes, market value forecasts,
          tactical fit scores, and your personal shortlist.
        </p>
        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
            Premier League
          </span>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
            La Liga
          </span>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
            Bundesliga
          </span>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
            Serie A
          </span>
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full">
            Ligue 1
          </span>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {features.map(({ href, icon, title, description, color, border }) => (
          <Link
            key={href}
            href={href}
            className={`group bg-slate-900 border ${border} rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40`}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                {title}
              </h2>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>
            </div>
            <span className="mt-auto text-sm text-slate-500 group-hover:text-emerald-400 transition-colors font-medium">
              Explore →
            </span>
          </Link>
        ))}
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Players", value: "2,500+" },
          { label: "Leagues", value: "5" },
          { label: "Archetypes", value: "30+" },
          { label: "Forecast Horizon", value: "5 Years" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-extrabold text-emerald-400">{value}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
