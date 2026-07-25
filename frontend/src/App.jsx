import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import AIAnalysisPage from "./pages/AIAnalysisPage";
import IPOPage from "./pages/IPOPage";
import StockDetails from "./pages/StockDetails";
import Nifty50 from "./pages/Nifty50";
import WatchlistPage from "./pages/WatchlistPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";

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
          element={<StockDetails />}
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
          element={<IPOPage />}
        />

        <Route
          path="/nifty50"
          element={<Nifty50 />}
        />

        <Route
          path="/watchlist"
          element={<WatchlistPage type="watchlist" />}
        />
        <Route
          path="/price-alerts"
          element={<WatchlistPage type="alerts" />}
        />
        <Route
          path="/corporate-announcements"
          element={<AnnouncementsPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;