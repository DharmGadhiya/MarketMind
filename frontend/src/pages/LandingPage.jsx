import { Link } from "react-router-dom";
import { useTheme } from "../services/ThemeContext";
import {
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Activity,
  Database,
  Lock,
  ShieldCheck,
  LineChart,
  Briefcase,
  ChevronRight,
  Layers,
  Users,
  Compass,
  Bell
} from "lucide-react";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 grid-bg relative overflow-x-hidden">
      {/* Background radial glow accents matching index.css */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-bull/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-electric/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full glass transition-colors duration-300">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl text-text-0 tracking-tight select-none">
              MarketMind
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-strong bg-bg-1 text-text-1 hover:bg-bg-2 transition-colors cursor-pointer active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-bull/30 bg-bull/10 hover:bg-bull/20 text-bull font-bold text-xs px-4 py-2 transition-all cursor-pointer active:scale-95"
            >
              Enter Terminal <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-[1400px] px-6 pt-20 pb-16 md:pt-32 md:pb-24 lg:px-10 flex flex-col items-center text-center relative z-10">
        {/* Event context tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6 rise-up">
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full bg-bull/10 text-bull border border-bull/20 font-bold">
            INNOVA HACK — CHAPTER 1
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full bg-electric/10 text-electric border border-electric/20 font-bold">
            OPEN INNOVATION
          </span>
        </div>

        {/* Project Name and tagline */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-text-0 tracking-tight leading-none mb-6 rise-up">
          MarketMind
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-text-2 max-w-2xl font-light leading-relaxed mb-10 rise-up font-sans">
          A Nifty 50-focused financial news feed & AI-powered research terminal designed to bridge the intelligence gap for retail investors.
        </p>

        {/* Primary CTA */}
        <div className="rise-up">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-bull hover:bg-bull/90 text-white font-bold text-base px-8 py-4 shadow-lg shadow-bull/20 hover:shadow-xl hover:shadow-bull/30 transition-all hover:scale-105 active:scale-95 cursor-pointer font-sans"
          >
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* PROBLEM STATEMENT SECTION */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 md:py-20 lg:px-10 relative z-10">
        <div className="glass rounded-2xl border border-border-strong overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] transition-colors duration-300">
          <div className="bg-bg-2 border-b md:border-b-0 md:border-r border-border-strong p-8 flex flex-col justify-center gap-2 transition-colors">
            <span className="font-mono text-[10px] uppercase tracking-widest text-bear font-bold">
              THE CONTEXT
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-0 leading-tight">
              The Analysis Gap
            </h2>
          </div>
          <div className="p-8 sm:p-12 flex items-center bg-bg-1/40">
            <p className="text-base sm:text-lg leading-relaxed text-text-1 font-sans font-light">
              Financial news apps push notification triggers, but actual deep analysis sits locked behind expensive institutional subscriptions. Retail investors are forced to manually stitch together market news, stock valuations, and community sentiment across a dozen chaotic browser tabs—by which point the window of opportunity has already passed.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTION STATEMENT SECTION */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 md:py-20 lg:px-10 relative z-10">
        <div className="glass rounded-2xl border border-border-strong overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] transition-colors duration-300">
          <div className="bg-bg-2 border-b md:border-b-0 md:border-r border-border-strong p-8 flex flex-col justify-center gap-2 transition-colors">
            <span className="font-mono text-[10px] uppercase tracking-widest text-bull font-bold">
              THE METHOD
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-0 leading-tight">
              Intelligence Curation
            </h2>
          </div>
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-bg-1/40 gap-4">
            <p className="text-base sm:text-lg leading-relaxed text-text-1 font-sans font-light">
              MarketMind bridges this divide by pulling live news and real-time Nifty 50 stock quotes into a single unified workspace, feeding every article through an automated Gemini-powered research pipeline.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-text-2 font-sans font-light">
              Every story arrives pre-curated with structured sentiment scores, market impact maps, asset fundamentals, core risk vectors, and outlook summaries—free, instant, and grounded in real scraped data rather than general AI training memory.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SHOWCASE SECTION */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-28 lg:px-10 relative z-10">
        <div className="text-center mb-16">
          <span className="font-mono text-[10px] uppercase tracking-widest text-bull font-bold">
            CAPABILITIES
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 mt-2">
            Terminal Architecture
          </h2>
          <p className="text-sm text-text-2 mt-3 max-w-md mx-auto">
            A comprehensive suite of institutional tools tailored for retail stock traders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-bull/10 text-bull flex items-center justify-center border border-bull/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">AI Research Terminal</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Generative AI extracts sentiment, index/sector impact matrices, core risk profiles, and outlook projections for every story.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center border border-electric/20">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Live Index Ticker</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Track Nifty 50 stock values and percentages in real time with an integrated top scrolling marquee tape.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-amber/10 text-amber flex items-center justify-center border border-amber/20">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Market Pulse Sidebar</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Stay updated with dynamic daily top gainers and losers panels alongside instant autocomplete stock search features.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-bull/10 text-bull flex items-center justify-center border border-bull/20">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Watchlist & Price Alerts</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Add target tickers to your watchlist and trigger customized email notifications when prices exceed target thresholds.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center border border-electric/20">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">P&L Portfolio Tracker</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Log purchases and sells for all NSE assets. Auto-calculates weighted average price buys and handles full liquidations.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-amber/10 text-amber flex items-center justify-center border border-amber/20">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Entity-Level Sentiment</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Automated NLP scanning extracts mentioned stocks and displays granular sentiment values next to mapped news reports.
              </p>
            </div>
          </div>

          {/* Card 7 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-bull/10 text-bull flex items-center justify-center border border-bull/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Grounded AI Chatbot</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Initiate live conversation chats with the AI assistant, grounded in context for each parsed news report.
              </p>
            </div>
          </div>

          {/* Card 8 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center border border-electric/20">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">IPO Listings Center</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Active calendar tracking public issues, timeline periods, price band ranges, and subscription statuses.
              </p>
            </div>
          </div>

          {/* Card 9 */}
          <div className="glass card-lift rounded-2xl p-6 flex flex-col gap-4 border border-border-custom bg-bg-1/30">
            <div className="h-10 w-10 rounded-xl bg-amber/10 text-amber flex items-center justify-center border border-amber/20">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Corporate Filings Hub</h3>
              <p className="text-xs text-text-2 leading-relaxed">
                Track live corporate filings, board meeting details, dividend declarations, and official exchange notifications in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="mx-auto max-w-[1000px] px-6 py-16 md:py-24 lg:px-10 relative z-10 text-center">
        <span className="font-mono text-[10px] uppercase tracking-widest text-bull font-bold">
          DEVELOPED BY
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-0 mt-2 mb-12">
          Team 5star
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Dharm Gadhiya",
            "Veer Tejani",
            "Tanuj Kanetiya",
            "Anurag Pillai"
          ].map((name, idx) => (
            <div
              key={idx}
              className="glass rounded-xl border border-border-strong px-4 py-6 bg-bg-1/40 flex items-center justify-center transition-colors duration-300"
            >
              <div className="flex flex-col items-center gap-2">
                <Users size={16} className="text-text-3" />
                <span className="font-sans font-bold text-xs sm:text-sm text-text-1">
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING / FOOTER SECTION */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10 text-center relative z-10 border-t border-border-custom">
        <h2 className="font-serif text-3xl sm:text-5xl text-text-0 mb-6">
          Access the Terminal
        </h2>
        <p className="text-sm text-text-2 mb-10 max-w-sm mx-auto leading-relaxed">
          Open the terminal workspace to access real-time financial tracking and AI analysis pipelines.
        </p>

        <Link
          to="/app"
          className="inline-flex items-center gap-2 rounded-xl bg-bull hover:bg-bull/90 text-white font-bold text-base px-8 py-4 shadow-lg shadow-bull/20 hover:shadow-xl hover:shadow-bull/30 transition-all hover:scale-105 active:scale-95 cursor-pointer mb-20 font-sans"
        >
          Get Started <ArrowRight size={18} />
        </Link>

        {/* Small hackathon footer credit */}
        <div className="mt-12 text-center flex flex-col items-center gap-1.5 border-t border-border-custom pt-8">
          <div className="flex items-center gap-3">
            <span className="font-serif text-base text-text-0 select-none">
              MarketMind
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-3">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="font-mono text-[9px] text-text-3 uppercase tracking-widest mt-1">
            INNOVA HACK — CHAPTER 1 • Team 5star
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
