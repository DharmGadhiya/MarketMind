import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStocks } from "../services/newsApi";
import { formatNum } from "../Utilities/utils/format";

const TickerTape = ({ initialStocks }) => {
  const [stocks, setStocks] = useState(initialStocks || []);

  useEffect(() => {
    if (initialStocks && initialStocks.length > 0) {
      setStocks(initialStocks);
    }
  }, [initialStocks]);

  useEffect(() => {
    const fetchStocksData = async () => {
      try {
        const res = await getStocks();
        if (res && res.success && res.data) {
          setStocks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch stocks for ticker tape:", err);
      }
    };

    if (!initialStocks || initialStocks.length === 0) {
      fetchStocksData();
    }
    // Poll every 45 seconds for fresh prices
    const interval = setInterval(fetchStocksData, 45000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items to ensure smooth infinite marquee looping
  const displayStocks = [...stocks, ...stocks];

  return (
    <div className="relative w-full overflow-hidden border-y border-border-custom bg-bg-2 transition-colors duration-300">
      <div className="marquee-track py-3 font-mono text-[12px] flex items-center">
        {displayStocks.length > 0 ? (
          displayStocks.map((stock, i) => {
            const cleanSymbol = stock.symbol.replace(".NS", "");
            const isPositive = stock.changePercent >= 0;
            return (
              <Link
                key={`${stock.symbol}-${i}`}
                to={`/stock/${encodeURIComponent(cleanSymbol)}`}
                className="mx-6 inline-flex items-center gap-2 whitespace-nowrap cursor-pointer hover:text-bull transition-all hover:scale-[1.02] duration-300"
              >
                <span className="font-semibold text-text-0 transition-colors">
                  {cleanSymbol}
                </span>
                <span className="text-text-1 transition-colors">
                  ₹{formatNum(stock.cmp)}
                </span>
                <span
                  className={`font-semibold transition-colors ${
                    isPositive ? "text-bull" : "text-bear"
                  }`}
                >
                  {isPositive ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
                <span className="text-text-3 transition-colors ml-2">
                  •
                </span>
              </Link>
            );
          })
        ) : (
          Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span className="tracking-wider text-text-2 transition-colors">
                Loading Market Ticker...
              </span>
              <span className="text-bull transition-colors">
                •
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default TickerTape;