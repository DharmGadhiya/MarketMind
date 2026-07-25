import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2, Bell, Star } from "lucide-react";
import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import { useUser } from "../services/UserContext";
import { getWatchlist, removeFromWatchlist } from "../services/newsApi";
import { formatNum } from "../Utilities/utils/format";

/**
 * WatchlistPage Component
 * Displays the user's current watchlist with live prices, changes, alert thresholds,
 * and allows deleting entries directly.
 */
const WatchlistPage = () => {
  const { user } = useUser();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      // Dispatch update to sync other star toggles
      window.dispatchEvent(new CustomEvent("watchlist-updated"));
    } catch (err) {
      console.error("[Watchlist Page Delete Error]:", err);
    }
  };

  const handleTriggerLogin = () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Header />
        <TickerTape />

        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-12">
          {/* TITLE SECTION */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl text-text-0 mb-2 transition-colors flex items-center gap-3">
              <Star className="text-bull" size={28} fill="currentColor" /> My Watchlist
            </h1>
            <p className="text-sm text-text-2 transition-colors max-w-xl">
              Monitor your favorite tickers, track live changes, and receive instant email alerts when thresholds are crossed.
            </p>
          </div>

          {/* WATCHLIST CONTAINER */}
          {!user ? (
            /* LOGGED OUT STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-16 px-6 text-center shadow-lg transition-colors flex flex-col items-center justify-center gap-4">
              <Bell className="text-text-3 animate-bounce" size={48} />
              <h2 className="font-serif text-xl font-bold text-text-0">Access Your Watchlist</h2>
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
            /* LOADING STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-20 text-center shadow-lg flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-bull" size={36} />
              <p className="font-mono text-xs text-text-2 tracking-wider">Accessing Watchlist Database...</p>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-16 text-center shadow-lg">
              <p className="text-bear text-sm font-semibold mb-2">⚠️ {error}</p>
              <p className="text-text-3 text-xs">Ensure your backend server is active and try refreshing.</p>
            </div>
          ) : watchlist.length === 0 ? (
            /* EMPTY STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-20 px-6 text-center shadow-lg transition-colors flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-bull/10 flex items-center justify-center text-bull">
                <Star size={24} />
              </div>
              <h2 className="font-serif text-lg font-bold text-text-0">Your watchlist is empty</h2>
              <p className="text-xs text-text-2 max-w-md leading-relaxed">
                Start watching stocks by clicking the star (★) icon in the Home Terminal list or on any stock details page.
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
                      <th className="py-4 px-4 text-center">Alert Threshold</th>
                      <th className="py-4 px-4 text-center">Last Alerted</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom font-sans text-xs sm:text-sm transition-colors">
                    {watchlist.map((item) => {
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

                          {/* Alert Threshold */}
                          <td className="py-4 px-4 text-center font-mono text-text-1 font-semibold">
                            {item.alertThreshold.toFixed(1)}%
                          </td>

                          {/* Last Alerted */}
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

                          {/* Actions */}
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleRemove(item.symbol)}
                              className="p-2 rounded-lg text-bear hover:bg-bear/10 border border-transparent hover:border-bear/20 transition-all cursor-pointer inline-flex items-center justify-center"
                              title="Remove from Watchlist"
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
