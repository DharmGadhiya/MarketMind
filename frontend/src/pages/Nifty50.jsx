import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RotateCcw, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { fetchNifty50 } from "../services/newsApi";
import WatchToggle from "../components/stock/WatchToggle";
import {
  formatPrice,
  formatPercent,
  formatMetric,
  formatVolume,
} from "../Utilities/utils/stockFormat";

// Groww-style Lakh Crores (L Cr) converter helper
const formatMarketCapLocal = (val) => {
  if (val === undefined || val === null || val === "N/A") return "N/A";
  const num = Number(val);
  if (isNaN(num)) return "N/A";
  if (num >= 1e12) {
    return `₹${(num / 1e12).toFixed(2)} L Cr`;
  } else if (num >= 1e7) {
    return `₹${(num / 1e7).toFixed(2)} Cr`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

/**
 * Custom lightweight SVG Sparkline component
 */
const Sparkline = ({ data, positive }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const width = 80;
  const height = 18;
  const padding = 1.5;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;
  const strokeColor = positive ? "var(--bull)" : "var(--bear)";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Nifty50 = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Clock & Market State
  const [marketStatus, setMarketStatus] = useState("🔴 Closed");
  const [istTimeStr, setIstTimeStr] = useState("");
  const [istDateStr, setIstDateStr] = useState("");

  // Fetch stock list on mount
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNifty50();
      if (Array.isArray(data)) {
        setStocks(data);
        setFilteredStocks(data);
      } else {
        throw new Error("Invalid response format received from server.");
      }
    } catch (err) {
      console.error("[Nifty 50 Load Error]:", err);
      setError(err.message || "Failed to load NIFTY 50 companies list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Clock and Market Status in real-time
  useEffect(() => {
    const updateIstClock = () => {
      const now = new Date();

      // Time formatting in Indian Standard Time (Asia/Kolkata)
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).toUpperCase();
      setIstTimeStr(`${timeStr} IST`);

      // Date formatting in Indian Standard Time (Asia/Kolkata)
      const dateStr = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
      setIstDateStr(dateStr);

      // Market Status Calculation in Indian Standard Time (Asia/Kolkata)
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        weekday: "short",
      });
      
      const parts = formatter.formatToParts(now);
      const components = {};
      parts.forEach(p => { components[p.type] = p.value; });
      
      const weekdayStr = components.weekday; // e.g. "Mon", "Tue"...
      const isWeekday = weekdayStr !== "Sat" && weekdayStr !== "Sun";
      
      const istLocaleStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      });
      const [hourStr, minuteStr] = istLocaleStr.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      const totalMinutes = hour * 60 + minute;
      const startMinutes = 9 * 60 + 15; // 9:15 AM
      const endMinutes = 15 * 60 + 30; // 3:30 PM

      const isOpen = isWeekday && totalMinutes >= startMinutes && totalMinutes <= endMinutes;
      setMarketStatus(isOpen ? "🟢 Open" : "🔴 Closed");
    };

    updateIstClock();
    const interval = setInterval(updateIstClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Run Search + Filters whenever inputs change
  useEffect(() => {
    let result = [...stocks];

    // 1. Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.companyName.toLowerCase().includes(q) ||
          s.symbol.toLowerCase().includes(q)
      );
    }

    // 2. Quick Filters
    if (activeFilter === "Gainers") {
      result = result.filter((s) => Number(s.priceChange) > 0);
      result.sort((a, b) => Number(b.percentChange) - Number(a.percentChange));
    } else if (activeFilter === "Losers") {
      result = result.filter((s) => Number(s.priceChange) < 0);
      result.sort((a, b) => Number(a.percentChange) - Number(b.percentChange));
    } else if (activeFilter === "Highest Volume") {
      result.sort((a, b) => Number(b.volume) - Number(a.volume));
    } else if (activeFilter === "Highest Market Cap") {
      result.sort((a, b) => Number(b.marketCap) - Number(a.marketCap));
    }

    setFilteredStocks(result);
  }, [searchQuery, activeFilter, stocks]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("All");
  };

  const get52WProgress = (current, low, high) => {
    const c = Number(current);
    const l = Number(low);
    const h = Number(high);
    if (!isNaN(c) && !isNaN(l) && !isNaN(h) && h !== l) {
      const progress = ((c - l) / (h - l)) * 100;
      return Math.max(0, Math.min(100, progress));
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO TITLE SECTION */}
        <section className="mx-auto max-w-[1400px] px-6 pt-8 pb-4 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border-custom pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-4xl text-text-0 font-bold tracking-tight">
                  NIFTY 50
                </h1>
                <span className="rounded-full bg-bull/15 px-3 py-1 text-xs font-semibold text-bull">
                  Total Companies: 50
                </span>
              </div>
              <p className="text-sm text-text-2 mt-2 leading-relaxed max-w-xl">
                Track all companies in the NIFTY 50 index with real-time market data. Click any stock to view its comprehensive candlestick charts and financials.
              </p>
            </div>

            {/* Live details column */}
            <div className="flex flex-col items-start md:items-end gap-1.5 bg-bg-1 border border-border-custom px-4 py-3 rounded-xl shadow-sm text-xs font-mono font-bold">
              <div className="flex items-center gap-2">
                <span className="text-text-3">Market Status:</span>
                <span className="text-text-0">{marketStatus}</span>
              </div>
              <div className="flex flex-col items-start md:items-end leading-tight mt-0.5">
                <span className="text-text-1">{istDateStr}</span>
                <span className="text-bull font-bold tracking-wider text-[11px] mt-0.5">{istTimeStr}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TOP BAR: SEARCH & FILTERS */}
        <section className="mx-auto max-w-[1400px] px-6 py-4 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" size={15} />
              <input
                type="text"
                placeholder="Search by Symbol or Company Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border-custom bg-bg-1 pl-10 pr-4 py-2.5 text-xs outline-none transition-all focus:border-bull text-text-0 placeholder-text-3 shadow-sm hover:border-border-custom/85"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {[
                "All",
                "Gainers",
                "Losers",
                "Highest Volume",
                "Highest Market Cap",
              ].map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-[1.02] border shadow-sm ${
                      isActive
                        ? "bg-bull border-bull text-white"
                        : "bg-bg-1 border-border-custom text-text-2 hover:text-text-0 hover:border-border-custom/80"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* MAIN CARDS LIST */}
        <main className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
          <AnimatePresence mode="wait">
            {loading ? (
              /* SKELETON LOADER GRID */
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
              >
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="h-[145px] rounded-2xl border border-border-custom bg-bg-1 p-4 flex flex-col justify-between animate-pulse shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-border-custom rounded-md w-3/4" />
                        <div className="h-2.5 bg-border-custom rounded-md w-1/4" />
                      </div>
                      <div className="h-4 bg-border-custom rounded-full w-12 animate-pulse" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4.5 bg-border-custom rounded-md w-1/3" />
                        <div className="h-2.5 bg-border-custom rounded-md w-1/4" />
                      </div>
                      <div className="h-5 bg-border-custom rounded-md w-16" />
                    </div>
                    
                    <div className="border-t border-border-custom/50 pt-2 flex justify-between items-center">
                      <div className="h-3 bg-border-custom rounded-md w-1/3" />
                      <div className="h-3 bg-border-custom rounded-md w-12" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : error ? (
              /* ERROR STATE */
              <motion.div
                key="error-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center border border-border-custom rounded-2xl bg-bg-1 p-10 text-center shadow-sm max-w-xl mx-auto my-12"
              >
                <span className="text-4xl mb-3">⚠️</span>
                <h3 className="font-serif text-xl font-bold text-text-0 mb-1">Failed to Load Dashboard</h3>
                <p className="text-xs text-text-2 mb-6">{error}</p>
                <button
                  onClick={loadData}
                  className="rounded-xl bg-bull hover:bg-bull/95 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  Retry Fetch
                </button>
              </motion.div>
            ) : filteredStocks.length === 0 ? (
              /* EMPTY SEARCH RESULTS STATE */
              <motion.div
                key="empty-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center border border-dashed border-border-custom rounded-2xl bg-bg-1 p-12 text-center shadow-sm max-w-xl mx-auto my-12"
              >
                <span className="text-4xl mb-3">🔍</span>
                <h3 className="font-serif text-lg font-bold text-text-0 mb-1">No Stocks Match Filter</h3>
                <p className="text-xs text-text-2 mb-6 leading-relaxed">
                  We couldn't find any stocks matching your query "{searchQuery}" or selected filter. Try adjusting your search query or reset the dashboard.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-custom hover:border-bull/30 bg-bg-0 px-5 py-2.5 text-xs font-semibold text-text-1 hover:text-bull transition-all duration-300 shadow-sm cursor-pointer hover:scale-[1.02]"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              /* ACTIVE STOCKS GRID */
              <motion.div
                key="stocks-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
              >
                {filteredStocks.map((stock) => {
                  const isPositive = Number(stock.priceChange) >= 0;
                  return (
                    <motion.div
                      key={stock.symbol}
                      layoutId={`card-${stock.symbol}`}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group flex flex-col justify-between h-[145px] rounded-2xl border border-border-custom/50 hover:border-bull bg-bg-1 p-4 shadow-sm hover:shadow-md transition-all duration-300 relative"
                    >
                      {/* Top Action Layer containing WatchToggle and Sector badge */}
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                        <span className="rounded-lg bg-bg-2 border border-border-custom/60 px-2 py-0.5 text-[9px] font-semibold text-text-2">
                          {stock.sector}
                        </span>
                        <WatchToggle
                          symbol={stock.symbol}
                          currentPrice={stock.currentPrice}
                          changePercent={stock.percentChange}
                          className="p-1 h-7 w-7 border-none bg-transparent hover:bg-bg-0 text-text-2 hover:text-amber-500"
                          iconClassName="h-[18px] w-[18px]"
                        />
                      </div>

                      {/* Clickable Card Link Wrapper */}
                      <Link
                        to={`/stock/${encodeURIComponent(stock.symbol)}`}
                        className="flex flex-col justify-between h-full w-full"
                      >
                        {/* CARD TOP INFO (NAME/SYMBOL) */}
                        <div className="flex flex-col min-w-0 pr-[155px]">
                          <h3 className="text-sm font-semibold text-text-0 leading-snug truncate group-hover:text-bull transition-colors" title={stock.companyName}>
                            {stock.companyName}
                          </h3>
                          <span className="font-mono text-[9px] text-text-3 font-bold mt-0.5 block">
                            {stock.symbol}
                          </span>
                        </div>

                        {/* MIDDLE PRICING & SPARKLINE ROW */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div>
                            <div className="text-base font-bold text-text-0 leading-none">
                              {formatPrice(stock.currentPrice)}
                            </div>
                            <div className={`inline-flex items-center gap-1 text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-md ${
                              isPositive ? "text-bull bg-bull/10" : "text-bear bg-bear/10"
                            }`}>
                              <span>{isPositive ? "+" : ""}{formatPrice(stock.priceChange)}</span>
                              <span>({formatPercent(stock.percentChange)})</span>
                            </div>
                          </div>

                          {/* Tiny Inline Sparkline */}
                          {stock.sparkline && stock.sparkline.length > 0 && (
                            <div className="opacity-95 group-hover:opacity-100 transition-opacity">
                              <Sparkline data={stock.sparkline} positive={isPositive} />
                            </div>
                          )}
                        </div>

                        {/* BOTTOM STATS & DETAILS */}
                        <div className="flex items-center justify-between text-[10px] text-text-2 font-mono leading-none pt-2 border-t border-border-custom/40">
                          <div>
                            <span className="text-text-3 mr-0.5">Cap:</span>
                            <span className="font-semibold text-text-1">
                              {formatMarketCapLocal(stock.marketCap)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 group-hover:text-bull transition-colors">
                            <span className="text-text-3 text-[9px]">Details</span>
                            <ArrowRight size={10} className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border-custom bg-bg-2 transition-colors duration-300 mt-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-text-0 transition-colors">
              MarketMind
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="font-mono text-[9px] text-text-3">
            All index components are powered by yahoo-finance2. Caching enabled (5m).
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Nifty50;
