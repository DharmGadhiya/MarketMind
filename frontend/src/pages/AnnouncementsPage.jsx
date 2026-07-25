import { useEffect, useState } from "react";
import { Loader2, Search, Calendar, FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Header from "../components/Header";
import TickerTape from "../components/TickerTape";
import axios from "axios";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND || "http://localhost:8000";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${backendUrl}/api/corporate-announcements`, {
          withCredentials: true,
        });
        if (response.data && response.data.success) {
          setAnnouncements(response.data.data);
        } else {
          setError("Failed to fetch corporate announcements");
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Unable to connect to the database. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [backendUrl]);

  const toggleExpand = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  // Filter announcements by search query
  const filteredAnnouncements = announcements.filter((item) => {
    const query = searchQuery.toLowerCase();
    const company = (item.sm_name || "").toLowerCase();
    const sym = (item.symbol || "").toLowerCase();
    const desc = (item.desc || "").toLowerCase();
    const text = (item.attchmntText || "").toLowerCase();
    return company.includes(query) || sym.includes(query) || desc.includes(query) || text.includes(query);
  });

  return (
    <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300">
      <Header />
      <TickerTape />

      <main className="mx-auto max-w-[1200px] px-6 py-8 lg:px-10 lg:py-12">
        {/* TITLE SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-text-0 mb-2 transition-colors">
              Corporate Announcements
            </h1>
            <p className="text-sm text-text-2 transition-colors max-w-xl">
              Monitor active regulatory disclosures, AGMs, financial filings, and corporate actions directly from the NSE.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" size={15} />
            <input
              type="text"
              placeholder="Search symbol, company, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border-custom bg-bg-1 pl-10 pr-4 py-2.5 text-xs outline-none transition-all focus:border-bull focus:bg-bg-0 text-text-0 placeholder-text-3 shadow-sm"
            />
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-border-strong bg-bg-1 shadow-lg">
              <Loader2 className="animate-spin text-bull" size={36} />
              <p className="font-mono text-xs text-text-2 tracking-wider">Accessing NSE Filings...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center rounded-2xl border border-border-strong bg-bg-1 shadow-lg">
              <p className="text-bear text-sm font-semibold mb-2">⚠️ {error}</p>
              <p className="text-text-3 text-xs">Ensure your backend server is active and the Announcements scraper has run.</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-20 text-center text-text-2 font-serif text-lg rounded-2xl border border-border-strong bg-bg-1 shadow-lg">
              No corporate announcements match your query.
            </div>
          ) : (
            filteredAnnouncements.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border-custom bg-bg-1 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* CARD HEADER */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 cursor-pointer select-none hover:bg-bg-2/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-xs font-bold uppercase bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded text-text-1 border border-border-custom">
                          {item.symbol}
                        </span>
                        {item.desc && (
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-bull/5 text-bull border border-bull/10 font-mono">
                            {item.desc}
                          </span>
                        )}
                        {item.attFileSize && (
                          <span className="text-[10px] font-mono text-text-3">
                            PDF ({item.attFileSize})
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg text-text-0 font-semibold mb-1 transition-colors leading-tight">
                        {item.sm_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-2">
                        <Calendar size={13} />
                        <span>Broadcast: {item.an_dt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {item.attchmntFile && (
                        <a
                          href={item.attchmntFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center p-2 rounded-lg bg-bg-0 hover:bg-bg-2 border border-border-custom text-text-2 hover:text-bull transition-all cursor-pointer"
                          title="Open Official PDF Announcement"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button className="flex items-center justify-center p-2 rounded-lg bg-bg-0 border border-border-custom text-text-2 transition-all">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE BODY DETAILS */}
                  {isExpanded && (
                    <div className="border-t border-border-custom bg-bg-2/30 px-6 py-5 transition-colors">
                      <div className="flex items-start gap-3">
                        <FileText className="text-bull shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                          <h4 className="text-xs uppercase font-mono tracking-wider text-text-3 mb-1.5">
                            Filing details & Announcement Text
                          </h4>
                          <p className="text-sm text-text-1 leading-relaxed whitespace-pre-line font-sans">
                            {item.attchmntText || "No additional filing text available."}
                          </p>

                          {item.attchmntFile && (
                            <div className="mt-4 pt-4 border-t border-border-custom flex items-center justify-between">
                              <span className="text-xs font-mono text-text-3">
                                Ref ID: {item.seq_id || "N/A"}
                              </span>
                              <a
                                href={item.attchmntFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-bull hover:bg-bull/95 text-white px-4 py-2 transition-all text-xs font-bold shadow-sm"
                              >
                                <ExternalLink size={12} />
                                View Full Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default AnnouncementsPage;
