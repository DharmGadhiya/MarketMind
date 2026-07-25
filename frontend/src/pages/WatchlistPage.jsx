import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2, Bell, Star } from "lucide-react";
import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import { useUser } from "../services/UserContext";
import { getWatchlist, removeFromWatchlist, addToWatchlist } from "../services/newsApi";
import { formatNum } from "../Utilities/utils/format";

/**
 * WatchlistPage Component
 * Displays the user's current watchlist with live prices, changes, alert thresholds,
 * and allows deleting entries directly.
 */
const WatchlistPage = ({ type = "watchlist" }) => {
  const { user } = useUser();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ALERT_TIPS = [
    "In the short run, the market is a voting machine, but in the long run, it is a weighing machine. — Benjamin Graham",
    "Opportunity is missed by most people because it is dressed in overalls and looks like work. — Thomas Edison",
    "Buy when there is blood in the streets, even if the blood is your own. — Baron Rothschild",
    "The stock market is filled with individuals who know the price of everything, but the value of nothing. — Philip Fisher",
    "Markets can remain irrational longer than you can remain solvent. — John Maynard Keynes"
  ];

  const WATCHLIST_TIPS = [
    "The stock market is a device for transferring money from the active to the patient. — Warren Buffett",
    "Waiting helps you as an investor, and a lot of people just can't stand to wait. — Charlie Munger",
    "You don't need to be a rocket scientist. Investing is not a game where the guy with 160 IQ beats the guy with 130 IQ. — Warren Buffett",
    "The best time to buy a stock is when its long-term viability is intact, but the short-term outlook is gloomy.",
    "Time is the friend of the wonderful company, the enemy of the mediocre. — Warren Buffett"
  ];

  const [activeTip, setActiveTip] = useState("");

  useEffect(() => {
    if (!loading) return;
    const tips = type === "alerts" ? ALERT_TIPS : WATCHLIST_TIPS;
    const randomIndex = Math.floor(Math.random() * tips.length);
    setActiveTip(tips[randomIndex]);
  }, [loading, type]);

  const fetchWatchlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getWatchlist();
      if (res && res.success) {
        setWatchlist(res.data || []);
      } else {
        setError("Failed to retrieve watchlist data.");
      }
    } catch (err) {
      console.error("[Watchlist Page Fetch Error]:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();

    const handleWatchlistUpdate = () => {
      fetchWatchlist();
    };

    window.addEventListener("watchlist-updated", handleWatchlistUpdate);
    return () => {
      window.removeEventListener("watchlist-updated", handleWatchlistUpdate);
    };
  }, [user]);

  const handleRemove = async (item) => {
    try {
      if (type === "alerts") {
        // Disable only price alert: threshold = 0, preserve isWatched
        await addToWatchlist(item.symbol, 0, !!item.isWatched);
      } else {
        // Disable only watchlist: isWatched = false, preserve alertThreshold
        await addToWatchlist(item.symbol, item.alertThreshold, false);
      }
      // Dispatch update to sync other toggles
      window.dispatchEvent(new CustomEvent("watchlist-updated"));
    } catch (err) {
      console.error("[Watchlist Page Delete Error]:", err);
    }
  };

  const handleTriggerLogin = () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  // Filter items based on type
  const filteredList = watchlist.filter(item => {
    if (type === "alerts") {
      return item.alertThreshold > 0;
    } else {
      return item.isWatched || item.alertThreshold === 0;
    }
  });

  const Icon = type === "alerts" ? Bell : Star;
  const iconColor = type === "alerts" ? "text-emerald-500" : "text-amber-500";
  const pageTitle = type === "alerts" ? "Price Alerts" : "My Watchlist";
  const pageDesc = type === "alerts"
    ? "Manage your active price threshold triggers. Receive instant email and terminal alerts when stock prices cross these boundaries."
    : "Monitor your favorite tickers and track live market performance. No price alert triggers or notifications are configured for these assets.";

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Header />
        <TickerTape />

        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-12">
          {/* TITLE SECTION */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl text-text-0 mb-2 transition-colors flex items-center gap-3">
              <Icon className={iconColor} size={28} fill="currentColor" /> {pageTitle}
            </h1>
            <p className="text-sm text-text-2 transition-colors max-w-xl">
              {pageDesc}
            </p>
          </div>

          {/* WATCHLIST CONTAINER */}
          {!user ? (
            /* LOGGED OUT STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-16 px-6 text-center shadow-lg transition-colors flex flex-col items-center justify-center gap-4">
              <Bell className="text-text-3 animate-bounce" size={48} />
              <h2 className="font-serif text-xl font-bold text-text-0">Access Your Workspace</h2>
              <p className="text-sm text-text-2 max-w-md">
                Log in to your MarketMind account to start watching stocks, tracking performance, and setting up custom email alerts.
              </p>
              <button
                onClick={handleTriggerLogin}
                className="mt-2 rounded-xl bg-bull hover:bg-bull/90 px-6 py-2.5 text-xs font-semibold text-white transition-all active:scale-95 shadow-md cursor-pointer"
              >
                Login to Terminal
              </button>
            </div>
          ) : loading ? (
            /* PREMIUM LOADER SCREEN */
            <div className="mx-auto max-w-xl border border-border-custom bg-bg-1/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col gap-6 items-center my-10 select-none text-center animate-fade-in">
              {/* THEMATIC ICON CONTAINER */}
              <div className="flex flex-col items-center justify-center relative py-4">
                {type === "alerts" ? (
                  <>
                    <div className="absolute h-32 w-32 rounded-full border border-rose-500/20 animate-ping opacity-30" />
                    <div className="absolute h-24 w-24 rounded-full border border-rose-500/30 animate-pulse opacity-60" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-rose-500/10 to-rose-500/30 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-500/10">
                      <Bell className="h-7 w-7 text-rose-500 animate-bounce" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute h-32 w-32 rounded-full border border-amber-500/20 animate-ping opacity-30" />
                    <div className="absolute h-24 w-24 rounded-full border border-amber-500/30 animate-pulse opacity-60" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-amber-500/10 to-amber-500/30 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                      <Star className="h-7 w-7 text-amber-500 animate-spin" style={{ animationDuration: "6s" }} />
                    </div>
                  </>
                )}
              </div>

              {/* WISDOM QUOTE */}
              <div className="space-y-4 max-w-md">
                <div className="relative">
                  <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-serif leading-none select-none ${
                    type === "alerts" ? "text-rose-500/5" : "text-amber-500/5"
                  }`}>“</span>
                  <p className="font-serif text-[22px] font-extrabold text-text-0 leading-relaxed relative pt-2 px-4 transition-all duration-300">
                    {activeTip}
                  </p>
                </div>
              </div>

              {/* ACTION TEXT */}
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className={`h-3.5 w-3.5 animate-spin ${
                  type === "alerts" ? "text-rose-500" : "text-amber-500"
                }`} />
                <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] animate-pulse ${
                  type === "alerts" ? "text-rose-500" : "text-amber-500"
                }`}>
                  {type === "alerts" ? "Scanning active price thresholds..." : "Syncing watched tickers..."}
                </span>
              </div>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-16 text-center shadow-lg">
              <p className="text-bear text-sm font-semibold mb-2">⚠️ {error}</p>
              <p className="text-text-3 text-xs">Ensure your backend server is active and try refreshing.</p>
            </div>
          ) : filteredList.length === 0 ? (
            /* EMPTY STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-20 px-6 text-center shadow-lg transition-colors flex flex-col items-center justify-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${type === "alerts" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                <Icon size={24} />
              </div>
              <h2 className="font-serif text-lg font-bold text-text-0">
                {type === "alerts" ? "No active price alerts" : "Your watchlist is empty"}
              </h2>
              <p className="text-xs text-text-2 max-w-md leading-relaxed">
                {type === "alerts"
                  ? "Configure price alerts by clicking the bell icon next to any stock in the Terminal."
                  : "Start watching stocks by clicking the star icon in the Terminal list or on any stock details page."}
              </p>
              <Link
                to="/"
                className="mt-2 rounded-xl border border-border-strong bg-bg-2 px-5 py-2.5 text-xs font-semibold text-text-0 hover:bg-bg-0 transition-colors shadow-sm"
              >
                Go to Terminal
              </Link>
            </div>
          ) : (
            /* LIST STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 overflow-hidden shadow-lg transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg-2 border-b border-border-strong text-[10px] font-mono uppercase tracking-wider text-text-2 transition-colors">
                      <th className="py-4 px-6">Symbol</th>
                      <th className="py-4 px-4">Company Name</th>
                      <th className="py-4 px-4 text-right">Last Price (CMP)</th>
                      <th className="py-4 px-4 text-right">Change (%)</th>
                      {type === "alerts" && (
                        <>
                          <th className="py-4 px-4 text-center">Alert Threshold</th>
                          <th className="py-4 px-4 text-center">Last Alerted</th>
                        </>
                      )}
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom font-sans text-xs sm:text-sm transition-colors">
                    {filteredList.map((item) => {
                      const cleanSymbol = item.symbol.replace(".NS", "");
                      const isPositive = item.changePercent >= 0;
                      
                      return (
                        <tr key={item._id} className="hover:bg-bg-2/30 transition-colors">
                          {/* Symbol */}
                          <td className="py-4 px-6">
                            <Link
                              to={`/stock/${encodeURIComponent(cleanSymbol)}`}
                              className="font-mono text-xs font-bold uppercase bg-black/5 dark:bg-white/5 hover:bg-bull/10 px-2 py-0.5 rounded text-bull transition-colors"
                            >
                              {cleanSymbol}
                            </Link>
                          </td>

                          {/* Name */}
                          <td className="py-4 px-4 text-text-0 font-semibold max-w-[200px] truncate">
                            {item.name || cleanSymbol}
                          </td>

                          {/* Last Price */}
                          <td className="py-4 px-4 text-right font-mono text-text-0 font-medium">
                            ₹{formatNum(item.cmp)}
                          </td>

                          {/* Price Change */}
                          <td className="py-4 px-4 text-right font-mono font-bold">
                            <span
                              className={`inline-flex min-w-[70px] items-center justify-center rounded px-2 py-0.5 text-xs ${
                                isPositive ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                              }`}
                            >
                              {isPositive ? "+" : ""}{item.changePercent.toFixed(2)}%
                            </span>
                          </td>

                          {/* Alert Threshold & Last Alerted for alerts view only */}
                          {type === "alerts" && (
                            <>
                              <td className="py-4 px-4 text-center font-mono text-text-1 font-semibold">
                                {item.alertThreshold.toFixed(1)}%
                              </td>
                              <td className="py-4 px-4 text-center text-xs text-text-2 font-mono">
                                {item.lastAlertedAt
                                  ? new Date(item.lastAlertedAt).toLocaleString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Never"}
                              </td>
                            </>
                          )}

                          {/* Actions */}
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleRemove(item)}
                              className="p-2 rounded-lg text-bear hover:bg-bear/10 border border-transparent hover:border-bear/20 transition-all cursor-pointer inline-flex items-center justify-center"
                              title={type === "alerts" ? "Delete Price Alert" : "Remove from Watchlist"}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border-custom bg-bg-2 transition-colors duration-300">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-text-0 transition-colors">MarketMind</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="font-mono text-[9px] text-text-3">
            All price notifications are sent automatically using Brevo API integration.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WatchlistPage;
