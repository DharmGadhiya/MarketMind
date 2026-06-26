import { useEffect, useState } from "react";
import { Activity, Search } from "lucide-react";
import { getStocks } from "../services/newsApi";
import { formatNum } from "../Utilities/utils/format";

const MarketPulse = () => {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "gainers", "losers"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocksData = async () => {
      try {
        const res = await getStocks();
        if (res && res.success && res.data) {
          setStocks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch stocks for Market Pulse:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocksData();
    // Poll every 30 seconds for live stock updates
    const interval = setInterval(fetchStocksData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort stocks based on search and active tab
  const getFilteredStocks = () => {
    let list = [...stocks];

    // Filter by search
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term)
      );
    }

    // Filter and sort by tab
    if (activeTab === "gainers") {
      list = list
        .filter((s) => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === "losers") {
      list = list
        .filter((s) => s.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent);
    } else {
      // Sort alphabetically by symbol
      list.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    return list;
  };

  const isMarketOpen = stocks.some((s) => s.marketState === "REGULAR");
  const displayList = getFilteredStocks();

  return (
    <aside className="sticky top-24 rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm flex flex-col gap-4 max-h-[580px] transition-colors duration-300">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border-custom pb-3 transition-colors">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-bull transition-colors" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-1 font-bold transition-colors">
            Market Pulse
          </span>
        </div>
        
        {/* LIVE STATUS BADGE */}
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isMarketOpen ? "bg-[#0a8c5b] animate-pulse" : "bg-text-3"}`} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-text-2">
            {isMarketOpen ? "Live" : "Closed"}
          </span>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-text-3 transition-colors" size={14} />
        <input
          type="text"
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border-custom bg-bg-0 pl-9 pr-4 py-2 text-xs font-sans outline-none transition-all focus:border-bull focus:bg-bg-1 text-text-0 placeholder-text-3"
        />
      </div>

      {/* TABS */}
      <div className="grid grid-cols-3 gap-1 bg-bg-0 p-1 rounded-xl text-[11px] font-mono font-semibold text-text-2 transition-colors">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "all" ? "bg-bg-1 text-text-0 shadow-sm" : "hover:text-text-0"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("gainers")}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "gainers" ? "bg-bull/10 text-bull shadow-sm" : "hover:text-bull"
          }`}
        >
          Gainers
        </button>
        <button
          onClick={() => setActiveTab("losers")}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "losers" ? "bg-bear/10 text-bear shadow-sm" : "hover:text-bear"
          }`}
        >
          Losers
        </button>
      </div>

      {/* STOCK LIST */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-[250px]">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-black/[0.03] dark:bg-white/[0.03]" />
            ))}
          </div>
        ) : displayList.length > 0 ? (
          displayList.map((stock) => {
            const cleanSymbol = stock.symbol.replace(".NS", "");
            const isPositive = stock.changePercent >= 0;
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between rounded-xl border border-border-custom/50 hover:border-bull/30 bg-bg-1 p-3 shadow-sm transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-bold text-text-0 transition-colors">
                    {cleanSymbol}
                  </span>
                  <span className="clamp-1 text-[10px] text-text-2 font-sans mt-0.5 transition-colors">
                    {stock.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-text-1 transition-colors">
                    ₹{formatNum(stock.cmp)}
                  </span>
                  <span
                    className={`inline-flex min-w-[60px] items-center justify-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      isPositive
                        ? "bg-bull/10 text-bull"
                        : "bg-bear/10 text-bear"
                    }`}
                  >
                    {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-40 flex-col items-center justify-center text-center text-text-2 transition-colors">
            <p className="font-serif text-sm">No stocks found</p>
            <p className="text-[10px] mt-1">Try adjusting your filter or search</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default MarketPulse;