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

  const displayList = getFilteredStocks();

  return (
    <aside className="sticky top-24 rounded-2xl border border-black/8 bg-white p-5 shadow-sm flex flex-col gap-4 max-h-[580px]">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 border-b border-black/8 pb-3">
        <Activity size={14} className="text-[#0a8c5b]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2a2f38] font-bold">
          Market Pulse
        </span>
      </div>

      {/* SEARCH BOX */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-[#9ca3af]" size={14} />
        <input
          type="text"
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-black/8 bg-[#faf7f2] pl-9 pr-4 py-2 text-xs font-sans outline-none transition-all focus:border-[#0a8c5b] focus:bg-white"
        />
      </div>

      {/* TABS */}
      <div className="grid grid-cols-3 gap-1 bg-[#faf7f2] p-1 rounded-xl text-[11px] font-mono font-semibold text-[#6b7280]">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "all" ? "bg-white text-[#0a0e14] shadow-sm" : "hover:text-[#0a0e14]"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("gainers")}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "gainers" ? "bg-[#0a8c5b]/10 text-[#0a8c5b] shadow-sm" : "hover:text-[#0a8c5b]"
          }`}
        >
          Gainers
        </button>
        <button
          onClick={() => setActiveTab("losers")}
          className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
            activeTab === "losers" ? "bg-[#e11d48]/10 text-[#e11d48] shadow-sm" : "hover:text-[#e11d48]"
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
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-black/[0.03]" />
            ))}
          </div>
        ) : displayList.length > 0 ? (
          displayList.map((stock) => {
            const cleanSymbol = stock.symbol.replace(".NS", "");
            const isPositive = stock.changePercent >= 0;
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between rounded-xl border border-black/4 hover:border-[#0a8c5b]/30 bg-white p-3 shadow-sm transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-xs font-bold text-[#0a0e14]">
                    {cleanSymbol}
                  </span>
                  <span className="clamp-1 text-[10px] text-[#6b7280] font-sans mt-0.5">
                    {stock.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#2a2f38]">
                    ₹{formatNum(stock.cmp)}
                  </span>
                  <span
                    className={`inline-flex min-w-[60px] items-center justify-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      isPositive
                        ? "bg-[#0a8c5b]/10 text-[#0a8c5b]"
                        : "bg-[#e11d48]/10 text-[#e11d48]"
                    }`}
                  >
                    {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-40 flex-col items-center justify-center text-center text-[#6b7280]">
            <p className="font-serif text-sm">No stocks found</p>
            <p className="text-[10px] mt-1">Try adjusting your filter or search</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default MarketPulse;