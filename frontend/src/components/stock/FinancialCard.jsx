import { formatMarketCap, formatMetric, formatPercent } from "../../Utilities/utils/stockFormat";

const FinancialCard = ({ stock }) => {
  if (!stock) return null;

  // Safe percentage helper
  const formatRatioPercent = (val) => {
    if (val === undefined || val === null || val === "N/A") return "N/A";
    const num = Number(val);
    if (isNaN(num)) return "N/A";
    if (Math.abs(num) > 0 && Math.abs(num) < 1) {
      return `${(num * 100).toFixed(2)}%`;
    }
    return `${num.toFixed(2)}%`;
  };

  const cards = [
    {
      label: "Total Revenue",
      value: formatMarketCap(stock.revenue),
      icon: "📈",
      description: "Top-line earnings generated from operations"
    },
    {
      label: "Net Income",
      value: formatMarketCap(stock.netIncome),
      icon: "💼",
      description: "Bottom-line net profit after all expenses"
    },
    {
      label: "Book Value",
      value: stock.bookValue !== "N/A" ? `₹${formatMetric(stock.bookValue)}` : "N/A",
      icon: "📖",
      description: "Net asset value per share of the company"
    },
    {
      label: "Market Cap",
      value: formatMarketCap(stock.marketCap),
      icon: "🏢",
      description: "Total valuation of outstanding shares"
    },
    {
      label: "EPS (TTM)",
      value: stock.eps !== "N/A" ? `₹${formatMetric(stock.eps)}` : "N/A",
      icon: "🪙",
      description: "Earnings portion allocated to each share"
    },
    {
      label: "Return on Equity (ROE)",
      value: formatRatioPercent(stock.roe),
      icon: "🎯",
      description: "Profit generated relative to shareholder equity"
    },
    {
      label: "Return on Assets (ROA)",
      value: formatRatioPercent(stock.roa),
      icon: "⚡",
      description: "Profit efficiency relative to total asset base"
    },
    {
      label: "Dividend Yield",
      value: formatRatioPercent(stock.dividendYield),
      icon: "💰",
      description: "Dividend payout relative to share price"
    }
  ];

  return (
    <div className="space-y-5 transition-colors duration-300">
      
      {/* SECTION TITLE */}
      <div>
        <h3 className="font-serif text-lg text-text-0 font-bold transition-colors">
          Financial Summary
        </h3>
        <p className="text-xs text-text-2 mt-1">
          Key profitability, returns, and valuation metrics
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            className="flex flex-col justify-between rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm hover:border-bull/20 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-2">
                {card.label}
              </span>
            </div>

            <div className="mt-3.5 space-y-1">
              <div className="font-mono text-base sm:text-lg font-bold text-text-0 transition-colors tracking-tight">
                {card.value}
              </div>
              <p className="text-[9px] text-text-3 font-sans leading-tight">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FinancialCard;
