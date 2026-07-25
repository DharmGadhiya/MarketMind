import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useUser } from "./services/UserContext";
import Header from "./components/Header";
import TickerTape from "./components/TickerTape";
import LockedFeatureCard from "./components/LockedFeatureCard";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import AIAnalysisPage from "./pages/AIAnalysisPage";
import IPOPage from "./pages/IPOPage";
import StockDetails from "./pages/StockDetails";
import Nifty50 from "./pages/Nifty50";
import WatchlistPage from "./pages/WatchlistPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import PortfolioPage from "./pages/PortfolioPage";
import IndicesPage from "./pages/IndicesPage";

function ProtectedRoute({ children }) {
  const { user } = useUser();
  const location = useLocation();

  if (!user) {
    let title = "Intelligence Terminal Locked";
    let description = "Access deep financial analysis, sector impact models, and stock valuations.";

    const path = location.pathname;
    if (path.startsWith("/ipo")) {
      title = "IPO Center Locked";
      description = "Explore upcoming, open, and closed IPO listings, view details, and track performance.";
    } else if (path.startsWith("/nifty50")) {
      title = "NIFTY 50 Terminal Locked";
      description = "Track NIFTY 50 live quotes, weightage distribution, and key index market statistics.";
    } else if (path.startsWith("/indices")) {
      title = "Indices Terminal Locked";
      description = "Monitor major Indian stock market indices and track their performance with real-time charts.";
    } else if (path.startsWith("/stock")) {
      title = "Stock Intelligence Locked";
      description = "Analyze deep fundamentals, financial stats, interactive charts, and live quote indicators.";
    } else if (path.startsWith("/watchlist")) {
      title = "Watchlist Terminal Locked";
      description = "Track your favorite companies, manage personalized lists, and monitor live performance.";
    } else if (path.startsWith("/price-alerts")) {
      title = "Price Alerts Locked";
      description = "Manage your active price threshold triggers and receive instant alerts.";
    } else if (path.startsWith("/portfolio")) {
      title = "Portfolio Tracker Locked";
      description = "Log your transactions, compute total investments, and analyze real-time returns.";
    } else if (path.startsWith("/corporate-announcements")) {
      title = "Corporate Announcements Locked";
      description = "Receive live board meetings, dividend declarations, and official corporate filings.";
    }

    return (
      <div className="min-h-screen bg-bg-0 text-text-0 transition-colors duration-300 flex flex-col justify-between">
        <div>
          <Header />
          <TickerTape />
          <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-12 flex items-center justify-center min-h-[60vh]">
            <LockedFeatureCard title={title} description={description} />
          </main>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/stock/:symbol"
          element={
            <ProtectedRoute>
              <StockDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/news/:id"
          element={<NewsDetail />}
        />

        <Route
          path="/news/:id/ai-analysis"
          element={<AIAnalysisPage />}
        />

        <Route
          path="/ipo"
          element={
            <ProtectedRoute>
              <IPOPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nifty50"
          element={
            <ProtectedRoute>
              <Nifty50 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage type="watchlist" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-alerts"
          element={
            <ProtectedRoute>
              <WatchlistPage type="alerts" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corporate-announcements"
          element={
            <ProtectedRoute>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/indices"
          element={
            <ProtectedRoute>
              <IndicesPage />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;