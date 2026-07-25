import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, Bell, Loader2, X } from "lucide-react";
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
const WatchToggle = ({ symbol, currentPrice, changePercent, className = "", iconClassName = "h-4 w-4", buttonClassName = "h-7 w-7 p-1.5 rounded-lg" }) => {
  const { user } = useUser();
  
  const [isWatched, setIsWatched] = useState(false);
  const [isAlertSet, setIsAlertSet] = useState(false);
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
      setIsAlertSet(false);
      return;
    }

    try {
      const res = await getWatchlist();
      if (res && res.success && res.data) {
        const item = res.data.find(w => w.symbol.toUpperCase() === formattedSymbol);
        if (item) {
          // If the item exists, set states independently
          const watchedVal = !!item.isWatched;
          const alertVal = item.alertThreshold > 0;
          
          setIsWatched(watchedVal);
          setIsAlertSet(alertVal);
          setAlertThreshold(item.alertThreshold);
          setInputThreshold(item.alertThreshold.toString());
          
          // Pre-populate target price based on alert threshold and current direction
          if (alertVal && prevClose > 0) {
            const price = direction === "upside"
              ? prevClose * (1 + item.alertThreshold / 100)
              : prevClose * (1 - item.alertThreshold / 100);
            setInputPrice(price.toFixed(2));
          }
        } else {
          setIsWatched(false);
          setIsAlertSet(false);
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

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      return;
    }

    try {
      setLoading(true);
      if (isWatched) {
        // Toggle off watchlist, preserve current alertThreshold if active
        await addToWatchlist(formattedSymbol, isAlertSet ? alertThreshold : 0, false);
        setIsWatched(false);
      } else {
        // Toggle on watchlist, preserve current alertThreshold if active
        await addToWatchlist(formattedSymbol, isAlertSet ? alertThreshold : 0, true);
        setIsWatched(true);
      }
      window.dispatchEvent(new CustomEvent("watchlist-updated"));
    } catch (err) {
      console.error("[Watchlist Click Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.dispatchEvent(new CustomEvent("open-login-modal"));
      return;
    }

    setShowModal(true);
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const val = parseFloat(inputThreshold);
    if (isNaN(val) || val <= 0) return;

    try {
      setLoading(true);
      // Save price alert, preserve current isWatched status
      await addToWatchlist(formattedSymbol, val, isWatched);
      setIsAlertSet(true);
      setAlertThreshold(val);
      setShowModal(false);
      window.dispatchEvent(new CustomEvent("watchlist-updated"));
    } catch (err) {
      console.error("[Watchlist Add Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      // Deactivate only alert: threshold = 0, preserve isWatched status
      await addToWatchlist(formattedSymbol, 0, isWatched);
      setIsAlertSet(false);
      setAlertThreshold(0);
      setShowModal(false);
      window.dispatchEvent(new CustomEvent("watchlist-updated"));
    } catch (err) {
      console.error("[Watchlist Remove Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  const cleanSymbol = symbol.replace(".NS", "");

  return (
    <div className="flex items-center gap-1.5 z-10">
      {/* 1. WATCHLIST BUTTON (STAR) */}
      <button
        onClick={handleWatchlistClick}
        disabled={loading}
        className={`flex items-center justify-center transition-all cursor-pointer select-none duration-200 active:scale-90 border ${buttonClassName} ${
          isWatched
            ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
            : "bg-bg-1 border-border-strong/70 text-text-1 hover:bg-bg-2 hover:text-text-0 shadow-sm"
        }`}
        title={isWatched ? "Remove from Watch List" : "Add to Watch List"}
      >
        {loading ? (
          <Loader2 className={`${iconClassName} animate-spin text-text-2`} />
        ) : (
          <Star className={iconClassName} fill={isWatched ? "currentColor" : "none"} />
        )}
      </button>

      {/* 2. PRICE ALERT BUTTON (BELL) */}
      <button
        onClick={handleAlertClick}
        disabled={loading}
        className={`flex items-center justify-center transition-all cursor-pointer select-none duration-200 active:scale-90 border ${buttonClassName} ${
          isAlertSet
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
            : "bg-bg-1 border-border-strong/70 text-text-1 hover:bg-bg-2 hover:text-text-0 shadow-sm"
        }`}
        title={isAlertSet ? `Alert active at ±${alertThreshold}%` : "Set Price Alert"}
      >
        {loading ? (
          <Loader2 className={`${iconClassName} animate-spin text-text-2`} />
        ) : (
          <Bell className={iconClassName} fill={isAlertSet ? "currentColor" : "none"} />
        )}
      </button>

      {/* PRICE ALERT CONFIG MODAL */}
      {showModal && createPortal(
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-lg text-text-0 font-bold">Configure Price Alert</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-3 hover:text-text-0 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[11px] text-text-2 mb-4 leading-relaxed">
              Trigger immediate email alerts when absolute price changes cross your threshold for {cleanSymbol}.
            </p>

            {/* CURRENT STOCK STATS */}
            <div className="bg-bg-0 p-3 rounded-xl flex items-center justify-between border border-border-custom/50 text-xs mb-4">
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

            {isAlertSet ? (
              <div className="space-y-3 text-left">
                <div className="text-xs font-mono bg-emerald-500/5 text-emerald-700 px-3.5 py-2.5 rounded-xl border border-emerald-500/15">
                  Current alert trigger: <span className="font-bold">±{alertThreshold}%</span> (Target: <span className="font-bold">₹{inputPrice}</span>)
                </div>
                <button
                  onClick={handleRemoveFromWatchlist}
                  disabled={loading}
                  className="w-full text-center text-xs font-semibold text-bear bg-bear/5 border border-bear/10 hover:border-bear/30 rounded-xl py-2.5 transition-all cursor-pointer"
                >
                  Delete Price Alert
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveThreshold} className="space-y-4 text-left">
                {/* DIRECTION SELECTOR */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-2 font-semibold">Direction</span>
                  <div className="grid grid-cols-2 gap-1.5 bg-bg-0 p-0.5 rounded-lg text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleDirectionChange("upside")}
                      className={`py-1.5 rounded-md transition-colors cursor-pointer text-center font-bold ${
                        direction === "upside" ? "bg-bull/10 text-bull" : "text-text-2 hover:text-text-0"
                      }`}
                    >
                      Upside (&gt;= Target)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectionChange("downside")}
                      className={`py-1.5 rounded-md transition-colors cursor-pointer text-center font-bold ${
                        direction === "downside" ? "bg-bear/10 text-bear" : "text-text-2 hover:text-text-0"
                      }`}
                    >
                      Downside (&lt;= Target)
                    </button>
                  </div>
                </div>

                {/* TARGET PRICE & PERCENTAGE INPUTS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-text-2 font-semibold">Threshold (%)</span>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={inputThreshold}
                        onChange={(e) => handleThresholdChange(e.target.value)}
                        className="w-full rounded-lg border border-border-strong bg-bg-0 pl-2.5 pr-5 py-2 text-xs text-text-0 focus:border-bull focus:outline-none font-mono"
                      />
                      <span className="absolute right-3 text-text-2 text-[10px] font-bold">%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-text-2 font-semibold">Target Price (₹)</span>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={inputPrice}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="w-full rounded-lg border border-border-strong bg-bg-0 pl-2.5 pr-5 py-2 text-xs text-text-0 focus:border-bull focus:outline-none font-mono"
                      />
                      <span className="absolute right-3 text-text-2 text-[10px] font-bold">₹</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-center text-xs font-semibold bg-bull text-white hover:bg-bull/95 rounded-xl py-2.5 transition-all cursor-pointer active:scale-95"
                >
                  Set Price Alert
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default WatchToggle;
