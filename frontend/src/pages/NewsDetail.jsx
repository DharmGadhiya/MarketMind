import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Clock, Loader2, Lock, Sparkles } from "lucide-react";
import { useUser } from "../services/UserContext";

import { getNewsById } from "../services/newsApi";
import { timeAgo, cleanSource } from "../Utilities/utils/format";

import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import MarketPulse from "../components/MarketPulse";

const FALLBACK =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop&q=70";

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useUser();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNewsById(id);
        if (data && data.news) {
          setNewsItem(data.news);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load article details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const getSentimentBadge = (score) => {
    if (score === null || score === undefined) return null;
    if (score > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0a8c5b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0a8c5b]">
          ▲ Bullish ({score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})
        </span>
      );
    } else if (score < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e11d48]/10 px-2.5 py-0.5 text-xs font-semibold text-[#e11d48]">
          ▼ Bearish ({score.toFixed(2)})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-text-2">
          ■ Neutral (0.00)
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300">
        <Header />
        <TickerTape />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-bull" size={36} />
          <p className="font-mono text-sm text-text-2 tracking-wider">Retrieving Market Analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300">
        <Header />
        <TickerTape />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h2 className="font-serif text-3xl mb-4">Market Insight Unavailable</h2>
          <p className="text-sm text-text-2 mb-8">{error || "The requested article could not be found."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong bg-bg-1 hover:bg-border-custom/50 px-5 py-3 transition-colors text-sm font-medium shadow-sm cursor-news"
          >
            <ArrowLeft size={16} />
            Return to Terminal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300">
      <Header />
      <TickerTape />

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-2 hover:text-bull transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Terminal
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_365px]">
          <article className="rise-up flex flex-col gap-6">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-2 transition-colors">
              <span className="text-bull font-semibold">
                {cleanSource(newsItem.source)}
              </span>
              <span>/</span>
              <Clock size={11} />
              <span>
                {timeAgo(newsItem.published_at)}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl headline-tight text-text-0 transition-colors">
              {newsItem.title}
            </h1>

            <div className="relative w-full overflow-hidden rounded-2xl border border-border-strong bg-bg-2 shadow-sm max-h-[500px] transition-colors">
              <img
                src={newsItem.image_url || FALLBACK}
                alt={newsItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {newsItem.description && (
              <p className="text-[16px] sm:text-[18px] leading-relaxed text-text-1 font-sans mt-2 whitespace-pre-line transition-colors">
                {newsItem.description}
              </p>
            )}

            {/* KEYWORDS */}
            {newsItem.keywords && newsItem.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {newsItem.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-black/5 dark:bg-white/5 px-3 py-1 text-[11px] font-mono text-text-2 transition-colors"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* ENTITY SENTIMENT ANALYSIS */}
            {newsItem.entities && newsItem.entities.length > 0 && (
              <div className="mt-8 border-t border-border-custom pt-8 transition-colors">
                <h3 className="font-serif text-2xl text-text-0 mb-4 transition-colors">
                  Market Sentiment Analysis
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {newsItem.entities.map((entity, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-border-custom bg-bg-1 p-4 shadow-sm transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-0 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded transition-colors">
                            {entity.symbol || "N/A"}
                          </span>
                          {getSentimentBadge(entity.sentiment_score)}
                        </div>
                        <h4 className="mt-2 font-sans font-semibold text-sm text-text-0 transition-colors">
                          {entity.name || "Unknown Company"}
                        </h4>
                        {entity.industry && (
                          <p className="text-xs text-text-2 mt-0.5 transition-colors">
                            {entity.industry}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI ANALYSIS SECTION */}
            <div className="mt-10 relative overflow-hidden rounded-2xl border border-border-custom bg-bg-1 p-8 text-center shadow-md transition-colors duration-300">
              
              {/* Blur Container for Logged Out Users */}
              <div className={`flex flex-col items-center ${!user ? "blur-[5px] select-none pointer-events-none opacity-50" : ""}`}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bull/10 text-bull border border-bull/20">
                  <Sparkles size={24} className={user ? "animate-pulse" : ""} />
                </div>
                <h3 className="font-serif text-2xl text-text-0 font-semibold mb-3 transition-colors">
                  AI Financial Analysis & Valuation
                </h3>
                <p className="mx-auto max-w-lg text-sm text-text-2 leading-relaxed mb-6 transition-colors">
                  Unlock institutional-grade intelligence for this article. Our generative AI model evaluates market sentiment, sector impact, core risk profiles, and fundamental stock valuations.
                </p>
                {user ? (
                  <Link
                    to={`/news/${id}/ai-analysis`}
                    className="inline-flex items-center gap-2 rounded-xl bg-bull hover:bg-bull/90 text-white px-6 py-3.5 transition-colors text-sm font-bold shadow-md hover:shadow-lg cursor-news active:scale-[0.98]"
                  >
                    <Sparkles size={16} />
                    Initiate AI Research Terminal
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-xl bg-border-strong text-text-3 px-6 py-3.5 transition-colors text-sm font-bold shadow-sm"
                  >
                    <Sparkles size={16} />
                    Initiate AI Research Terminal
                  </button>
                )}
              </div>

              {/* Lock Overlay for Logged Out Users */}
              {!user && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-1/40 p-6 backdrop-blur-[1px]">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber/10 text-amber border border-amber/20 shadow-lg animate-bounce">
                    <Lock size={22} />
                  </div>
                  <h4 className="font-serif text-xl text-text-0 font-semibold mb-1.5">
                    AI Research Terminal Locked
                  </h4>
                  <p className="max-w-xs text-xs text-text-2 mb-4 leading-relaxed">
                    Access deep financial analysis, sector impact models, and stock valuations.
                  </p>
                  <button
                    onClick={() => {
                      // Scroll to top where login button is located in the Header
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber hover:bg-amber/90 text-black px-5 py-2.5 transition-all text-xs font-bold shadow-md hover:shadow-lg cursor-news active:scale-[0.97]"
                  >
                    <Lock size={12} />
                    Login to Unlock
                  </button>
                </div>
              )}
            </div>

            {/* ORIGINAL STORY LINK */}
            <div className="mt-10 border-t border-border-custom pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
              <div className="text-xs text-text-2 leading-normal max-w-md transition-colors">
                You are reading a curated summary on MarketMind. For complete details and official reports, access the original publication.
              </div>
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-bull hover:bg-bull/90 text-white px-5 py-3 transition-colors text-sm font-medium shadow-sm hover:shadow-md cursor-news"
              >
                Read Original Article
                <ArrowUpRight size={16} />
              </a>
            </div>
          </article>

          <div>
            <MarketPulse />
          </div>
        </div>
      </main>

      <footer className="border-t border-border-custom bg-bg-2 transition-colors duration-300">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg">
              MarketMind
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsDetail;