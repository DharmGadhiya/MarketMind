import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useUser } from "../../services/UserContext";
import { getWatchlist, addToWatchlist, removeFromWatchlist, fetchStockDetails } from "../../services/newsApi";

/**
 * WatchToggle Component
 * Renders a star button to watch/unwatch a stock. Prompts for an alert threshold or target price.
 * Syncs watched state across the application via global event listeners.
 * 
 * @param {object} props
 * @param {string} props.symbol - The stock ticker symbol (e.g. "RELIANCE")
 * @param {number} [props.currentPrice] - Live price (from parent)
 * @param {number} [props.changePercent] - Live percent change (from parent)
 * @param {string} [props.className] - Optional tailwind classes
 */
const WatchToggle = ({ symbol, currentPrice, changePercent, className = "" }) => {
  const { user } = useUser();
  
  const [isWatched, setIsWatched] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(3.0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Local stock info cache (falls back to props)
  const [stockInfo, setStockInfo] = useState({ cmp: 0, changePercent: 0 });

  // Input states
  const [inputThreshold, setInputThreshold] = useState("3.0");
  const [inputPrice, setInputPrice] = useState("");
  const [direction, setDirection] = useState("upside"); // "upside" | "downside"

  const formattedSymbol = symbol.endsWith(".NS") ? symbol.toUpperCase() : `${symbol.toUpperCase()}.NS`;

  // Base previous close calculation
  const cmpVal = parseFloat(stockInfo.cmp) || 0;
  const pctChange = parseFloat(stockInfo.changePercent) || 0;
  const prevClose = cmpVal > 0 ? cmpVal / (1 + pctChange / 100) : 0;

  // Sync stock details from props or fetch on demand
  useEffect(() => {
    if (currentPrice !== undefined && changePercent !== undefined) {
      setStockInfo({ cmp: currentPrice, changePercent });
    } else if (showModal) {
      const loadDetails = async () => {
        try {
          const res = await fetchStockDetails(symbol);
          if (res) {
            setStockInfo({
              cmp: res.currentPrice || res.cmp || 0,
              changePercent: res.percentChange || res.changePercent || 0
            });
          }
        } catch (err) {
          console.error("Failed to load stock details dynamically:", err);
        }
      };
      loadDetails();
    }
  }, [currentPrice, changePercent, symbol, showModal]);

  // Load user's watchlist item state
  const fetchWatchlistState = async () => {
    if (!user) {
      setIsWatched(false);
      return;
    }

    try {
      const res = await getWatchlist();
      if (res && res.success && res.data) {
        const item = res.data.find(w => w.symbol.toUpperCase() === formattedSymbol);
        if (item) {
          setIsWatched(true);
          setAlertThreshold(item.alertThreshold);
          setInputThreshold(item.alertThreshold.toString());
          
          // Pre-populate target price based on watched threshold and current direction
          if (prevClose > 0) {
            const price = direction === "upside"
              ? prevClose * (1 + item.alertThreshold / 100)
              : prevClose * (1 - item.alertThreshold / 100);
            setInputPrice(price.toFixed(2));
          }
        } else {
          setIsWatched(false);
        }
      }
    } catch (err) {
      console.error("[Watchlist State Fetch Error]:", err);
    }
  };

  useEffect(() => {
    fetchWatchlistState();

    const handleWatchlistUpdate = () => {
      fetchWatchlistState();
    };

    window.addEventListener("watchlist-updated", handleWatchlistUpdate);
    return () => {
      window.removeEventListener("watchlist-updated", handleWatchlistUpdate);
    };
  }, [user, symbol, prevClose]);

  // Handle threshold modifications -> update target price
  const handleThresholdChange = (valStr) => {
    setInputThreshold(valStr);
    const val = parseFloat(valStr);
    if (!isNaN(val) && val >= 0 && prevClose > 0) {
      const price = direction === "upside"
        ? prevClose * (1 + val / 100)
        : prevClose * (1 - val / 100);
      setInputPrice(price.toFixed(2));
    } else {
      setInputPrice("");
    }
  };

  // Handle target price modifications -> update threshold + direction
  const handlePriceChange = (valStr) => {
    setInputPrice(valStr);
    const price = parseFloat(valStr);
    if (!isNaN(price) && price > 0 && prevClose > 0) {
      const diff = Math.abs(price - prevClose);
      const val = (diff / prevClose) * 100;
      setInputThreshold(val.toFixed(1));
      setDirection(price >= prevClose ? "upside" : "downside");
    } else {
      setInputThreshold("");
    }
  };

  // Handle direction switch -> update target price
  const handleDirectionChange = (newDir) => {
    setDirection(newDir);
    const val = parseFloat(inputThreshold);
    if (!isNaN(val) && val >= 0 && prevClose > 0) {
      const price = newDir === "upside"
        ? prevClose * (1 + val / 100)
        : prevClose * (1 - val / 100);
      setInputPrice(price.toFixed(2));
    }
  };

  // Setup initial modal fields when opened
  useEffect(() => {
    if (showModal && prevClose > 0) {
      const thresholdVal = parseFloat(inputThreshold) || 3.0;
      const price = direction === "upside"
        ? prevClose * (1 + thresholdVal / 100)
        : prevClose * (1 - thresholdVal / 100);
      setInputPrice(price.toFixed(2));
    }
  }, [showModal, prevClose]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      return;
    }

    if (isWatched) {
      try {
        setLoading(true);
        await removeFromWatchlist(formattedSymbol);
        setIsWatched(false);
        window.dispatchEvent(new CustomEvent("watchlist-updated"));
      } catch (err) {
        console.error("[Watchlist Remove Error]:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const val = parseFloat(inputThreshold);
    if (isNaN(val) || val <= 0) return;

    try {
      setLoading(true);
      await addToWatchlist(formattedSymbol, val);
      setIsWatched(true);
      setAlertThreshold(val);
      setShowModal(false);
      window.dispatchEvent(new CustomEvent("watchlist-updated"));
    } catch (err) {
      console.error("[Watchlist Add Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  const cleanSymbol = symbol.replace(".NS", "");

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none duration-200 active:scale-95 ${
          isWatched
            ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
            : "bg-bg-1 border-border-strong text-text-2 hover:bg-bg-2 hover:text-text-0"
        } ${className}`}
        title={isWatched ? `Watching (Alert at ±${alertThreshold}%)` : "Watch stock"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-text-2" />
        ) : (
          <Star className="h-4 w-4" fill={isWatched ? "currentColor" : "none"} />
        )}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-text-0 font-bold mb-1">Set Price Alert</h3>
            <p className="text-xs text-text-2 mb-4">
              Sync alert values dynamically. Setting one updates the other relative to current prices.
            </p>

            <form onSubmit={handleSaveThreshold} className="flex flex-col gap-4">
              
              {/* CURRENT STOCK STATS */}
              <div className="bg-bg-0 p-3 rounded-xl flex items-center justify-between border border-border-custom/50 text-xs">
                <div>
                  <span className="font-mono font-bold text-text-0">{cleanSymbol}</span>
                  <span className="text-[10px] text-text-3 ml-2 font-mono">Last Price</span>
                </div>
                <div className="font-mono text-text-1">
                  ₹{stockInfo.cmp ? stockInfo.cmp.toLocaleString("en-IN") : "-"} 
                  <span className={`ml-2 text-[10px] ${pctChange >= 0 ? "text-bull" : "text-bear"}`}>
                    ({pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* DIRECTION SELECTOR */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                  Alert Direction
                </label>
                <div className="grid grid-cols-2 gap-2 bg-bg-0 p-1 rounded-xl text-xs font-mono font-semibold">
                  <button
                    type="button"
                    onClick={() => handleDirectionChange("upside")}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                      direction === "upside" ? "bg-bull/10 text-bull shadow-sm" : "text-text-2 hover:text-text-0"
                    }`}
                  >
                    Upside (&gt;= Target)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectionChange("downside")}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
                      direction === "downside" ? "bg-bear/10 text-bear shadow-sm" : "text-text-2 hover:text-text-0"
                    }`}
                  >
                    Downside (&lt;= Target)
                  </button>
                </div>
              </div>

              {/* DUAL SYNC INPUTS CONTAINER */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* THRESHOLD PERCENTAGE INPUT */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Change Threshold
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={inputThreshold}
                      onChange={(e) => handleThresholdChange(e.target.value)}
                      className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-xs text-text-0 focus:border-bull focus:outline-none font-mono"
                    />
                    <span className="absolute right-4 text-text-2 text-xs font-semibold">%</span>
                  </div>
                </div>

                {/* TARGET PRICE INPUT */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Target Price
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={inputPrice}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-xs text-text-0 focus:border-bull focus:outline-none font-mono"
                    />
                    <span className="absolute right-4 text-text-2 text-xs font-semibold">₹</span>
                  </div>
                </div>

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-2 border-t border-border-custom pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(false);
                  }}
                  className="rounded-lg border border-border-strong bg-bg-1 px-4 py-2 text-xs font-medium text-text-1 hover:bg-border-custom/50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-bull px-4 py-2 text-xs font-medium text-white hover:bg-bull/90 cursor-pointer animate-fade-in"
                >
                  Set Alert
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WatchToggle;
