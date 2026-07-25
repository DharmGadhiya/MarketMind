import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// API services
import { fetchStockDetails, fetchStockChart } from "../services/newsApi";

// Components
import Header from "../components/Header";
import StockHeader from "../components/stock/StockHeader";
import PriceChart from "../components/stock/PriceChart";
import ChartToolbar from "../components/stock/ChartToolbar";
import PerformanceCard from "../components/stock/PerformanceCard";
import FundamentalCard from "../components/stock/FundamentalCard";
import CompanyCard from "../components/stock/CompanyCard";
import FinancialCard from "../components/stock/FinancialCard";
import SkeletonLoader from "../components/stock/SkeletonLoader";
import ErrorState from "../components/stock/ErrorState";

const StockDetails = () => {
  const { symbol } = useParams();
  
  const [stock, setStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeRange, setActiveRange] = useState("1d");
  
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (shouldShowMainLoader = true) => {
    try {
      if (shouldShowMainLoader) {
        setLoading(true);
      }
      setLoadingChart(true);
      setError(null);

      // Fetch stock details and chart in parallel
      const [detailsRes, chartRes] = await Promise.all([
        fetchStockDetails(symbol),
        fetchStockChart(symbol, activeRange)
      ]);

      if (detailsRes) {
        setStock(detailsRes);
      } else {
        throw new Error(`Failed to load details for stock ${symbol}`);
      }

      setChartData(chartRes || []);
    } catch (err) {
      console.error("[StockDetails Load Error]:", err);
      setError(err.message || "Something went wrong while fetching stock details.");
    } finally {
      setLoading(false);
      setLoadingChart(false);
    }
  };

  // Reload chart only when activeRange changes
  const loadChartOnly = async (range) => {
    try {
      setLoadingChart(true);
      const chartRes = await fetchStockChart(symbol, range);
      setChartData(chartRes || []);
    } catch (err) {
      console.error("[StockDetails Chart Load Error]:", err);
      // Don't fail the whole page if only chart load fails, just empty the data
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  // Fetch initial details and default chart on mount/symbol change
  useEffect(() => {
    // Reset range to 1D when stock symbol changes
    setActiveRange("1d");
    loadData(true);
  }, [symbol]);

  // Handle timeframe change
  const handleRangeChange = (range) => {
    setActiveRange(range);
    loadChartOnly(range);
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col justify-between">
      
      <div>
        {/* HEADER */}
        <Header />

        {/* BREADCRUMB / BACK LINK */}
        <div className="mx-auto max-w-[1400px] px-6 pt-6 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-text-2 hover:text-bull transition-colors select-none"
          >
            <ArrowLeft size={13} />
            BACK TO TERMINAL
          </Link>
        </div>

        {/* MAIN BODY CONTAINER */}
        <main className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10 lg:py-8 flex-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <div className="relative flex items-center justify-center mb-6">
                  {/* Outer glowing rings */}
                  <div className="absolute h-24 w-24 rounded-full border border-bull/20 animate-ping opacity-35" />
                  <div className="absolute h-16 w-16 rounded-full border border-bull/35 animate-pulse opacity-55" />
                  <div className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-bull/10 to-bull/25 border border-bull/30 flex items-center justify-center shadow-md shadow-bull/5">
                    <Loader2 className="h-5 w-5 text-bull animate-spin" />
                  </div>
                </div>
                
                <span className="text-[10px] font-mono text-text-3 font-bold uppercase tracking-[0.25em] animate-pulse">
                  Retrieving Ticker Feed...
                </span>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorState 
                  message={`Unable to retrieve market details for "${symbol}". It may not be a supported NSE ticker or the service is temporarily unavailable.`} 
                  onRetry={() => loadData(true)} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-8"
              >
                
                {/* STOCK HEADER SECTION */}
                <StockHeader stock={stock} />

                {/* TWO-COLUMN CONTENT GRID */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] items-start">
                  
                  {/* LEFT 70% COLUMN */}
                  <div className="space-y-8 min-w-0">
                    
                    {/* PRICE CHART CARD */}
                    <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4 transition-colors">
                      <ChartToolbar 
                        activeRange={activeRange} 
                        onChangeRange={handleRangeChange} 
                      />
                      
                      <div className="relative">
                        {loadingChart && (
                          <div className="absolute inset-0 bg-bg-1/50 backdrop-blur-[1px] z-20 flex items-center justify-center transition-colors">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-bull border-t-transparent" />
                          </div>
                        )}
                        <PriceChart chartData={chartData} activeRange={activeRange} />
                      </div>
                    </div>

                    {/* COMPANY BUSINESS PROFILE */}
                    <CompanyCard stock={stock} />

                    {/* FINANCIAL GRID DETAIL */}
                    <FinancialCard stock={stock} />

                  </div>

                  {/* RIGHT 30% STICKY COLUMN */}
                  <div className="space-y-6 lg:sticky lg:top-24">
                    
                    {/* SLIDER RANGES PERFORMANCE */}
                    <PerformanceCard stock={stock} />

                    {/* RATIOS & VALUATION */}
                    <FundamentalCard stock={stock} />

                  </div>

                </div>

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
            All market quotes are live and powered by yahoo-finance2. Caching enabled (5m).
          </div>
        </div>
      </footer>

    </div>
  );
};

export default StockDetails;
