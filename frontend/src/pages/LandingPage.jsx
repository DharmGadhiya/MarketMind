import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../services/ThemeContext";
import { useUser } from "../services/UserContext";
import TickerTape from "../components/TickerTape";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Globe,
  Layers,
  LineChart,
  Lock,
  MessageSquareCode,
  Moon,
  PieChart,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  // Interactive tab for the AI Engine demo
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [activeEcosystemTab, setActiveEcosystemTab] = useState("all");

  // Auto-cycle through the AI pipeline steps to make the engine feel alive
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePipelineStep((prev) => (prev + 1) % 6);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const pipelineSteps = [
    {
      id: "news",
      step: "01",
      label: "NEWS INGESTION",
      title: "Real-Time News Stream",
      desc: "Instant web scraping & API ingestion across NSE corporate filings and financial news wires.",
      badge: "LIVE FEED",
      badgeColor: "bull",
    },
    {
      id: "entity",
      step: "02",
      label: "ENTITY EXTRACTION",
      title: "Multi-Company NLP Parser",
      desc: "Isolates tickers, parent conglomerates, subsidiaries, and key executives Mentioned in text.",
      badge: "NLP VECTOR",
      badgeColor: "electric",
    },
    {
      id: "sentiment",
      step: "03",
      label: "SENTIMENT MATRIX",
      title: "Granular Entity Scoring",
      desc: "Assigns directional sentiment (-1.0 to +1.0) per isolated entity, avoiding single-score bias.",
      badge: "MATH MODEL",
      badgeColor: "amber",
    },
    {
      id: "impact",
      step: "04",
      label: "MARKET IMPACT",
      title: "Sector & Macro Spillover",
      desc: "Maps supply-chain dependencies, sector basket correlations, and Nifty 50 index weightage.",
      badge: "CORRELATION",
      badgeColor: "bull",
    },
    {
      id: "risk",
      step: "05",
      label: "RISK RADAR",
      title: "Downside & Volatility Vectors",
      desc: "Evaluates capex leverage, regulatory compliance, valuation multiples, and liquidity constraints.",
      badge: "DEFENSE",
      badgeColor: "bear",
    },
    {
      id: "report",
      step: "06",
      label: "AI SYNTHESIS",
      title: "Context-Grounded Report",
      desc: "Generates structured institutional briefings with statutory citations and actionable outlook.",
      badge: "GEMINI 3.1",
      badgeColor: "electric",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 grid-bg relative overflow-x-hidden selection:bg-bull selection:text-white">
      {/* Background radial glow accents */}
      <div className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] bg-bull/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] right-[-5%] w-[40vw] h-[40vw] bg-electric/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] left-[-8%] w-[40vw] h-[40vw] bg-amber/4 rounded-full blur-[160px] pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          00 — TOP NAVIGATION BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full glass border-b border-border-custom transition-colors duration-300">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3 select-none">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-border-strong bg-gradient-to-br from-[#0a8c5b] to-[#064a30] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-white font-bold">
                M
              </div>
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-bull pulse-dot" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-text-0 transition-colors">
                  MarketMind
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold border border-bull/20">
                  v2.4
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-2 transition-colors">
                Financial Intelligence Terminal
              </span>
            </div>
          </Link>

          {/* Center Navigation Shortcuts (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-[12px] font-mono text-text-2">
            <a
              href="#ecosystem"
              className="px-3 py-1.5 rounded-lg hover:text-text-0 hover:bg-bg-1/80 transition-colors"
            >
              Ecosystem
            </a>
            <a
              href="#ai-engine"
              className="px-3 py-1.5 rounded-lg hover:text-text-0 hover:bg-bg-1/80 transition-colors"
            >
              AI Engine
            </a>
            <a
              href="#portfolio"
              className="px-3 py-1.5 rounded-lg hover:text-text-0 hover:bg-bg-1/80 transition-colors"
            >
              Portfolio
            </a>
            <a
              href="#ipo-filings"
              className="px-3 py-1.5 rounded-lg hover:text-text-0 hover:bg-bg-1/80 transition-colors"
            >
              IPO & Filings
            </a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-border-custom bg-bg-1/60 font-mono text-[10px] text-text-2">
              <span className="h-1.5 w-1.5 rounded-full bg-bull pulse-dot" />
              <span>NSE LIVE</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-strong bg-bg-1 text-text-1 hover:bg-bg-2 hover:text-text-0 transition-colors cursor-pointer active:scale-95 shadow-sm"
              aria-label="Toggle visual theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Primary CTA */}
            <Link
              to="/app"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-bull/30 bg-bull hover:bg-bull/90 text-white font-sans font-bold text-xs px-4 py-2 shadow-sm shadow-bull/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {user ? "Open Terminal" : "Launch Terminal"} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          01 — HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 pt-12 pb-8 md:pt-16 md:pb-12 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Institutional Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-strong bg-bg-1 shadow-sm mb-5 rise-up">
            <span className="h-2 w-2 rounded-full bg-bull pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-1 font-semibold">
              Real-Time Financial Intelligence Terminal
            </span>
            <span className="text-text-3 font-mono text-[10px]">•</span>
            <span className="font-mono text-[10px] text-text-2">NSE & NIFTY 50</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl headline-tight text-text-0 tracking-tight mb-5 rise-up">
            Market Intelligence, <br className="hidden sm:inline" />
            <span className="italic font-serif text-bull">Powered by Data & AI.</span>
          </h1>

          {/* Short Supporting Line */}
          <p className="font-sans text-base sm:text-lg md:text-xl text-text-1 max-w-2xl font-light leading-relaxed mb-8 rise-up">
            Live markets, financial news, AI research, portfolio intelligence, and corporate filings — unified in one high-performance terminal.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 rise-up">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-bull hover:bg-bull/90 text-white font-sans font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 shadow-lg shadow-bull/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Enter Terminal <ArrowRight size={17} />
            </Link>

            <a
              href="#ecosystem"
              className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-bg-1 hover:bg-bg-2 text-text-0 font-sans font-semibold text-sm sm:text-base px-6 py-3.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Layers size={16} className="text-text-2" />
              Explore Ecosystem
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02 — LIVE MARKET TAPE
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full py-2">
        <TickerTape />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03 — THE MARKETMIND ECOSYSTEM
      ───────────────────────────────────────────────────────────── */}
      <section id="ecosystem" className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-24 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <Layers size={12} /> THE MARKETMIND ECOSYSTEM
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 tracking-tight">
            Institutional Modules. Unified Workflow.
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            Every layer designed to turn raw market noise into structured, tradeable intelligence.
          </p>
        </div>

        {/* 8 Compact Ecosystem Panels with UI Previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. AI Research */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-bull/10 text-bull flex items-center justify-center border border-bull/20">
                  <Sparkles size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-bull/10 text-bull font-bold">
                  AI Pipeline
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">AI Research</h3>
              <p className="font-mono text-[11px] text-bull font-semibold mt-0.5">
                Sentiment · Impact · Risk · Outlook
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-3">Sentiment</span>
                <span className="text-bull font-bold">+0.74 Bullish</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Sector Impact</span>
                <span className="text-text-0 font-medium">Energy High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Risk Vector</span>
                <span className="text-amber font-medium">Moderate</span>
              </div>
            </div>
          </div>

          {/* 2. Market Pulse */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-electric/10 text-electric flex items-center justify-center border border-electric/20">
                  <Activity size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-electric/10 text-electric font-bold">
                  Live Tape
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">Market Pulse</h3>
              <p className="font-mono text-[11px] text-electric font-semibold mt-0.5">
                Gainers · Losers · Live Search
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">BHARTIARTL</span>
                <span className="text-bull font-bold">▲ +1.85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">TCS</span>
                <span className="text-bear font-bold">▼ -0.37%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">INFY</span>
                <span className="text-bull font-bold">▲ +0.91%</span>
              </div>
            </div>
          </div>

          {/* 3. Watchlist & Alerts */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-amber/10 text-amber flex items-center justify-center border border-amber/20">
                  <Bell size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-amber/10 text-amber font-bold">
                  Alert Trigger
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">Watchlist & Alerts</h3>
              <p className="font-mono text-[11px] text-amber font-semibold mt-0.5">
                Targets · Email Alerts · Triggers
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">HDFCBANK</span>
                <span className="text-text-2">Target ₹1,650</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Status</span>
                <span className="text-amber font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber pulse-dot" /> ARMED
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Delivery</span>
                <span className="text-bull font-medium">Instant Email</span>
              </div>
            </div>
          </div>

          {/* 4. Portfolio Intelligence */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-bull/10 text-bull flex items-center justify-center border border-bull/20">
                  <Briefcase size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-bull/10 text-bull font-bold">
                  P&L Engine
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">Portfolio</h3>
              <p className="font-mono text-[11px] text-bull font-semibold mt-0.5">
                Holdings · Avg. Price · Live P&L
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-3">Unrealised P&L</span>
                <span className="text-bull font-bold">+₹48,250 (+14.2%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Invested Capital</span>
                <span className="text-text-0 font-semibold">₹3,40,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Positions</span>
                <span className="text-text-0 font-medium">8 Equities</span>
              </div>
            </div>
          </div>

          {/* 5. Entity Sentiment */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-electric/10 text-electric flex items-center justify-center border border-electric/20">
                  <Compass size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-electric/10 text-electric font-bold">
                  Granular NLP
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">Entity Sentiment</h3>
              <p className="font-mono text-[11px] text-electric font-semibold mt-0.5">
                Company Detection · Entity Polarity
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">RELIANCE</span>
                <span className="text-bull font-bold">+0.82 Bullish</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">ONGC</span>
                <span className="text-bear font-bold">-0.21 Bearish</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">JIO</span>
                <span className="text-bull font-bold">+0.54 Bullish</span>
              </div>
            </div>
          </div>

          {/* 6. Context-Grounded AI Assistant */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-bull/10 text-bull flex items-center justify-center border border-bull/20">
                  <MessageSquareCode size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-bull/10 text-bull font-bold">
                  Statutory AI
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">AI Assistant</h3>
              <p className="font-mono text-[11px] text-bull font-semibold mt-0.5">
                Context-Grounded Research Chat
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-sans text-[10px] flex flex-col gap-1.5">
              <div className="bg-bg-1 p-1.5 rounded-lg border border-border-custom text-text-2">
                "How does capex alter EBITDA leverage?"
              </div>
              <div className="bg-bull/10 p-1.5 rounded-lg text-bull font-medium">
                "Clause 4.2 indicates leverage capped at 1.4x."
              </div>
            </div>
          </div>

          {/* 7. IPO Intelligence */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-amber/10 text-amber flex items-center justify-center border border-amber/20">
                  <Flame size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-amber/10 text-amber font-bold">
                  Primary Market
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">IPO Intelligence</h3>
              <p className="font-mono text-[11px] text-amber font-semibold mt-0.5">
                Calendar · Price Band · Subscription
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold truncate max-w-[100px]">Hexagon Tech</span>
                <span className="text-bull font-bold">18.4x Sub</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Price Band</span>
                <span className="text-text-0">₹450 - ₹475</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Status</span>
                <span className="text-bull font-bold">ACTIVE ISSUE</span>
              </div>
            </div>
          </div>

          {/* 8. Corporate Intelligence */}
          <div className="glass card-lift rounded-2xl p-5 border border-border-custom bg-bg-1/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="h-8 w-8 rounded-lg bg-electric/10 text-electric flex items-center justify-center border border-electric/20">
                  <FileText size={16} />
                </span>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-electric/10 text-electric font-bold">
                  NSE Filings
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-text-0">Corporate Intelligence</h3>
              <p className="font-mono text-[11px] text-electric font-semibold mt-0.5">
                Filings · Boards · Dividends
              </p>
            </div>

            {/* Mini UI Preview */}
            <div className="mt-4 p-3 rounded-xl bg-bg-0/60 border border-border-custom font-mono text-[10px] flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-text-0 font-bold">TATA MOTORS</span>
                <span className="text-bull font-bold">₹6.00 Dividend</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Filing Type</span>
                <span className="text-text-0">Board Meeting</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3">Receipt Time</span>
                <span className="text-text-2">10:45 AM Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          04 — AI RESEARCH ENGINE (VISUAL PIPELINE + PREVIEW)
      ───────────────────────────────────────────────────────────── */}
      <section id="ai-engine" className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-24 lg:px-10 border-t border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <Cpu size={12} /> THE AI RESEARCH ENGINE
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 tracking-tight">
            How Raw News Becomes Investment Alpha
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            Every article is automatically disassembled through an end-to-end multi-step algorithmic pipeline.
          </p>
        </div>

        {/* Visual Pipeline Horizontal Flow */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {pipelineSteps.map((step, idx) => {
            const isActive = activePipelineStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActivePipelineStep(idx)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-bull bg-bull/10 shadow-lg shadow-bull/10 scale-[1.02]"
                    : "border-border-custom bg-bg-1/40 hover:bg-bg-1 hover:border-border-strong"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? "text-bull" : "text-text-3"
                    }`}
                  >
                    {step.step}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-bull pulse-dot" : "bg-text-3"
                    }`}
                  />
                </div>
                <div className="font-mono text-[10px] font-bold text-text-0 leading-tight">
                  {step.label}
                </div>
                <div className="text-[11px] text-text-2 font-sans mt-1 line-clamp-1">
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase + Realistic AI Report Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Active Stage Detail (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-border-strong bg-bg-1 p-6 sm:p-8 flex flex-col justify-between glass">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-xs font-bold text-bull px-2 py-0.5 rounded bg-bull/10 border border-bull/20">
                  PIPELINE STAGE {pipelineSteps[activePipelineStep].step} OF 06
                </span>
                <span className="font-mono text-[10px] uppercase text-text-3">AUTOMATED CRON</span>
              </div>

              <h3 className="font-serif text-3xl font-bold text-text-0 mb-3">
                {pipelineSteps[activePipelineStep].title}
              </h3>

              <p className="font-sans text-sm sm:text-base text-text-1 leading-relaxed font-light mb-6">
                {pipelineSteps[activePipelineStep].desc}
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-text-1">
                  <CheckCircle2 size={14} className="text-bull shrink-0" />
                  <span>Sub-second execution with zero hallucination guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-text-1">
                  <CheckCircle2 size={14} className="text-bull shrink-0" />
                  <span>Normalized sentiment distribution on [-1.0, +1.0] interval</span>
                </div>
                <div className="flex items-center gap-2 text-text-1">
                  <CheckCircle2 size={14} className="text-bull shrink-0" />
                  <span>Grounded against Yahoo Finance real-time valuation multiples</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-border-custom flex items-center justify-between">
              <span className="font-mono text-[11px] text-text-3">
                MODEL: GEMINI 3.1 FLASH-LITE
              </span>
              <Link
                to="/app"
                className="font-mono text-xs font-bold text-bull hover:underline flex items-center gap-1"
              >
                Inspect Live Stream <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right: Realistic Structured AI Report Output (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-border-strong bg-bg-1 overflow-hidden shadow-xl glass">
            {/* Report Header */}
            <div className="border-b border-border-custom bg-bg-2/70 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-bull" />
                <span className="font-mono text-xs font-bold text-text-0">
                  AI INTELLIGENCE MEMO // RELIANCE.NS
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-text-3">EXECUTION: 412ms</span>
                <span className="h-1 w-1 rounded-full bg-text-3" />
                <span className="text-bull font-bold">CONFIDENCE: 96%</span>
              </div>
            </div>

            {/* Report Body */}
            <div className="p-6 flex flex-col gap-5">
              {/* Event Summary */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-3 font-semibold">
                  01 // EVENT SYNTHESIS
                </span>
                <h4 className="font-serif text-xl font-bold text-text-0 mt-0.5 mb-1.5">
                  Green Hydrogen Joint Venture Outlay & Capital Allocation
                </h4>
                <p className="font-sans text-xs sm:text-sm text-text-1 leading-relaxed">
                  Reliance Industries announced an initial ₹14,000 Cr capital deployment into renewable energy electrolysis infrastructure. Structured through 65% internal cash flow generation and 35% syndicated green debt tranches.
                </p>
              </div>

              {/* Metric Matrix Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom font-mono">
                  <div className="text-[10px] text-text-3 uppercase">Sentiment</div>
                  <div className="text-sm font-bold text-bull mt-0.5">+0.72 Bullish</div>
                </div>
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom font-mono">
                  <div className="text-[10px] text-text-3 uppercase">Sector Impact</div>
                  <div className="text-sm font-bold text-text-0 mt-0.5">High Catalysis</div>
                </div>
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom font-mono">
                  <div className="text-[10px] text-text-3 uppercase">Downside Risk</div>
                  <div className="text-sm font-bold text-amber mt-0.5">Medium / Capex</div>
                </div>
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom font-mono">
                  <div className="text-[10px] text-text-3 uppercase">12M Outlook</div>
                  <div className="text-sm font-bold text-bull mt-0.5">Overweight</div>
                </div>
              </div>

              {/* Strategic Insights */}
              <div className="border-t border-border-custom pt-4 flex flex-col gap-3 font-sans text-xs">
                <div className="flex gap-2">
                  <span className="font-mono font-bold text-bull shrink-0">EXISTING:</span>
                  <span className="text-text-1">
                    Hold position. Balance sheet absorption capacity remains robust with Net Debt/EBITDA at 1.4x.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono font-bold text-electric shrink-0">PROSPECTIVE:</span>
                  <span className="text-text-1">
                    Favorable accumulation zone near ₹2,920–₹2,950 prior to quarterly earnings disclosure.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          05 — MARKET TERMINAL (DASHBOARD-STYLE COMPOSITION)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-24 lg:px-10 border-t border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <Terminal size={12} /> MARKET TERMINAL
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 tracking-tight">
            Multiple Intelligence Layers. Single View.
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            No fragmented browser tabs. Live stocks, curated news, AI evaluations, watchlists, and portfolio metrics synchronized side-by-side.
          </p>
        </div>

        {/* 5-Panel Mosaic Terminal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Panel 1: Market Pulse (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-border-strong bg-bg-1 p-5 shadow-sm flex flex-col justify-between glass">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-bull" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                    MARKET PULSE
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold">
                  LIVE QUOTES
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { sym: "BHARTIARTL", price: "1,620.00", pct: "+1.85%", up: true },
                  { sym: "RELIANCE", price: "2,984.60", pct: "+1.42%", up: true },
                  { sym: "INFY", price: "1,842.15", pct: "+0.91%", up: true },
                  { sym: "TCS", price: "4,192.40", pct: "-0.37%", up: false },
                  { sym: "TATAMOTORS", price: "1,048.20", pct: "-0.82%", up: false },
                ].map((item) => (
                  <div
                    key={item.sym}
                    className="flex items-center justify-between p-2 rounded-lg bg-bg-0/60 font-mono text-xs"
                  >
                    <span className="font-bold text-text-0">{item.sym}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-text-1">₹{item.price}</span>
                      <span
                        className={`font-bold ${
                          item.up ? "text-bull" : "text-bear"
                        }`}
                      >
                        {item.pct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-custom flex justify-between font-mono text-[10px] text-text-3">
              <span>Auto-refresh: 30s</span>
              <Link to="/nifty50" className="text-bull hover:underline font-semibold">
                NIFTY 50 Matrix →
              </Link>
            </div>
          </div>

          {/* Panel 2: Live Financial News + Entity Badges (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-border-strong bg-bg-1 p-5 shadow-sm flex flex-col justify-between glass">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-electric" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                    CURATED NEWS
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-electric/10 text-electric font-bold">
                  NLP PARSED
                </span>
              </div>

              <div className="space-y-3 font-sans">
                <div className="p-2.5 rounded-xl bg-bg-0/60 border border-border-custom flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-[9px] text-text-3">
                    <span className="text-bull font-semibold">REUTERS</span>
                    <span>12m ago</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-text-0 line-clamp-2">
                    RBI Keeps Repo Rate Unchanged at 6.5%; Inflation Target on Track
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                    <span className="px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold">
                      BANKING: +0.65
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-bg-2 text-text-2">
                      MACRO IMPACT
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-bg-0/60 border border-border-custom flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-[9px] text-text-3">
                    <span className="text-bull font-semibold">BLOOMBERG</span>
                    <span>34m ago</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-text-0 line-clamp-2">
                    Tata Power Wins ₹1,200 Cr Transmission Corridor Project in Gujarat
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                    <span className="px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold">
                      TATAPOWER: +0.88
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-custom flex justify-between font-mono text-[10px] text-text-3">
              <span>Streaming 24/7</span>
              <Link to="/app" className="text-electric hover:underline font-semibold">
                Open Terminal Feed →
              </Link>
            </div>
          </div>

          {/* Panel 3: Watchlist & Portfolio Snapshot (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-border-strong bg-bg-1 p-5 shadow-sm flex flex-col justify-between glass">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-amber" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                    PORTFOLIO & WATCHLIST
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold">
                  P&L: +14.2%
                </span>
              </div>

              {/* Portfolio Snippet */}
              <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom mb-3 font-mono text-xs">
                <div className="flex justify-between text-text-3 text-[10px] mb-1">
                  <span>NET UNREALISED GAINS</span>
                  <span className="text-bull font-bold">ACTIVE</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-bull">+₹48,250.00</span>
                  <span className="text-[11px] text-text-2">Capital: ₹3.4L</span>
                </div>
              </div>

              {/* Watchlist Alerts */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-0/40">
                  <span className="font-bold text-text-0">RELIANCE</span>
                  <span className="text-text-1">₹2,984.60</span>
                  <span className="text-bull font-bold">Target ₹3,050</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-bg-0/40">
                  <span className="font-bold text-text-0">INFY</span>
                  <span className="text-text-1">₹1,842.15</span>
                  <span className="text-amber font-bold">Target ₹1,800</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-custom flex justify-between font-mono text-[10px] text-text-3">
              <span>Email Triggers Active</span>
              <Link to="/portfolio" className="text-amber hover:underline font-semibold">
                Manage Portfolio →
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* ─────────────────────────────────────────────────────────────
          07 — GROUNDED AI CHAT
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-24 lg:px-10 border-t border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <MessageSquareCode size={12} /> CONTEXT-GROUNDED AI
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 tracking-tight">
            Research Assistant Tied Directly to Statutory Data
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            Ask any financial question. The AI answers strictly using parsed news narratives, regulatory filings, and audited numbers.
          </p>
        </div>

        {/* Realistic Interactive Terminal Chat Preview */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-border-strong bg-bg-1 shadow-2xl overflow-hidden glass">
          {/* Chat Window Top Bar */}
          <div className="border-b border-border-custom bg-bg-2/80 px-4 py-3 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-bull pulse-dot" />
              <span className="font-bold text-text-0">MARKETMIND RESEARCH COPILOT</span>
            </div>
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-bull/10 text-bull font-bold border border-bull/20">
              CONTEXT-GROUNDED ANALYSIS
            </span>
          </div>

          {/* Context Banner */}
          <div className="bg-bg-0/80 border-b border-border-custom px-4 py-2 flex items-center justify-between font-mono text-[10px] text-text-2">
            <span>Context Anchor: Reliance Industries FY26 Hydrogen Transition Briefing</span>
            <span className="text-bull font-bold">Citations: Active</span>
          </div>

          {/* Message Stream */}
          <div className="p-5 sm:p-6 space-y-4 font-sans text-xs sm:text-sm">
            {/* User Bubble */}
            <div className="flex items-start justify-end gap-3">
              <div className="max-w-lg rounded-2xl rounded-tr-sm bg-bull text-white p-3.5 shadow-sm">
                <p className="font-medium">
                  "How could this green hydrogen outlay affect Reliance’s net debt-to-EBITDA covenants in the upcoming fiscal year?"
                </p>
                <div className="mt-1 font-mono text-[9px] text-white/70 text-right">
                  Investor Query · 11:42 AM
                </div>
              </div>
            </div>

            {/* AI Assistant Bubble */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-bull/10 text-bull flex items-center justify-center border border-bull/20 shrink-0 font-serif font-bold text-base">
                M
              </div>
              <div className="max-w-xl rounded-2xl rounded-tl-sm bg-bg-0 border border-border-custom p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-mono text-[10px]">
                  <span className="text-bull font-bold">MARKETMIND INTELLIGENCE</span>
                  <span className="text-text-3">•</span>
                  <span className="text-text-3">Statutory Filing Clause 4.2 Verified</span>
                </div>
                <p className="text-text-1 leading-relaxed mb-3">
                  The report indicates the ₹14,000 Cr outlay is phased over 24 months, with 65% financed through internal accruals. Consequently, Net Debt-to-EBITDA expands marginally from 1.34x to 1.41x, remaining comfortably below the 2.50x covenant ceiling.
                </p>

                {/* Statutory Citations Footer */}
                <div className="p-2.5 rounded-lg bg-bg-1 border border-border-custom font-mono text-[10px] text-text-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-bull font-bold">
                    <ShieldCheck size={12} /> Statutory Sources Inspected:
                  </div>
                  <div className="text-text-3">
                    1. NSE Disclosure Ref #NSE/2026/0821-B
                  </div>
                  <div className="text-text-3">
                    2. Q2 Audited Balance Sheet Notes (Section 7: Capex & Guarantees)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fake Input Row */}
          <div className="border-t border-border-custom bg-bg-2/50 p-3 sm:p-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value="Query the terminal on valuation impact, multiples, or competitor risk..."
              className="flex-1 rounded-xl border border-border-custom bg-bg-0 px-4 py-2.5 text-xs text-text-3 font-sans outline-none cursor-not-allowed"
            />
            <Link
              to="/app"
              className="rounded-xl bg-bull hover:bg-bull/90 text-white p-2.5 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          08 — PORTFOLIO + WATCHLIST SHOWCASE
      ───────────────────────────────────────────────────────────── */}
      <section id="portfolio" className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-24 lg:px-10 border-t border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <Briefcase size={12} /> PORTFOLIO & WATCHLIST
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 tracking-tight">
            Real-Time P&L & Target Price Monitoring
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            Log transactions, track weighted average cost basis, and automate threshold alerts delivered directly to your inbox.
          </p>
        </div>

        {/* Dual Panel Layout: Portfolio Table (7 cols) + Watchlist Alerts (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Portfolio Table (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-border-strong bg-bg-1 overflow-hidden shadow-lg glass">
            {/* Header */}
            <div className="border-b border-border-custom bg-bg-2/70 px-5 py-3.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                PORTFOLIO HOLDINGS SNAPSHOT
              </span>
              <span className="font-mono text-[10px] font-bold text-bull px-2 py-0.5 rounded bg-bull/10">
                P&L: +₹3,090 (+2.16%)
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-0/60 border-b border-border-custom font-mono text-[10px] uppercase tracking-wider text-text-3">
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-3 text-right">Qty</th>
                    <th className="py-3 px-3 text-right">Avg. Price</th>
                    <th className="py-3 px-3 text-right">LTP (₹)</th>
                    <th className="py-3 px-4 text-right">Unrealised P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom font-mono text-xs">
                  <tr className="hover:bg-bg-0/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-bull">RELIANCE</td>
                    <td className="py-3 px-3 text-right text-text-1">20</td>
                    <td className="py-3 px-3 text-right text-text-2">₹2,410.00</td>
                    <td className="py-3 px-3 text-right font-semibold text-text-0">₹2,486.00</td>
                    <td className="py-3 px-4 text-right font-bold text-bull">+₹1,520.00</td>
                  </tr>
                  <tr className="hover:bg-bg-0/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-bull">INFY</td>
                    <td className="py-3 px-3 text-right text-text-1">35</td>
                    <td className="py-3 px-3 text-right text-text-2">₹1,480.00</td>
                    <td className="py-3 px-3 text-right font-semibold text-text-0">₹1,542.00</td>
                    <td className="py-3 px-4 text-right font-bold text-bull">+₹2,170.00</td>
                  </tr>
                  <tr className="hover:bg-bg-0/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-bull">TCS</td>
                    <td className="py-3 px-3 text-right text-text-1">10</td>
                    <td className="py-3 px-3 text-right text-text-2">₹3,820.00</td>
                    <td className="py-3 px-3 text-right font-semibold text-text-0">₹3,760.00</td>
                    <td className="py-3 px-4 text-right font-bold text-bear">-₹600.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom summary bar */}
            <div className="p-4 bg-bg-2/40 border-t border-border-custom flex items-center justify-between font-mono text-xs">
              <span className="text-text-3">Total Invested: ₹1,38,200</span>
              <span className="text-text-0 font-bold">Current: ₹1,41,290</span>
            </div>
          </div>

          {/* Watchlist & Price Alerts (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-border-strong bg-bg-1 p-5 shadow-lg glass flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-amber" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                    WATCHLIST & TRIGGER ALERTS
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-bull/10 text-bull font-bold">
                  SMTP EMAIL SYNC
                </span>
              </div>

              <div className="space-y-3 font-mono">
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-0">RELIANCE</span>
                    <span className="text-[10px] text-text-2">Current: ₹2,486.00</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-bull">Target: ₹2,550.00</span>
                    <span className="text-[9px] text-text-3 font-sans">Approaching (97.5%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-0">INFY</span>
                    <span className="text-[10px] text-text-2">Current: ₹1,542.00</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-bull">Target: ₹1,500.00</span>
                    <span className="text-[9px] text-bull font-sans font-bold">TRIGGERED · EMAIL SENT</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-0">TCS</span>
                    <span className="text-[10px] text-text-2">Current: ₹3,760.00</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-bear">Target: ₹3,700.00</span>
                    <span className="text-[9px] text-text-3 font-sans">Active Monitoring</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-custom flex justify-between font-mono text-[10px] text-text-3">
              <span>Automated Background Evaluation</span>
              <Link to="/watchlist" className="text-bull hover:underline font-semibold">
                Manage Watchlist →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          09 — IPO & CORPORATE INTELLIGENCE
      ───────────────────────────────────────────────────────────── */}
      <section id="ipo-filings" className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-24 lg:px-10 border-t border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <Flame size={12} /> PRIMARY & STATUTORY INTELLIGENCE
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-text-0 tracking-tight">
            IPO Calendar & Corporate Filings Feed
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            Stay ahead of capital raisings, board decisions, dividend schedules, and official exchange disclosures as they land on the NSE.
          </p>
        </div>

        {/* Side-by-Side Terminals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Active IPO Intelligence Card (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-border-strong bg-bg-1 p-6 sm:p-7 shadow-lg glass flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-5">
                <div className="flex items-center gap-2">
                  <Flame size={15} className="text-amber" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                    IPO CENTER // LIVE ISSUE
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-bull/10 text-bull font-bold border border-bull/20">
                  ACTIVE BIDDING
                </span>
              </div>

              {/* Company Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-text-0">Hexagon Technologies Ltd</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-text-1 font-bold">
                    HEXAGON
                  </span>
                </div>
                <p className="font-sans text-xs text-text-2 mt-1">
                  Enterprise Cloud Infrastructure & AI Hardware Integration
                </p>
              </div>

              {/* IPO Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono mb-5">
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom">
                  <div className="text-[10px] text-text-3 uppercase">Price Band</div>
                  <div className="text-xs font-bold text-text-0 mt-0.5">₹450 – ₹475</div>
                </div>
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom">
                  <div className="text-[10px] text-text-3 uppercase">Offer Period</div>
                  <div className="text-xs font-bold text-text-0 mt-0.5">Oct 02 – Oct 05</div>
                </div>
                <div className="p-3 rounded-xl bg-bg-0/70 border border-border-custom">
                  <div className="text-[10px] text-text-3 uppercase">Total Subscription</div>
                  <div className="text-xs font-bold text-bull mt-0.5">18.4x Overall</div>
                </div>
              </div>

              {/* Subscription Breakdown Progress */}
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-text-3">QIB Category (24.2x)</span>
                  <span className="text-text-1 font-bold">88% Allocation</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-border-custom overflow-hidden">
                  <div className="w-[88%] h-full bg-bull rounded-full" />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-border-custom flex items-center justify-between font-mono text-xs">
              <span className="text-text-3">Source: NSE Public Issues</span>
              <Link to="/ipo" className="text-amber hover:underline font-semibold flex items-center gap-1">
                Explore All IPOs <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right: Live Corporate Filings Stream (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-border-strong bg-bg-1 p-6 sm:p-7 shadow-lg glass flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border-custom mb-5">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-electric" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0">
                    CORPORATE FILINGS // NSE STREAM
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-electric/10 text-electric font-bold border border-electric/20">
                  REAL-TIME DISCLOSURES
                </span>
              </div>

              <div className="space-y-3 font-sans">
                {/* Filing 1 */}
                <div className="p-3 rounded-xl bg-bg-0/60 border border-border-custom flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-bull">TATA MOTORS LIMITED</span>
                    <span className="text-text-3">10:45 AM Today</span>
                  </div>
                  <div className="font-semibold text-xs text-text-0">
                    Board Meeting Notice: Consideration of Interim Dividend of ₹6.00 per Equity Share
                  </div>
                  <div className="font-mono text-[9px] text-text-2">
                    Category: Dividend & Corporate Action
                  </div>
                </div>

                {/* Filing 2 */}
                <div className="p-3 rounded-xl bg-bg-0/60 border border-border-custom flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-electric">INFOSYS LIMITED</span>
                    <span className="text-text-3">09:30 AM Today</span>
                  </div>
                  <div className="font-semibold text-xs text-text-0">
                    Statutory Exchange Filing: Enterprise Strategic Cloud & AI Integration Contract
                  </div>
                  <div className="font-mono text-[9px] text-text-2">
                    Category: Material Regulatory Event
                  </div>
                </div>

                {/* Filing 3 */}
                <div className="p-3 rounded-xl bg-bg-0/60 border border-border-custom flex flex-col gap-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-amber">ICICI BANK LIMITED</span>
                    <span className="text-text-3">Yesterday</span>
                  </div>
                  <div className="font-semibold text-xs text-text-0">
                    Schedule of Earnings Call for Q2 FY26 Financial Results
                  </div>
                  <div className="font-mono text-[9px] text-text-2">
                    Category: Investor Presentation
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-border-custom flex items-center justify-between font-mono text-xs">
              <span className="text-text-3">Parsed from NSE Feed</span>
              <Link to="/corporate-announcements" className="text-electric hover:underline font-semibold flex items-center gap-1">
                View All Filings <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10 — TECHNOLOGY & ARCHITECTURE
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-16 md:py-20 lg:px-10 border-t border-border-custom">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-3">
            <Cpu size={12} /> TECHNOLOGY STACK
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-text-0 tracking-tight">
            Engineered for Real-Time Financial Intelligence
          </h2>
          <p className="text-sm text-text-2 mt-2 font-sans font-light">
            Modern full-stack architecture built for sub-second execution, resilient caching, and grounded AI models.
          </p>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-10">
          {[
            { name: "React 19", color: "bull" },
            { name: "Node.js (ESM)", color: "electric" },
            { name: "Express 5", color: "text-1" },
            { name: "MongoDB Atlas", color: "bull" },
            { name: "Redis In-Memory", color: "bear" },
            { name: "Google Gemini 3.1", color: "electric" },
            { name: "Yahoo Finance API", color: "amber" },
            { name: "Python Scrapers", color: "amber" },
            { name: "Tailwind CSS 4", color: "electric" },
            { name: "Lightweight Charts", color: "bull" },
          ].map((tech) => (
            <span
              key={tech.name}
              className="font-mono text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-border-strong bg-bg-1 shadow-sm text-text-1"
            >
              {tech.name}
            </span>
          ))}
        </div>

        {/* Tiny Architecture Flow Diagram */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-border-strong bg-bg-1 p-5 sm:p-6 shadow-md glass">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-3 font-semibold mb-4 text-center">
            END-TO-END DATAFLOW PIPELINE
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center font-mono text-xs">
            <div className="p-3 rounded-xl bg-bg-0 border border-border-custom flex flex-col items-center gap-1">
              <Globe size={18} className="text-electric" />
              <span className="font-bold text-text-0">Market APIs</span>
              <span className="text-[9px] text-text-3">NSE & News Feeds</span>
            </div>

            <div className="text-bull font-bold text-sm hidden sm:block">→</div>

            <div className="p-3 rounded-xl bg-bg-0 border border-border-custom flex flex-col items-center gap-1">
              <Server size={18} className="text-bull" />
              <span className="font-bold text-text-0">Node.js Engine</span>
              <span className="text-[9px] text-text-3">Redis & MongoDB</span>
            </div>

            <div className="text-bull font-bold text-sm hidden sm:block">→</div>

            <div className="p-3 rounded-xl bg-bg-0 border border-border-custom flex flex-col items-center gap-1">
              <Sparkles size={18} className="text-electric" />
              <span className="font-bold text-text-0">Gemini 3.1 AI</span>
              <span className="text-[9px] text-text-3">Entity NLP Pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11 — FINAL CALL TO ACTION & FOOTER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 py-20 lg:px-10 border-t border-border-custom text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bull font-bold px-3 py-1 rounded-full bg-bull/10 border border-bull/20 mb-4">
            INSTITUTIONAL PRECISION FOR RETAIL INVESTORS
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl text-text-0 tracking-tight mb-4">
            Understand the Market. Faster.
          </h2>

          <p className="font-sans text-base sm:text-lg text-text-2 font-light max-w-xl mx-auto mb-8 leading-relaxed">
            Market data, financial news, entity sentiment, portfolio tracking, and AI research — unified in one terminal.
          </p>

          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-bull hover:bg-bull/90 text-white font-sans font-bold text-base px-8 py-4 shadow-xl shadow-bull/25 hover:shadow-2xl hover:shadow-bull/35 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Explore MarketMind <ArrowRight size={18} />
          </Link>
        </div>

        {/* Quick Directory Links */}
        <div className="mt-16 pt-10 border-t border-border-custom flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-text-2">
          <Link to="/app" className="hover:text-bull transition-colors">
            Live Terminal
          </Link>
          <span>•</span>
          <Link to="/nifty50" className="hover:text-bull transition-colors">
            NIFTY 50 Matrix
          </Link>
          <span>•</span>
          <Link to="/ipo" className="hover:text-bull transition-colors">
            IPO Center
          </Link>
          <span>•</span>
          <Link to="/indices" className="hover:text-bull transition-colors">
            Market Indices
          </Link>
          <span>•</span>
          <Link to="/portfolio" className="hover:text-bull transition-colors">
            Portfolio Tracker
          </Link>
          <span>•</span>
          <Link to="/watchlist" className="hover:text-bull transition-colors">
            Watchlist Alerts
          </Link>
        </div>

        {/* Institutional Production Footer */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-lg font-bold text-text-0 select-none">
              MarketMind
            </span>
            <span className="font-mono text-[10px] text-text-3">
              © {new Date().getFullYear()} MarketMind Technologies. All rights reserved.
            </span>
          </div>
          <p className="font-sans text-[11px] text-text-3 max-w-md">
            MarketMind is an AI-powered financial market research and intelligence platform. Data provided for analytical and educational research purposes.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
