import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2, Pencil, Plus, Briefcase, TrendingUp, TrendingDown, X, Info, Lock, Shield } from "lucide-react";
import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import { useUser } from "../services/UserContext";
import { getHoldings, addHolding, updateHolding, removeHolding } from "../services/newsApi";
import { formatNum } from "../Utilities/utils/format";

/**
 * PortfolioPage Component
 * Displays the user's investment portfolio with real-time P&L calculations
 * based on live stock prices from the database. Supports adding, editing,
 * and deleting individual transaction entries.
 */
const PortfolioPage = () => {
  const { user } = useUser();
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PORTFOLIO_TIPS = [
    "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1. — Warren Buffett",
    "The individual investor should act consistently as an investor and not as a speculator. — Benjamin Graham",
    "The core of portfolio management is the control of investment risks, not the avoidance of them.",
    "Know what you own, and know why you own it. — Peter Lynch",
    "In investing, what is comfortable is rarely profitable. — Robert Arnott",
    "Risk comes from not knowing what you're doing. — Warren Buffett"
  ];

  const [activeTip, setActiveTip] = useState("");

  useEffect(() => {
    if (!loading) return;
    const randomIndex = Math.floor(Math.random() * PORTFOLIO_TIPS.length);
    setActiveTip(PORTFOLIO_TIPS[randomIndex]);
  }, [loading]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    symbol: "",
    buyPrice: "",
    qty: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchPortfolio = async (showLoading = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);
      const res = await getHoldings();
      if (res && res.success) {
        setHoldings(res.data || []);
        setSummary(
          res.summary || {
            totalInvested: 0,
            totalCurrentValue: 0,
            totalPnl: 0,
            totalPnlPercent: 0,
          }
        );
      } else {
        setError("Failed to retrieve portfolio data.");
      }
    } catch (err) {
      console.error("[Portfolio Page Fetch Error]:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Sync state on user change & set up polling
  useEffect(() => {
    fetchPortfolio(true);

    if (user) {
      // Refresh every 60s to align with stock cron updates
      const interval = setInterval(() => {
        fetchPortfolio(false);
      }, 60000);

      // Refresh on window focus to get latest prices
      const handleFocus = () => {
        fetchPortfolio(false);
      };
      window.addEventListener("focus", handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, [user]);

  const handleTriggerLogin = () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  const handleOpenAddModal = () => {
    setFormData({ symbol: "", buyPrice: "", qty: "" });
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (holding) => {
    setEditingId(holding._id);
    setFormData({
      symbol: holding.symbol.replace(".NS", ""),
      buyPrice: holding.buyPrice.toString(),
      qty: holding.qty.toString(),
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const { symbol, buyPrice, qty } = formData;

    if (!symbol || !buyPrice || !qty) {
      setModalError("All fields are required.");
      return;
    }

    const price = parseFloat(buyPrice);
    const quantity = parseFloat(qty);

    if (isNaN(price) || price <= 0) {
      setModalError("Buy price must be a positive number.");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      setModalError("Quantity must be a positive number.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      const res = await addHolding(symbol, price, quantity);
      if (res && res.success) {
        setIsAddModalOpen(false);
        fetchPortfolio(false);
      } else {
        setModalError(res.msg || "Failed to add holding.");
      }
    } catch (err) {
      setModalError(err.response?.data?.msg || "Server error. Could not record trade.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { buyPrice, qty } = formData;

    if (!buyPrice || !qty) {
      setModalError("All fields are required.");
      return;
    }

    const price = parseFloat(buyPrice);
    const quantity = parseFloat(qty);

    if (isNaN(price) || price <= 0) {
      setModalError("Buy price must be a positive number.");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      setModalError("Quantity must be a positive number.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      const res = await updateHolding(editingId, price, quantity);
      if (res && res.success) {
        setIsEditModalOpen(false);
        fetchPortfolio(false);
      } else {
        setModalError(res.msg || "Failed to update holding.");
      }
    } catch (err) {
      setModalError(err.response?.data?.msg || "Server error. Could not update trade.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trade record?")) return;

    try {
      await removeHolding(id);
      fetchPortfolio(false);
    } catch (err) {
      console.error("[Portfolio Delete Error]:", err);
      alert("Failed to remove transaction record.");
    }
  };

  const isPnlPositive = summary.totalPnl >= 0;

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col justify-between">
      <div>
        <Header />
        <TickerTape />

        <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-12">
          {/* TITLE & HEADER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-text-0 mb-2 transition-colors flex items-center gap-3">
                <Briefcase className="text-bull" size={28} /> Portfolio Tracker
              </h1>
              <p className="text-sm text-text-2 transition-colors max-w-xl">
                Log and monitor individual trade entries, track real-time P&L fluctuations, and review investment value.
              </p>
            </div>
            {user && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl bg-bull hover:bg-bull/90 px-5 py-2.5 text-xs font-semibold text-white transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Transaction
              </button>
            )}
          </div>

          {/* LOGGED OUT STATE */}
          {!user ? (
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-16 px-6 text-center shadow-lg transition-colors flex flex-col items-center justify-center gap-4">
              <Briefcase className="text-text-3 animate-bounce" size={48} />
              <h2 className="font-serif text-xl font-bold text-text-0">Monitor Your Portfolio</h2>
              <p className="text-sm text-text-2 max-w-md">
                Log in to your MarketMind account to track your investment performance, analyze portfolio aggregates, and manage trade records.
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
                <div className="absolute h-32 w-32 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
                <div className="absolute h-24 w-24 rounded-full border border-emerald-500/30 animate-pulse opacity-60" />
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-500/10 to-emerald-500/30 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <Shield className="h-7 w-7 text-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* WISDOM QUOTE */}
              <div className="space-y-4 max-w-md">
                <div className="flex justify-center">
                  <span className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded font-bold border text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                    Capital Vault
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-serif leading-none select-none text-emerald-500/5">“</span>
                  <p className="font-serif text-[22px] font-extrabold text-text-0 leading-relaxed relative pt-2 px-4 transition-all duration-300">
                    {activeTip}
                  </p>
                </div>
              </div>

              {/* ACTION TEXT */}
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] animate-pulse text-emerald-500">
                  Decrypting investment ledger...
                </span>
              </div>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-16 text-center shadow-lg">
              <p className="text-bear text-sm font-semibold mb-2">⚠️ {error}</p>
              <p className="text-text-3 text-xs">Ensure your backend server is active and try refreshing.</p>
            </div>
          ) : holdings.length === 0 ? (
            /* EMPTY STATE */
            <div className="rounded-2xl border border-border-strong bg-bg-1 py-20 px-6 text-center shadow-lg transition-colors flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full bg-bull/10 flex items-center justify-center text-bull border border-bull/20">
                <Briefcase size={22} />
              </div>
              <h2 className="font-serif text-lg font-bold text-text-0">No trade logs found</h2>
              <p className="text-xs text-text-2 max-w-md leading-relaxed">
                Your portfolio terminal is currently empty. Start logging buy transactions to track your P&L performance.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="mt-2 rounded-xl bg-bull hover:bg-bull/90 px-5 py-2.5 text-xs font-semibold text-white transition-colors shadow-md cursor-pointer"
              >
                Add Your First Trade
              </button>
            </div>
          ) : (
            /* ACTIVE PORTFOLIO VIEW */
            <div className="flex flex-col gap-8">
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Total Invested */}
                <div className="rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-sm transition-all hover:shadow-md">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-2 font-semibold">
                    Total Invested
                  </span>
                  <h3 className="font-sans text-2xl font-bold text-text-0 mt-1">
                    ₹{formatNum(summary.totalInvested)}
                  </h3>
                  <div className="text-[10px] text-text-3 font-mono mt-2">
                    Principal investment cost
                  </div>
                </div>

                {/* Current Value */}
                <div className="rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-sm transition-all hover:shadow-md">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-2 font-semibold">
                    Current Portfolio Value
                  </span>
                  <h3 className="font-sans text-2xl font-bold text-text-0 mt-1">
                    ₹{formatNum(summary.totalCurrentValue)}
                  </h3>
                  <div className="text-[10px] text-text-3 font-mono mt-2">
                    Valued at latest market prices
                  </div>
                </div>

                {/* Total P&L */}
                <div className="rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-sm transition-all hover:shadow-md">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-2 font-semibold">
                    Total Returns (P&L)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3
                      className={`font-sans text-2xl font-bold ${
                        isPnlPositive ? "text-bull" : "text-bear"
                      }`}
                    >
                      {isPnlPositive ? "+" : ""}₹{formatNum(summary.totalPnl)}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-bold font-mono ${
                        isPnlPositive ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
                      }`}
                    >
                      {isPnlPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isPnlPositive ? "+" : ""}
                      {summary.totalPnlPercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-text-3 font-mono mt-2">
                    Net unrealised capital gains
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="rounded-2xl border border-border-strong bg-bg-1 overflow-hidden shadow-lg transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-2 border-b border-border-strong text-[10px] font-mono uppercase tracking-wider text-text-2 transition-colors">
                        <th className="py-4 px-6">Symbol</th>
                        <th className="py-4 px-4">Company Name</th>
                        <th className="py-4 px-4 text-right">Qty</th>
                        <th className="py-4 px-4 text-right">Avg. Price (₹)</th>
                        <th className="py-4 px-4 text-right">Live Price (₹)</th>
                        <th className="py-4 px-4 text-right">Invested Value</th>
                        <th className="py-4 px-4 text-right">Current Value</th>
                        <th className="py-4 px-4 text-right">Unrealised Returns (P&L)</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-custom font-sans text-xs sm:text-sm transition-colors">
                      {holdings.map((item) => {
                        const cleanSymbol = item.symbol.replace(".NS", "");
                        const isLiveAvailable = item.cmp !== null;
                        const itemPnlPositive = item.pnl >= 0;

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

                            {/* Company Name */}
                            <td className="py-4 px-4 text-text-0 font-semibold max-w-[150px] truncate">
                              {item.name || cleanSymbol}
                            </td>

                            {/* Qty */}
                            <td className="py-4 px-4 text-right font-mono text-text-1">
                              {formatNum(item.qty)}
                            </td>

                            {/* Avg. Price */}
                            <td className="py-4 px-4 text-right font-mono text-text-1">
                              ₹{formatNum(item.buyPrice)}
                            </td>

                            {/* Live Price */}
                            <td className="py-4 px-4 text-right font-mono">
                              {isLiveAvailable ? (
                                <span className="text-text-0 font-medium">₹{formatNum(item.cmp)}</span>
                              ) : (
                                <span className="text-text-3 font-mono" title="Awaiting Yahoo Finance update.">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Invested Value */}
                            <td className="py-4 px-4 text-right font-mono text-text-1">
                              ₹{formatNum(item.buyPrice * item.qty)}
                            </td>

                            {/* Current Value */}
                            <td className="py-4 px-4 text-right font-mono">
                              {isLiveAvailable ? (
                                <span className="text-text-0 font-medium">
                                  ₹{formatNum(item.cmp * item.qty)}
                                </span>
                              ) : (
                                <span className="text-text-3 font-mono">—</span>
                              )}
                            </td>

                            {/* Unrealised returns */}
                            <td className="py-4 px-4 text-right font-mono font-bold">
                              {isLiveAvailable ? (
                                <div className="flex flex-col items-end">
                                  <span className={itemPnlPositive ? "text-bull" : "text-bear"}>
                                    {itemPnlPositive ? "+" : ""}₹{formatNum(item.pnl)}
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold ${
                                      itemPnlPositive ? "text-bull" : "text-bear"
                                    }`}
                                  >
                                    {itemPnlPositive ? "+" : ""}
                                    {item.pnlPercent.toFixed(2)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-text-3 font-mono font-normal">Pending CMP</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1.5 rounded-lg text-text-2 hover:text-bull hover:bg-bull/10 border border-transparent hover:border-bull/20 transition-all cursor-pointer inline-flex items-center justify-center"
                                  title="Edit Trade Details"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="p-1.5 rounded-lg text-text-2 hover:text-bear hover:bg-bear/10 border border-transparent hover:border-bear/20 transition-all cursor-pointer inline-flex items-center justify-center"
                                  title="Delete Trade Record"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-2xl transition-all duration-300">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-text-2 hover:bg-bg-2 hover:text-text-0 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <h3 className="font-serif text-2xl text-text-0 font-bold">Add Transaction</h3>
              <p className="text-xs text-text-2 mt-1">
                Record a buy transaction to start tracking holding performance.
              </p>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 px-4 py-3 text-xs font-medium text-bear border border-red-100 dark:border-red-900/30">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  required
                  placeholder="e.g. RELIANCE, TCS"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Buy Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="buyPrice"
                    required
                    placeholder="0.00"
                    value={formData.buyPrice}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="qty"
                    required
                    placeholder="0"
                    value={formData.qty}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full rounded-xl bg-bull py-2.5 text-sm font-semibold text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-pointer active:scale-95"
              >
                {modalLoading ? "Recording Trade..." : "Add to Portfolio"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-2xl transition-all duration-300">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-text-2 hover:bg-bg-2 hover:text-text-0 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <h3 className="font-serif text-2xl text-text-0 font-bold">Edit Transaction</h3>
              <p className="text-xs text-text-2 mt-1">
                Modify transaction fields for {formData.symbol}.
              </p>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 px-4 py-3 text-xs font-medium text-bear border border-red-100 dark:border-red-900/30">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  disabled
                  value={formData.symbol}
                  className="w-full rounded-xl border border-border-strong bg-bg-2 px-4 py-2.5 text-sm text-text-3 cursor-not-allowed uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Buy Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="buyPrice"
                    required
                    placeholder="0.00"
                    value={formData.buyPrice}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="qty"
                    required
                    placeholder="0"
                    value={formData.qty}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full rounded-xl bg-bull py-2.5 text-sm font-semibold text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-pointer active:scale-95"
              >
                {modalLoading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-border-custom bg-bg-2 transition-colors duration-300">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-4 px-6 py-8 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-text-0 transition-colors">MarketMind</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-3 transition-colors">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="font-mono text-[9px] text-text-3 flex items-center gap-1">
            <Info size={11} className="text-bull" /> Live prices read directly from stock database cache.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioPage;
