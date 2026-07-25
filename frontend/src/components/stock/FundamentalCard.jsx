import { formatMarketCap, formatMetric, formatPercent } from "../../Utilities/utils/stockFormat";

const FundamentalCard = ({ stock }) => {
  if (!stock) return null;

  // Safe percentage helper for values that might be decimals (e.g. 0.12 -> 12%) or raw percents (e.g. 12 -> 12%)
  const formatRatioPercent = (val) => {
    if (val === undefined || val === null || val === "N/A") return "N/A";
    const num = Number(val);
    if (isNaN(num)) return "N/A";
    
    // If the value is a small decimal (between -1 and 1), it's likely a decimal ratio (e.g., 0.08 = 8%)
    // Exclude absolute 0.0
    if (Math.abs(num) > 0 && Math.abs(num) < 1) {
      return `${(num * 100).toFixed(2)}%`;
    }
    return `${num.toFixed(2)}%`;
  };

  const fundamentals = [
    { label: "Market Cap", value: formatMarketCap(stock.marketCap) },
    { label: "P/E Ratio", value: formatMetric(stock.pe) },
    { label: "Forward P/E", value: formatMetric(stock.forwardPE) },
    { label: "P/B Ratio", value: formatMetric(stock.pb) },
    { label: "PEG Ratio", value: formatMetric(stock.peg) },
    { label: "EPS (TTM)", value: stock.eps !== "N/A" ? `₹${formatMetric(stock.eps)}` : "N/A" },
    { label: "Forward EPS", value: stock.forwardEPS !== "N/A" ? `₹${formatMetric(stock.forwardEPS)}` : "N/A" },
    { label: "ROE", value: formatRatioPercent(stock.roe) },
    { label: "ROA", value: formatRatioPercent(stock.roa) },
    { label: "Dividend Yield", value: formatRatioPercent(stock.dividendYield) },
    { label: "Book Value", value: stock.bookValue !== "N/A" ? `₹${formatMetric(stock.bookValue)}` : "N/A" },
  ];

  return (
    <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4 transition-colors duration-300">
      <h3 className="font-serif text-base font-bold text-text-0">
        Fundamentals
      </h3>
      
      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {fundamentals.map((item, idx) => (
          <div 
            key={idx} 
            className="flex flex-col border-b border-border-custom/30 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-[10px] text-text-2 font-sans font-medium transition-colors">
              {item.label}
            </span>
            <span className="font-mono text-xs font-bold text-text-0 transition-colors mt-0.5">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FundamentalCard;
