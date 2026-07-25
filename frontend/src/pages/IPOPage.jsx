import { useEffect, useState } from "react";
import { Loader2, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import axios from "axios";

const IPOPage = () => {
  const [activeTab, setActiveTab] = useState("current"); // "current" | "upcoming" | "past"
  const [ipoData, setIpoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND || "http://localhost:8000";

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${backendUrl}/api/ipo/${activeTab}`, {
          withCredentials: true,
        });
        if (response.data && response.data.success) {
          setIpoData(response.data.data);
        } else {
          setError("Failed to fetch IPO listings");
        }
      } catch (err) {
        console.error("Error fetching IPO details:", err);
        setError("Unable to connect to the database. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchIpoData();
  }, [activeTab, backendUrl]);

  // Format Helper for large currency/numbers
  const formatNumber = (value) => {
    if (!value || isNaN(value)) return "-";
    return new Intl.NumberFormat("en-IN").format(value);
  };

  // Filter IPOs by search query
  const filteredData = ipoData.filter((item) => {
    const query = searchQuery.toLowerCase();
    const company = (item.companyName || item.company || "").toLowerCase();
    const sym = (item.symbol || "").toLowerCase();
    return company.includes(query) || sym.includes(query);
  });

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300">
      <Header />
      <TickerTape />

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-12">
        {/* TITLE SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-text-0 mb-2 transition-colors">
              Initial Public Offerings (IPOs)
            </h1>
            <p className="text-sm text-text-2 transition-colors max-w-xl">
              Track live, upcoming, and historical public issues on the National Stock Exchange (NSE) in real time.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" size={15} />
            <input
              type="text"
              placeholder="Search by Company or Symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border-custom bg-bg-1 pl-10 pr-4 py-2.5 text-xs outline-none transition-all focus:border-bull focus:bg-bg-0 text-text-0 placeholder-text-3 shadow-sm"
            />
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex border-b border-border-custom mb-6 transition-colors">
          <button
            onClick={() => {
              setActiveTab("current");
              setSearchQuery("");
            }}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "current"
                ? "border-bull text-bull"
                : "border-transparent text-text-2 hover:text-text-0"
            }`}
          >
            🔥 Current Issues
          </button>
          <button
            onClick={() => {
              setActiveTab("upcoming");
              setSearchQuery("");
            }}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "border-bull text-bull"
                : "border-transparent text-text-2 hover:text-text-0"
            }`}
          >
            📅 Upcoming Issues
          </button>
          <button
            onClick={() => {
              setActiveTab("past");
              setSearchQuery("");
            }}
            className={`px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "past"
                ? "border-bull text-bull"
                : "border-transparent text-text-2 hover:text-text-0"
            }`}
          >
            🏛️ Past Issues
          </button>
        </div>

        {/* DATA CONTAINER */}
        <div className="rounded-2xl border border-border-strong bg-bg-1 overflow-hidden shadow-lg transition-colors">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-bull" size={36} />
              <p className="font-mono text-xs text-text-2 tracking-wider">Accessing NSE IPO Database...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-bear text-sm font-semibold mb-2">⚠️ {error}</p>
              <p className="text-text-3 text-xs">Ensure your backend server is active and the Python scraper has run.</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center text-text-2 font-serif text-lg">
              No IPO issues found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-2 border-b border-border-strong text-[10px] font-mono uppercase tracking-wider text-text-2 transition-colors">
                    <th className="py-4 px-6">Company Name</th>
                    <th className="py-4 px-4">Symbol</th>
                    {activeTab === "current" && (
                      <>
                        <th className="py-4 px-4">Offer Period</th>
                        <th className="py-4 px-4 text-right">Price Range</th>
                        <th className="py-4 px-4 text-right">Issue Size (Shares)</th>
                        <th className="py-4 px-4 text-right">Shares Offered</th>
                        <th className="py-4 px-4 text-right">Subscription</th>
                      </>
                    )}
                    {activeTab === "upcoming" && (
                      <>
                        <th className="py-4 px-4">Issue Dates</th>
                        <th className="py-4 px-4 text-right">Price Range</th>
                        <th className="py-4 px-4 text-right">Issue Size (Shares)</th>
                        <th className="py-4 px-4">Status</th>
                      </>
                    )}
                    {activeTab === "past" && (
                      <>
                        <th className="py-4 px-4">IPO Period</th>
                        <th className="py-4 px-4 text-right">Issue Price</th>
                        <th className="py-4 px-4">Listing Date</th>
                        <th className="py-4 px-4">Price Range</th>
                        <th className="py-4 px-4">Security Type</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom font-sans text-xs sm:text-sm transition-colors">
                  {filteredData.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-bg-2/30 transition-colors"
                    >
                      {/* Company Name */}
                      <td className="py-4 px-6 font-semibold text-text-0 max-w-[280px] sm:max-w-xs truncate">
                        {item.companyName || item.company || "-"}
                      </td>

                      {/* Symbol */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-bold uppercase bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-text-1">
                          {item.symbol || "-"}
                        </span>
                      </td>

                      {/* Tab-Specific Columns */}
                      {activeTab === "current" && (
                        <>
                          {/* Offer Period */}
                          <td className="py-4 px-4 text-text-1">
                            {item.issueStartDate} to {item.issueEndDate}
                          </td>
                          {/* Price Range */}
                          <td className="py-4 px-4 text-right font-mono text-text-0">
                            {item.issuePrice || "-"}
                          </td>
                          {/* Issue Size */}
                          <td className="py-4 px-4 text-right font-mono text-text-1">
                            {formatNumber(item.issueSize)}
                          </td>
                          {/* Shares Offered */}
                          <td className="py-4 px-4 text-right font-mono text-text-1">
                            {formatNumber(item.noOfSharesOffered)}
                          </td>
                          {/* Subscription Status */}
                          <td className="py-4 px-4 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                Number(item.noOfTime) >= 1.0
                                  ? "bg-bull/10 text-bull border border-bull/20"
                                  : "bg-bear/10 text-bear border border-bear/20"
                              }`}
                            >
                              {Number(item.noOfTime) ? `${Number(item.noOfTime).toFixed(2)}x` : "-"}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === "upcoming" && (
                        <>
                          {/* Issue Dates */}
                          <td className="py-4 px-4 text-text-1">
                            {item.issueStartDate || "-"} to {item.issueEndDate || "-"}
                          </td>
                          {/* Price Range */}
                          <td className="py-4 px-4 text-right font-mono text-text-0">
                            {item.issuePrice || "-"}
                          </td>
                          {/* Issue Size */}
                          <td className="py-4 px-4 text-right font-mono text-text-1">
                            {formatNumber(item.issueSize)}
                          </td>
                          {/* Status */}
                          <td className="py-4 px-4">
                            <span className="text-xs uppercase px-2 py-0.5 rounded bg-amber/10 text-amber border border-amber/20 font-semibold font-mono">
                              {item.status || "Upcoming"}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === "past" && (
                        <>
                          {/* IPO Period */}
                          <td className="py-4 px-4 text-text-1">
                            {item.ipoStartDate || "-"} to {item.ipoEndDate || "-"}
                          </td>
                          {/* Issue Price */}
                          <td className="py-4 px-4 text-right font-mono text-text-0">
                            {item.issuePrice || "-"}
                          </td>
                          {/* Listing Date */}
                          <td className="py-4 px-4 text-text-1 font-mono">
                            {item.listingDate || "-"}
                          </td>
                          {/* Price Range */}
                          <td className="py-4 px-4 text-text-1">
                            {item.priceRange || "-"}
                          </td>
                          {/* Security Type */}
                          <td className="py-4 px-4">
                            <span className="text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-text-2">
                              {item.securityType || "-"}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default IPOPage;
