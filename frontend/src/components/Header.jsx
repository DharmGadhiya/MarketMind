import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { X, Sun, Moon, Search, Menu, Bell, Home, LineChart, TrendingUp, Star, Megaphone, Briefcase } from "lucide-react";
import { useUser } from "../services/UserContext";
import { useTheme } from "../services/ThemeContext";
import { loginUser, logoutUser, createAccount, verifyOTP, getNotifications, markNotificationsAsRead, deleteNotification, googleLogin, forgotPassword, resetPassword } from "../services/newsApi";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser();

  const menuGroups = [
    {
      title: "Main Terminal",
      items: [
        { name: "Home Terminal", path: "/", icon: Home },
        { name: "IPO Center", path: "/ipo", icon: LineChart },
        { name: "NIFTY 50", path: "/nifty50", icon: TrendingUp },
      ]
    },
    {
      title: "Workspace",
      items: [
        { name: "My Watchlist", path: "/watchlist", icon: Star },
        { name: "Portfolio Tracker", path: "/portfolio", icon: Briefcase },
        { name: "Price Alerts", path: "/price-alerts", icon: Bell },
        { name: "Announcements", path: "/corporate-announcements", icon: Megaphone },
      ]
    }
  ];
  const { theme, toggleTheme } = useTheme();
  
  useEffect(() => {
    const handleOpenLoginModal = () => {
      openModal("login");
    };
    window.addEventListener("open-login-modal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, []);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await getNotifications();
      if (res && res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (user) {
      const interval = setInterval(fetchNotifications, 30000); // poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Sync state if watchlist/alert triggers update
  useEffect(() => {
    const handleWatchlistUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener("watchlist-updated", handleWatchlistUpdate);
    return () => {
      window.removeEventListener("watchlist-updated", handleWatchlistUpdate);
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    const closeDropdown = () => setShowNotifications(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [showNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const SEARCHABLE_STOCKS = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd" },
    { symbol: "INFY", name: "Infosys Ltd" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd" },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "LT", name: "Larsen & Toubro Ltd" },
    { symbol: "ITC", name: "ITC Ltd" },
    { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd" },
    { symbol: "AXISBANK", name: "Axis Bank Ltd" },
    { symbol: "ADANIENT", name: "Adani Enterprises Ltd" },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd" },
    { symbol: "M&M", name: "Mahindra & Mahindra Ltd" },
    { symbol: "WIPRO", name: "Wipro Ltd" },
    { symbol: "HCLTECH", name: "HCL Technologies Ltd" },
    { symbol: "NTPC", name: "NTPC Ltd" },
    { symbol: "ONGC", name: "Oil & Natural Gas Corporation Ltd" },
    { symbol: "POWERGRID", name: "Power Grid Corp of India Ltd" },
    { symbol: "ASIANPAINT", name: "Asian Paints Ltd" },
    { symbol: "MARUTI", name: "Maruti Suzuki India Ltd" },
    { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd" },
    { symbol: "TATASTEEL", name: "Tata Steel Ltd" },
    { symbol: "TITAN", name: "Titan Company Ltd" },
    { symbol: "ULTRACEMCO", name: "UltraTech Cement Ltd" },
    { symbol: "COALINDIA", name: "Coal India Ltd" },
    { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd" },
    { symbol: "BAJAJFINSV", name: "Bajaj Finserv Ltd" },
    { symbol: "BPCL", name: "Bharat Petroleum Corporation Ltd" },
    { symbol: "ADANIPORTS", name: "Adani Ports & SEZ Ltd" },
    { symbol: "BEL", name: "Bharat Electronics Ltd" },
    { symbol: "BRITANNIA", name: "Britannia Industries Ltd" },
    { symbol: "CIPLA", name: "Cipla Ltd" },
    { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd" },
    { symbol: "EICHERMOT", name: "Eicher Motors Ltd" },
    { symbol: "GRASIM", name: "Grasim Industries Ltd" },
    { symbol: "HDFCLIFE", name: "HDFC Life Insurance Co Ltd" },
    { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd" },
    { symbol: "HINDALCO", name: "Hindalco Industries Ltd" },
    { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd" },
    { symbol: "JSWSTEEL", name: "JSW Steel Ltd" },
    { symbol: "NESTLEIND", name: "Nestle India Ltd" },
    { symbol: "SBILIFE", name: "SBI Life Insurance Co Ltd" },
    { symbol: "TATACONSUM", name: "Tata Consumer Products Ltd" },
    { symbol: "TECHM", name: "Tech Mahindra Ltd" },
    { symbol: "TRENT", name: "Trent Ltd" }
  ];

  const filteredResults = searchQuery.trim() === "" ? [] : SEARCHABLE_STOCKS.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const handleSearchSelect = (symbol) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/stock/${encodeURIComponent(symbol)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredResults.length > 0) {
      handleSearchSelect(filteredResults[0].symbol);
    }
  };
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup" | "otp"
  const [formData, setFormData] = useState({ name: "", email: "", password: "", otp: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLoginSuccess = async (response) => {
    try {
      setLoading(true);
      setError(null);
      const data = await googleLogin(response.credential);
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        closeModal();
      } else {
        setError(data.msg || "Google Sign-In failed");
      }
    } catch (err) {
      console.error("Google Login callback error:", err);
      setError(err.response?.data?.msg || "Failed to log in with Google");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    if (isModalOpen && (mode === "login" || mode === "signup") && window.google) {
      try {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com",
          callback: handleGoogleLoginSuccess,
        });
        
        setTimeout(() => {
          const container = document.getElementById("google-signin-button");
          if (container) {
            google.accounts.id.renderButton(container, {
              theme: theme === "dark" ? "filled_blue" : "outline",
              size: "large",
              width: container.offsetWidth || 280,
              text: "continue_with",
              shape: "pill",
            });
          }
        }, 100);
      } catch (err) {
        console.error("Google Sign-In initialization failed:", err);
      }
    }
  }, [isModalOpen, mode, theme]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (initialMode = "login") => {
    setMode(initialMode);
    setFormData({ name: "", email: "", password: "", otp: "", confirmPassword: "" });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await loginUser(formData.email, formData.password);
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        closeModal();
      } else {
        setError(data.msg || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await createAccount(formData.name, formData.email, formData.password);
      if (data) {
        setSuccess("OTP sent to your email. Please verify.");
        setMode("otp");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to register account");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await verifyOTP(formData.name, formData.email, formData.password, formData.otp);
      if (data) {
        setSuccess("Account created successfully. Please login.");
        setMode("login");
        setFormData({ ...formData, password: "", otp: "" });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await forgotPassword(formData.email);
      if (data) {
        setSuccess("Recovery OTP code sent to your email.");
        setMode("reset");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Account does not exist");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await resetPassword(formData.email, formData.otp, formData.password);
      if (data) {
        setSuccess("Password successfully updated. Please login with your new password.");
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "", otp: "" }));
        setMode("login");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Password reset failed. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem("user");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-border-custom transition-all duration-300">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10">

          {/* LEFT SIDE LOGO & SIDEBAR MENU */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg p-2 hover:bg-bg-2 text-text-2 hover:text-text-0 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-border-custom"
                title="Open Navigation Menu"
              >
                <Menu size={20} />
              </button>
            )}

            {/* LOGO */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-md border border-border-strong bg-gradient-to-br from-[#0a8c5b] to-[#064a30]">
                <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-white">
                  M
                </div>
                <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-bull pulse-dot" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-xl text-text-0 transition-colors">
                  MarketMind
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-2 transition-colors">
                  news terminal
                </span>
              </div>
            </Link>
          </div>

          {/* SEARCH BAR */}
          <div className="relative hidden sm:block w-44 md:w-60 lg:w-72">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-text-3" size={13} />
              <input
                type="text"
                placeholder="Search stocks (e.g. RELIANCE, TCS)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-border-custom bg-bg-0 pl-9 pr-8 py-2 text-[11px] font-sans outline-none transition-all focus:border-bull focus:bg-bg-1 text-text-0 placeholder-text-3"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-text-3 hover:text-text-0 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* RESULTS DROPDOWN */}
            {showResults && filteredResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-border-strong bg-bg-1 p-1.5 shadow-lg max-h-56 overflow-y-auto">
                {filteredResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    onMouseDown={() => handleSearchSelect(stock.symbol)}
                    className="flex flex-col px-3 py-1.5 rounded-lg hover:bg-bg-0 cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-[11px] font-bold text-text-0">
                      {stock.symbol}
                    </span>
                    <span className="text-[9px] text-text-2 font-sans mt-0.5">
                      {stock.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LIVE MARKET COVERAGE DATE */}
          <div className="hidden md:flex flex-col items-center text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-3 transition-colors">
              Live Market Coverage
            </span>
            <span className="font-serif italic text-[15px] text-text-1 transition-colors">
              {today}
            </span>
          </div>

          {/* AUTH ACTIONS */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong bg-bg-1 text-text-1 hover:bg-border-custom/50 hover:text-text-0 transition-colors shadow-sm cursor-news"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* NOTIFICATION CENTRE BELL */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong bg-bg-1 text-text-1 hover:bg-border-custom/50 hover:text-text-0 transition-colors shadow-sm cursor-news animate-fade-in"
                    aria-label="Notifications"
                  >
                    <Bell size={14} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-bull px-1 text-[9px] font-bold text-white font-mono pulse-dot">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATION DROPDOWN */}
                  {showNotifications && (
                    <div
                      className="absolute right-0 mt-2 w-80 z-50 rounded-2xl border border-border-strong bg-bg-1 p-3 shadow-xl transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between border-b border-border-custom pb-2 mb-2">
                        <span className="font-serif text-sm font-bold text-text-0">Alert Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-bull hover:underline cursor-pointer font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto pr-1 flex flex-col gap-1.5">
                        {notifications.length > 0 ? (
                          notifications.map((item) => (
                            <div
                              key={item._id}
                              className={`flex items-start justify-between gap-2 p-2 rounded-xl border transition-colors ${
                                item.read
                                  ? "bg-bg-1 border-transparent text-text-2"
                                  : "bg-bull/5 border-bull/10 text-text-0"
                              }`}
                            >
                              <div className="flex flex-col gap-1 min-w-0">
                                <p className="text-[11px] leading-relaxed break-words font-medium">
                                  {item.message}
                                </p>
                                <span className="text-[9px] font-mono text-text-3 font-semibold">
                                  {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(item._id, e)}
                                className="text-text-3 hover:text-bear p-1 rounded transition-colors cursor-pointer shrink-0"
                                title="Dismiss notification"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-text-3 text-xs font-serif">
                            No recent price alerts.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex flex-col items-end leading-none animate-fade-in">
                  <span className="font-sans text-xs font-semibold text-text-0 transition-colors">
                    {user.userName || "Investor"}
                  </span>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="rounded-lg border border-border-strong bg-bg-1 hover:bg-border-custom/50 px-3.5 py-1.5 text-xs font-medium text-bear transition-colors shadow-sm cursor-news animate-fade-in"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal("login")}
                  className="rounded-lg border border-border-strong bg-bg-1 hover:bg-border-custom/50 px-3.5 py-1.5 text-xs font-medium text-text-1 transition-colors shadow-sm cursor-news"
                >
                  Login
                </button>
                <button
                  onClick={() => openModal("signup")}
                  className="rounded-lg bg-bull hover:bg-bull/90 px-3.5 py-1.5 text-xs font-medium text-white transition-colors shadow-sm cursor-news"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* AUTHENTICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border-strong bg-bg-1 p-6 shadow-2xl transition-all duration-300">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1 text-text-2 hover:bg-bg-2 hover:text-text-0 transition-colors cursor-news"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-6">
              <h3 className="font-serif text-2xl text-text-0 font-bold">
                {mode === "login" && "Welcome Back"}
                {mode === "signup" && "Create Account"}
                {mode === "otp" && "Verify OTP"}
              </h3>
              <p className="text-xs text-text-2 mt-1">
                {mode === "login" && "Access your premium market intelligence terminal."}
                {mode === "signup" && "Register to unlock professional news coverage."}
                {mode === "otp" && `Enter the code sent to ${formData.email}`}
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 px-4 py-3 text-xs font-medium text-bear border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-xs font-medium text-bull border border-emerald-100 dark:border-emerald-900/30">
                {success}
              </div>
            )}

            {/* FORMS */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span />
                    <span
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs text-bull font-semibold hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-bull py-2.5 text-sm font-medium text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-news"
                >
                  {loading ? "Logging in..." : "Login to Terminal"}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border-custom"></div>
                  <span className="flex-shrink mx-3 text-[9px] uppercase font-mono text-text-3">Or continue with</span>
                  <div className="flex-grow border-t border-border-custom"></div>
                </div>

                <div className="flex justify-center w-full my-1.5">
                  <div id="google-signin-button"></div>
                </div>
                <p className="text-center text-xs text-text-2 mt-2">
                  Don't have an account?{" "}
                  <span
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-bull font-semibold hover:underline cursor-pointer"
                  >
                    Sign Up
                  </span>
                </p>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Alexander Hamilton"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="alex@hamilton.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-bull py-2.5 text-sm font-medium text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-news"
                >
                  {loading ? "Sending OTP..." : "Get OTP Code"}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border-custom"></div>
                  <span className="flex-shrink mx-3 text-[9px] uppercase font-mono text-text-3">Or continue with</span>
                  <div className="flex-grow border-t border-border-custom"></div>
                </div>

                <div className="flex justify-center w-full my-1.5">
                  <div id="google-signin-button"></div>
                </div>
                <p className="text-center text-xs text-text-2 mt-2">
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-bull font-semibold hover:underline cursor-pointer"
                  >
                    Login
                  </span>
                </p>
              </form>
            )}

            {mode === "otp" && (
              <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Verification OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    required
                    placeholder="12345"
                    maxLength={5}
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full tracking-[0.5em] text-center rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-lg font-bold text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-bull py-2.5 text-sm font-medium text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-news"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
                <p className="text-center text-xs text-text-2 mt-2">
                  Didn't receive it?{" "}
                  <span
                    onClick={handleSignUpSubmit}
                    className="text-bull font-semibold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </span>
                </p>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-bull py-2.5 text-sm font-medium text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-news"
                >
                  {loading ? "Checking..." : "Request Recovery Code"}
                </button>
                <p className="text-center text-xs text-text-2 mt-2">
                  Remember password?{" "}
                  <span
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-bull font-semibold hover:underline cursor-pointer"
                  >
                    Back to Login
                  </span>
                </p>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Recovery OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    required
                    placeholder="12345"
                    maxLength={5}
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="w-full tracking-[0.2em] text-center rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-md font-bold text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-border-strong bg-bg-0 px-4 py-2.5 text-sm text-text-0 placeholder-text-3 focus:border-bull focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-bull py-2.5 text-sm font-medium text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-news"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION DRAWER */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-bg-1 border-r border-border-strong p-6 shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* DRAWER HEADER */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-custom bg-gradient-to-r from-bull/5 to-transparent -mx-6 px-6 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-bull animate-pulse" />
            <span className="font-serif text-sm font-bold text-text-0 tracking-tight">MarketMind Navigator</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 hover:bg-bg-2 text-text-2 hover:text-text-0 transition-all cursor-pointer border border-transparent hover:border-border-custom"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex flex-col gap-5">
          {menuGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-3 px-1 font-bold">
                {group.title}
              </span>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-r-xl border-l-4 transition-all font-semibold text-xs shadow-sm ${
                        isActive
                          ? "border-l-bull bg-bull/10 text-bull"
                          : "border-l-transparent hover:border-l-bull hover:bg-bull/5 text-text-1 hover:text-bull"
                      }`}
                    >
                      <div className={`p-1 rounded-lg border transition-colors ${
                        isActive 
                          ? "bg-bull/20 border-bull/30 text-bull" 
                          : "bg-bg-2 border-border-custom text-text-2 group-hover:bg-bull/10 group-hover:text-bull group-hover:border-bull/20"
                      }`}>
                        <Icon size={13} />
                      </div>
                      <span>{item.name}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-bull animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* MARKET HEALTH snapshot CARD */}
        <div className="mt-6 bg-bg-2/50 border border-border-custom p-3 rounded-xl shadow-inner select-none">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] uppercase tracking-wider text-text-3 font-bold">Market Heartbeat</span>
            <div className="flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-bull"></span>
              </span>
              <span className="text-[8px] font-mono font-bold text-bull">LIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-custom/50 text-[10px] font-mono leading-none">
            <div className="space-y-1">
              <span className="text-text-3 text-[8.5px]">NIFTY 50</span>
              <div className="font-bold text-text-0">24,320.15</div>
              <div className="text-bull font-semibold text-[8px]">+0.85%</div>
            </div>
            <div className="space-y-1 border-l border-border-custom/50 pl-3">
              <span className="text-text-3 text-[8.5px]">SENSEX</span>
              <div className="font-bold text-text-0">79,802.40</div>
              <div className="text-bull font-semibold text-[8px]">+0.78%</div>
            </div>
          </div>
        </div>

        {/* USER PROFILE CARD */}
        {user && (
          <div className="absolute bottom-6 left-6 right-6 pt-4 border-t border-border-custom">
            <div className="flex items-center gap-3 mb-4 p-3 bg-bg-2/60 border border-border-custom rounded-xl shadow-inner">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bull/10 text-bull border border-bull/20 font-bold font-mono">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-text-0 truncate">{user.name}</span>
                <span className="text-[11px] text-text-3 truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                handleLogoutClick();
              }}
              className="w-full text-center text-xs font-bold text-bear hover:bg-bear/5 border border-bear/10 hover:border-bear/30 rounded-xl py-2.5 transition-all cursor-pointer active:scale-95"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
