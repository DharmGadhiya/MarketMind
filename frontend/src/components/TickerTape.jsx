import { useEffect, useState } from "react";
import { getStocks } from "../services/newsApi";
import { formatNum } from "../Utilities/utils/format";

const TickerTape = () => {
  const [stocks, setStocks] = useState([]);

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

    fetchStocksData();
    // Poll every 45 seconds for fresh prices
    const interval = setInterval(fetchStocksData, 45000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate items to ensure smooth infinite marquee looping
  const displayStocks = [...stocks, ...stocks];

  return (
    <div className="relative w-full overflow-hidden border-y border-black/8 bg-[#f3efe7]">
      <div className="marquee-track py-3 font-mono text-[12px] flex items-center">
        {displayStocks.length > 0 ? (
          displayStocks.map((stock, i) => {
            const cleanSymbol = stock.symbol.replace(".NS", "");
            const isPositive = stock.changePercent >= 0;
            return (
              <span
                key={`${stock.symbol}-${i}`}
                className="mx-6 inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span className="font-semibold text-[#0a0e14]">
                  {cleanSymbol}
                </span>
                <span className="text-[#2a2f38]">
                  ₹{formatNum(stock.cmp)}
                </span>
                <span
                  className={`font-semibold ${
                    isPositive ? "text-[#0a8c5b]" : "text-[#e11d48]"
                  }`}
                >
                  {isPositive ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
                <span className="text-[#9ca3af] ml-2">
                  •
                </span>
              </span>
            );
          })
        ) : (
          Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span className="tracking-wider text-[#6b7280]">
                Loading Market Ticker...
              </span>
              <span className="text-[#0a8c5b]">
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