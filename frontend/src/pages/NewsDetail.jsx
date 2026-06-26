import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Clock, Loader2, Lock } from "lucide-react";
import { useUser } from "../services/UserContext";

import { getNewsById, getAIAnalysisByNewsId } from "../services/newsApi";
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

  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchAnalysis = async () => {
      try {
        setLoadingAnalysis(true);
        setAnalysisError(null);
        const data = await getAIAnalysisByNewsId(id);
        if (data && data.success) {
          setAnalysis(data.analysis);
        } else {
          setAnalysisError(data.message || "Failed to load AI Analysis");
        }
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || "AI Analysis is currently unavailable. Please try again later.";
        setAnalysisError(errMsg);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [id, user]);

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

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
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
            {user ? (
              <div className="mt-10 rounded-2xl border border-border-custom bg-bg-1 p-6 shadow-sm transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-custom pb-4 mb-6 gap-2">
                  <h3 className="font-serif text-2xl text-text-0 transition-colors font-semibold">
                    Generative AI Analysis
                  </h3>
                  {analysis && (
                    <span className="text-[10px] font-mono text-text-2 tracking-wider uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                      Model: {newsItem.aiModel || "gemini-3.1-flash-lite"}
                    </span>
                  )}
                </div>

                {loadingAnalysis && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="animate-spin text-bull" size={28} />
                    <p className="font-mono text-xs text-text-2 tracking-wider">Running Deep Financial Analysis...</p>
                  </div>
                )}

                {analysisError && (
                  <div className="rounded-xl border border-amber/20 bg-amber/5 p-4 text-sm text-text-1">
                    <p className="font-semibold text-amber mb-1">AI Service Notice</p>
                    <p className="text-xs text-text-2 leading-relaxed">{analysisError}</p>
                  </div>
                )}

                {!loadingAnalysis && !analysisError && !analysis && (
                  <div className="rounded-xl border border-border-custom bg-bg-0/50 p-6 text-center">
                    <p className="text-sm text-text-2">No analysis generated yet for this article.</p>
                  </div>
                )}

                {analysis && (
                  <div className="flex flex-col gap-8 text-sm leading-relaxed text-text-1">
                    
                    {/* Summary & Outlook Dashboard */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 bg-bg-0 p-4 rounded-xl border border-border-custom transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-text-2 uppercase tracking-wider">Outlook</span>
                        <span className={`font-semibold ${
                          analysis.outlook?.toLowerCase().includes("positive") ? "text-[#0a8c5b]" :
                          analysis.outlook?.toLowerCase().includes("negative") ? "text-[#e11d48]" : "text-text-0"
                        }`}>
                          {analysis.outlook}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-x border-border-custom pt-3 sm:pt-0 sm:px-4">
                        <span className="text-[10px] font-mono text-text-2 uppercase tracking-wider">Sentiment</span>
                        <span className="font-semibold text-text-0">{analysis.sentiment}</span>
                      </div>
                      <div className="flex flex-col gap-1 border-t sm:border-t-0 pt-3 sm:pt-0 sm:pl-4">
                        <span className="text-[10px] font-mono text-text-2 uppercase tracking-wider">Confidence Score</span>
                        <span className="font-semibold text-text-0">{analysis.confidenceScore}%</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-text-0 mb-2">
                        Event Explanation
                      </h4>
                      <p className="text-text-1 whitespace-pre-line leading-relaxed">{analysis.newsExplanation}</p>
                    </div>

                    {/* Market Impact */}
                    <div>
                      <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-text-0 mb-2">
                        Market & Sector Impact
                      </h4>
                      <p className="text-text-1 whitespace-pre-line leading-relaxed">{analysis.marketImpact}</p>
                    </div>

                    {/* Fundamental Analysis Grid */}
                    {Object.values(analysis.fundamentalAnalysis || {}).some(val => val !== "Data Not Available") ? (
                      <div>
                        <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-text-0 mb-3">
                          Fundamental Analysis
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {analysis.fundamentalAnalysis.valuation !== "Data Not Available" && (
                            <div className="p-3 bg-bg-0 rounded-lg border border-border-custom">
                              <h5 className="font-bold text-xs text-text-0 mb-1">Valuation</h5>
                              <p className="text-xs text-text-2 leading-relaxed">{analysis.fundamentalAnalysis.valuation}</p>
                            </div>
                          )}
                          {analysis.fundamentalAnalysis.profitability !== "Data Not Available" && (
                            <div className="p-3 bg-bg-0 rounded-lg border border-border-custom">
                              <h5 className="font-bold text-xs text-text-0 mb-1">Profitability</h5>
                              <p className="text-xs text-text-2 leading-relaxed">{analysis.fundamentalAnalysis.profitability}</p>
                            </div>
                          )}
                          {analysis.fundamentalAnalysis.growth !== "Data Not Available" && (
                            <div className="p-3 bg-bg-0 rounded-lg border border-border-custom">
                              <h5 className="font-bold text-xs text-text-0 mb-1">Growth</h5>
                              <p className="text-xs text-text-2 leading-relaxed">{analysis.fundamentalAnalysis.growth}</p>
                            </div>
                          )}
                          {analysis.fundamentalAnalysis.financialHealth !== "Data Not Available" && (
                            <div className="p-3 bg-bg-0 rounded-lg border border-border-custom">
                              <h5 className="font-bold text-xs text-text-0 mb-1">Financial Health</h5>
                              <p className="text-xs text-text-2 leading-relaxed">{analysis.fundamentalAnalysis.financialHealth}</p>
                            </div>
                          )}
                        </div>
                        {analysis.fundamentalAnalysis.overallInterpretation !== "Data Not Available" && (
                          <div className="mt-3 p-3 bg-bg-0 rounded-lg border border-border-custom">
                            <h5 className="font-bold text-xs text-text-0 mb-1">Overall Fundamental Outlook</h5>
                            <p className="text-xs text-text-2 leading-relaxed">{analysis.fundamentalAnalysis.overallInterpretation}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-bg-0 rounded-xl border border-border-custom text-center">
                        <span className="text-xs font-mono text-text-2">Fundamental analysis is not available for this article's entities.</span>
                      </div>
                    )}

                    {/* Investor Insight */}
                    <div>
                      <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-text-0 mb-3">
                        Investor Insights
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-bg-0/30 rounded-xl border border-border-custom">
                          <h5 className="font-bold text-xs text-[#0a8c5b] mb-1">For Existing Investors</h5>
                          <p className="text-xs text-text-1 leading-relaxed">{analysis.investorInsight?.existingInvestors}</p>
                        </div>
                        <div className="p-4 bg-bg-0/30 rounded-xl border border-border-custom">
                          <h5 className="font-bold text-xs text-bull mb-1">For Prospective Buyers</h5>
                          <p className="text-xs text-text-1 leading-relaxed">{analysis.investorInsight?.newInvestors}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risks Checklist */}
                    {analysis.risks && analysis.risks.length > 0 && (
                      <div>
                        <h4 className="font-sans font-bold text-[13px] uppercase tracking-wider text-text-0 mb-2">
                          Key Risk Analysis
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {analysis.risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-text-1">
                              <span className="text-[#e11d48] font-bold mt-0.5">⚠️</span>
                              <span className="leading-relaxed">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ) : (
              <div className="mt-10 rounded-2xl border border-border-custom bg-bg-1 p-6 shadow-sm transition-colors">
                <div className="mb-5 flex items-center gap-2">
                  <Lock size={20} className="text-amber" />

                  <h3 className="font-serif text-2xl text-text-0 transition-colors">
                    AI Analysis
                  </h3>
                </div>

                <div className="rounded-xl bg-bg-0 p-5 blur-[3px] select-none pointer-events-none transition-colors">
                  <p className="leading-7">First Login</p>
                  <p className="leading-7">You cannot see it to view Login first</p>
                  <p className="leading-7">HA HA HA What you think you can change it from Colsol HA HA HA</p>
                </div>

                <p className="mt-5 text-center text-sm text-text-2 transition-colors">
                  🔒 Login to unlock AI-powered market analysis.
                </p>
              </div>
            )}

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