import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Clock, Loader2, Lock } from "lucide-react";
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
        <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-[#6b7280]">
          ■ Neutral (0.00)
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#0a0e14]">
        <Header />
        <TickerTape />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#0a8c5b]" size={36} />
          <p className="font-mono text-sm text-[#6b7280] tracking-wider">Retrieving Market Analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen bg-[#faf7f2] text-[#0a0e14]">
        <Header />
        <TickerTape />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h2 className="font-serif text-3xl mb-4">Market Insight Unavailable</h2>
          <p className="text-sm text-[#6b7280] mb-8">{error || "The requested article could not be found."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white hover:bg-black/[0.02] px-5 py-3 transition-colors text-sm font-medium shadow-sm cursor-news"
          >
            <ArrowLeft size={16} />
            Return to Terminal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#0a0e14]">
      <Header />
      <TickerTape />

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#6b7280] hover:text-[#0a8c5b] transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Terminal
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <article className="rise-up flex flex-col gap-6">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#6b7280]">
              <span className="text-[#0a8c5b] font-semibold">
                {cleanSource(newsItem.source)}
              </span>
              <span>/</span>
              <Clock size={11} />
              <span>
                {timeAgo(newsItem.published_at)}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl headline-tight text-[#0a0e14]">
              {newsItem.title}
            </h1>

            <div className="relative w-full overflow-hidden rounded-2xl border border-black/10 bg-[#f3efe7] shadow-sm max-h-[500px]">
              <img
                src={newsItem.image_url || FALLBACK}
                alt={newsItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {newsItem.description && (
              <p className="text-[16px] sm:text-[18px] leading-relaxed text-[#2a2f38] font-sans mt-2 whitespace-pre-line">
                {newsItem.description}
              </p>
            )}

            {/* KEYWORDS */}
            {newsItem.keywords && newsItem.keywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {newsItem.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-mono text-[#6b7280]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* ENTITY SENTIMENT ANALYSIS */}
            {newsItem.entities && newsItem.entities.length > 0 && (
              <div className="mt-8 border-t border-black/8 pt-8">
                <h3 className="font-serif text-2xl text-[#0a0e14] mb-4">
                  Market Sentiment Analysis
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {newsItem.entities.map((entity, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between rounded-xl border border-black/8 bg-white p-4 shadow-sm"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0a0e14] bg-black/5 px-2 py-0.5 rounded">
                            {entity.symbol || "N/A"}
                          </span>
                          {getSentimentBadge(entity.sentiment_score)}
                        </div>
                        <h4 className="mt-2 font-sans font-semibold text-sm text-[#0a0e14]">
                          {entity.name || "Unknown Company"}
                        </h4>
                        {entity.industry && (
                          <p className="text-xs text-[#6b7280] mt-0.5">
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
            {user ? (
              <div className="mt-10 rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-serif text-2xl text-[#0a0e14]">
                  AI Analysis
                </h3>

                {/* AI analysis will come here */}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Lock size={20} className="text-[#b45309]" />

                  <h3 className="font-serif text-2xl text-[#0a0e14]">
                    AI Analysis
                  </h3>
                </div>

                <div className="rounded-xl bg-[#faf7f2] p-5 blur-[3px] select-none pointer-events-none">
                  <p className="leading-7">First Login</p>
                  <p className="leading-7">You cannot see it to view Login first</p>
                  <p className="leading-7">HA HA HA What you think you can change it from Colsol HA HA HA</p>
                </div>

                <p className="mt-5 text-center text-sm text-[#6b7280]">
                  🔒 Login to unlock AI-powered market analysis.
                </p>
              </div>
            )}

            {/* ORIGINAL STORY LINK */}
            <div className="mt-10 border-t border-black/8 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs text-[#6b7280] leading-normal max-w-md">
                You are reading a curated summary on MarketMind. For complete details and official reports, access the original publication.
              </div>
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a8c5b] hover:bg-[#064a30] text-white px-5 py-3 transition-colors text-sm font-medium shadow-sm hover:shadow-md cursor-news"
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

      <footer className="border-t border-black/8 bg-[#f3efe7]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg">
              MarketMind
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9ca3af]">
              © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsDetail;