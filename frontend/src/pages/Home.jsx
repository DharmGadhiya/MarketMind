import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader2 } from "lucide-react";

import { getNews, getStocks } from "../services/newsApi";

import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import FeaturedHero from "../components/FeaturedHero";
import NewsCard from "../components/NewsCard";
import MarketPulse from "../components/MarketPulse";

const Home = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalNews, setTotalNews] = useState(0);
  
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocksData = async () => {
      try {
        const res = await getStocks();
        if (res && res.success && res.data) {
          setStocks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch stocks for Home:", err);
      }
    };
    fetchStocksData();
  }, []);

  useEffect(() => {
    const loadInitialNews = async () => {
      try {
        const data = await getNews(1);

        setNews(data.news || []);
        setHasMore(data.hasMore);
        setTotalNews(data.totalNews || 0);
        setPage(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialNews();
  }, []);

  const fetchMoreNews = async () => {
    try {
      const nextPage = page + 1;

      const data = await getNews(nextPage);

      setNews((prev) => [...prev, ...(data.news || [])]);
      setPage(nextPage);
      setHasMore(data.hasMore);
      setTotalNews(data.totalNews || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const heroItems = news.slice(0, 3);
  const restItems = news.slice(3);

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300">
      <Header />

      <TickerTape initialStocks={stocks} />

      {/* HERO BANNER */}
      <section className="relative border-b border-border-custom grid-bg">
        <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10 lg:py-16">

          <div className="flex items-end justify-between gap-6">

            <div className="max-w-3xl rise-up">

              {/* DYNAMIC MARKET STATUS BADGE */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-1 px-3 py-1 backdrop-blur shadow-sm transition-colors">
                <span className={`h-1.5 w-1.5 rounded-full transition-colors ${stocks.some(s => s.marketState === "REGULAR") ? "bg-[#0a8c5b] animate-pulse" : "bg-text-3"}`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-1 transition-colors">
                  {stocks.some(s => s.marketState === "REGULAR") ? "Markets Open · Live Coverage" : "Markets Closed"}
                </span>
              </div>

              <h1 className="font-serif text-5xl headline-tight text-text-0 sm:text-6xl lg:text-[88px] transition-colors">

                The market,
                <br />

                <span className="italic text-bull">
                  decoded.
                </span>

              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-2 transition-colors">
                Curated stock-market intelligence from India and around the
                world — earnings, IPOs, macroeconomics, business and finance —
                all in one place.
              </p>

            </div>

            <div className="hidden lg:block rise-up">

              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border-strong bg-border-strong shadow-sm transition-colors">

                <div className="bg-bg-1 p-5 transition-colors">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
                    Stories
                  </div>

                  <div className="mt-2 font-serif text-3xl">
                    {totalNews}
                  </div>
                </div>

                <div className="bg-bg-1 p-5 transition-colors">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
                    Sources
                  </div>

                  <div className="mt-2 font-serif text-3xl">
                    24+
                  </div>
                </div>

                <div className="bg-bg-1 p-5 transition-colors">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
                    Coverage
                  </div>

                  <div className="mt-2 font-serif text-3xl">
                    Global
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">

        {heroItems.length > 0 && (
          <div className="mb-12">

            <div className="mb-6">

              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-bull transition-colors">
                ◆ Editor's Pick
              </div>

              <h2 className="mt-1 font-serif text-3xl text-text-0 lg:text-4xl transition-colors">
                Today's Headlines
              </h2>

            </div>

            <FeaturedHero items={heroItems} />

          </div>
        )}

        <div className="mb-8">

          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-bull transition-colors">
            ◆ The Wire
          </div>

          <h2 className="mt-1 font-serif text-3xl text-text-0 lg:text-4xl transition-colors">
            Latest Market News
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">

          <div>

            {loading ? (
              <SkeletonGrid />
            ) : (
              <InfiniteScroll
                dataLength={restItems.length}
                next={fetchMoreNews}
                hasMore={hasMore}
                loader={
                  <div className="flex items-center justify-center py-10 text-[#6b7280]">
                    <Loader2
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    Loading More Stories...
                  </div>
                }
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {restItems.map((item, i) => (
                    <NewsCard
                      key={item._id}
                      news={item}
                      index={i}
                    />
                  ))}

                </div>
              </InfiniteScroll>
            )}

          </div>

          <MarketPulse initialStocks={stocks} />

        </div>

      </main>

      {/* FOOTER */}

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

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="overflow-hidden rounded-xl border border-border-custom bg-bg-1 transition-colors"
      >
        <div className="aspect-[16/10] animate-pulse bg-black/[0.05] dark:bg-white/[0.05]" />

        <div className="space-y-2 p-5">
          <div className="h-3 w-24 animate-pulse rounded bg-black/[0.08] dark:bg-white/[0.08]" />
          <div className="h-5 w-full animate-pulse rounded bg-black/[0.1] dark:bg-white/[0.1]" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-black/[0.1] dark:bg-white/[0.1]" />
        </div>
      </div>
    ))}
  </div>
);

export default Home;