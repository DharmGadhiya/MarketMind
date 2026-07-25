import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Info, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// API services
import { getIndices, fetchStockChart } from "../services/newsApi";

// Components
import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import PriceChart from "../components/stock/PriceChart";
import ChartToolbar from "../components/stock/ChartToolbar";

// Sparkline component to render a lightweight SVG trend line for the last active trading session
const Sparkline = ({ history, isPositive }) => {
  if (!history || history.length < 2) {
    return (
      <div className="h-10 flex items-center justify-center text-[10px] text-text-3 font-mono">
        No Trend Data
      </div>
    );
  }

  const points = history.map((h) => h.close);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;

  const width = 120;
  const height = 36;
  const padding = 2;

  const svgPoints = points
    .map((val, index) => {
      const x = (index / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((val - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = isPositive ? "#10b981" : "#ef4444";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
};

const IndicesPage = () => {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Detail State
  const [selectedModalIndex, setSelectedModalIndex] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeRange, setActiveRange] = useState("1mo"); // Default to 1mo for indices to ensure daily candlesticks load cleanly
  const [loadingChart, setLoadingChart] = useState(false);

  const loadIndices = async (shouldShowMainLoader = true) => {
    try {
      if (shouldShowMainLoader) {
        setLoading(true);
      }
      setError(null);
      const res = await getIndices();
      if (res && res.success && res.data) {
        setIndices(res.data);
      } else {
        throw new Error("Failed to load Indian indices data");
      }
    } catch (err) {
      console.error("[Indices Load Error]:", err);
      setError(err.message || "Unable to fetch index quotes.");
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (symbol, range) => {
    if (!symbol) return;
    try {
      setLoadingChart(true);
      const chartRes = await fetchStockChart(symbol, range);
      setChartData(chartRes || []);
    } catch (err) {
      console.error("[Index Chart Load Error]:", err);
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    loadIndices(true);
    // Polling indices list every 60 seconds
    const interval = setInterval(() => {
      loadIndices(false);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedModalIndex) {
      loadChartData(selectedModalIndex.symbol, activeRange);
    }
  }, [selectedModalIndex, activeRange]);

  const handleOpenModal = (item) => {
    setSelectedModalIndex(item);
    setActiveRange("1mo"); // Default selection
  };

  const handleCloseModal = () => {
    setSelectedModalIndex(null);
    setChartData([]);
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col">
      <Header />
      <TickerTape />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-text-0">
              Benchmark Indices
            </h1>
            <p className="text-xs text-text-2">
              All indices at a glance. Cards show the intraday price trend of the last active trading session. Click any card to open interactive charts.
            </p>
          </div>
          
          <button
            onClick={() => loadIndices(false)}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border-strong bg-bg-1 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-1 hover:bg-bg-2 transition-all cursor-pointer"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3.5 text-xs text-bear flex items-center gap-2">
            <Info size={14} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
            <Loader2 size={32} className="text-bull animate-spin" />
            <span className="text-xs text-text-2 mt-3 font-mono">Loading market overview...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {indices.map((item) => {
              const isPositive = item.changePercent >= 0;
              const cleanSymbol = item.symbol.replace("^", "");
              
              return (
                <motion.div
                  key={item.symbol}
                  onClick={() => handleOpenModal(item)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl border border-border-strong bg-bg-1 hover:border-bull/30 hover:shadow-md transition-all duration-300 flex flex-col gap-3 justify-between cursor-pointer"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-serif font-bold text-text-0 text-sm truncate" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-mono text-[9px] uppercase text-text-2 tracking-wider mt-0.5">
                        {cleanSymbol}
                      </span>
                    </div>
                    
                    <div className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      isPositive ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                    }`}>
                      {isPositive ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Price & Sparkline Center row */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-text-0 text-lg">
                        {item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`font-mono text-xs ${isPositive ? "text-bull" : "text-bear"}`}>
                        {isPositive ? "+" : ""}
                        {item.change.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* SVG Sparkline */}
                    <div className="flex items-center justify-end">
                      <Sparkline history={item.history} isPositive={isPositive} />
                    </div>
                  </div>

                  {/* Stats Footer */}
                  <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border-custom text-[10px] font-mono text-text-3">
                    <div>
                      High:{" "}
                      <span className="text-text-1 font-medium">
                        {item.high.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      Low:{" "}
                      <span className="text-text-1 font-medium">
                        {item.low.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* DETAILED INTERACTIVE CHART MODAL */}
      <AnimatePresence>
        {selectedModalIndex && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl bg-bg-1 border border-border-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border-custom bg-gradient-to-r from-bull/5 to-transparent">
                <div className="flex flex-col">
                  <h2 className="font-serif text-xl font-bold text-text-0">
                    {selectedModalIndex.name}
                  </h2>
                  <span className="font-mono text-xs text-text-3 mt-0.5 uppercase">
                    Ticker: {selectedModalIndex.symbol}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <ChartToolbar activeRange={activeRange} onChangeRange={setActiveRange} />
                  <button
                    onClick={handleCloseModal}
                    className="rounded-lg p-1.5 hover:bg-bg-2 text-text-2 hover:text-text-0 transition-all cursor-pointer border border-transparent hover:border-border-custom"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto min-h-0">
                {/* Micro Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-bg-0/35 border border-border-custom">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider">Current Price</span>
                    <span className="font-mono font-bold text-text-0 text-lg">
                      {selectedModalIndex.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider">Net Change</span>
                    <span className={`font-mono font-bold text-sm ${selectedModalIndex.changePercent >= 0 ? "text-bull" : "text-bear"}`}>
                      {selectedModalIndex.changePercent >= 0 ? "+" : ""}
                      {selectedModalIndex.changePercent.toFixed(2)}% ({selectedModalIndex.change >= 0 ? "+" : ""}{selectedModalIndex.change.toLocaleString("en-IN", { minimumFractionDigits: 2 })})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider">Day High</span>
                    <span className="font-mono font-bold text-text-0 text-sm">
                      {selectedModalIndex.high.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider">Day Low</span>
                    <span className="font-mono font-bold text-text-0 text-sm">
                      {selectedModalIndex.low.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Lightweight-Chart Container */}
                <div className="flex-1 min-h-[280px] sm:min-h-[380px] lg:h-[450px] w-full relative border border-border-custom rounded-xl p-2 bg-bg-0/30 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {loadingChart ? (
                      <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg-1/40 backdrop-blur-[1.5px]">
                        <Loader2 size={28} className="text-bull animate-spin" />
                      </div>
                    ) : null}
                  </AnimatePresence>
                  
                  {chartData && chartData.length > 0 ? (
                    <PriceChart chartData={chartData} activeRange={activeRange} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-text-3 text-xs font-mono">
                      No historical candle data available for this range.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndicesPage;
