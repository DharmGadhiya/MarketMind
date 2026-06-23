// src/pages/Home.jsx

import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { getNews } from "../services/newsApi";
import NewsCard from "../components/NewsCard";

const Home = () => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔹 Initial load
  useEffect(() => {
    const loadInitialNews = async () => {
      try {
        const data = await getNews(1);

        setNews(data.news || []);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (err) {
        console.error("Error fetching initial news:", err);
      }
    };

    loadInitialNews();
  }, []);

  // 🔹 Load more news (pagination)
  const fetchMoreNews = async () => {
    try {
      const nextPage = page + 1;

      const data = await getNews(nextPage);

      setNews((prev) => [...prev, ...(data.news || [])]);
      setPage((prev) => prev + 1);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error fetching more news:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8">
          MarketMind News
        </h1>

        <InfiniteScroll
          dataLength={news.length}
          next={fetchMoreNews}
          hasMore={hasMore}
          loader={
            <h3 className="text-center py-6">Loading more news...</h3>
          }
          endMessage={
            <p className="text-center py-6 text-gray-500">
              No more news available
            </p>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item._id} news={item} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Home;