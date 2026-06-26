import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Sun, Moon } from "lucide-react";
import { useUser } from "../services/UserContext";
import { useTheme } from "../services/ThemeContext";
import { loginUser, logoutUser, createAccount, verifyOTP } from "../services/newsApi";

const Header = () => {
  const { user, setUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup" | "otp"
  const [formData, setFormData] = useState({ name: "", email: "", password: "", otp: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setFormData({ name: "", email: "", password: "", otp: "" });
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
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="font-sans text-xs font-semibold text-text-0 transition-colors">
                    {user.userName || "Investor"}
                  </span>
                  <span className="font-mono text-[9px] text-text-2 transition-colors mt-0.5">
                    {user.email}
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
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-bull py-2.5 text-sm font-medium text-white hover:bg-bull/90 transition-colors disabled:opacity-75 flex items-center justify-center mt-2 cursor-news"
                >
                  {loading ? "Logging in..." : "Login to Terminal"}
                </button>
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
          </div>
        </div>
      )}
    </>
  );
};

export default Header;