import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import NewsDetail from "./pages/NewsDetail";
import AIAnalysisPage from "./pages/AIAnalysisPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/news/:id"
          element={<NewsDetail />}
        />

        <Route
          path="/news/:id/ai-analysis"
          element={<AIAnalysisPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;