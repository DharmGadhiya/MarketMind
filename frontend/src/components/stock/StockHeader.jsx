import { formatPrice, formatPercent, formatMetric } from "../../Utilities/utils/stockFormat";
import WatchToggle from "./WatchToggle";

const StockHeader = ({ stock }) => {
  if (!stock) return null;

  const isPositive = stock.priceChange >= 0;
  const logoText = stock.companyName ? stock.companyName.charAt(0) : stock.symbol.charAt(0);
  
  // Format change text
  const changeValue = Number(stock.priceChange);
  const formattedChange = isNaN(changeValue) 
    ? "N/A" 
    : `${isPositive ? "+" : ""}${changeValue.toFixed(2)}`;

  return (
    <div className="flex flex-col gap-5 border-b border-border-custom pb-6 sm:flex-row sm:items-center sm:justify-between transition-colors duration-300">
      
      {/* COMPANY INFO LEFT SECTION */}
      <div className="flex items-center gap-4">
        {/* LOGO SHIELDS */}
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border-strong bg-gradient-to-br from-[#0a8c5b] to-[#064a30] shadow-sm select-none">
          <span className="font-serif text-3xl text-white">
            {logoText}
          </span>
          {isPositive && (
            <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-bull border-2 border-bg-1 pulse-dot" />
          )}
        </div>

        {/* DETAILS */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-text-0 sm:text-3xl transition-colors">
              {stock.companyName}
            </h1>
            <span className="rounded-lg bg-bg-2 border border-border-strong/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-1 font-semibold transition-colors">
              NSE: {stock.symbol}
            </span>
            <WatchToggle
              symbol={stock.symbol}
              currentPrice={stock.currentPrice}
              changePercent={stock.percentChange}
              buttonClassName="h-9 w-9 p-2 rounded-xl bg-white dark:bg-bg-1 border-border-strong text-text-1 hover:bg-bg-2 shadow-sm"
              iconClassName="h-[18px] w-[18px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-2 font-medium">
            <span>{stock.sector}</span>
            <span className="text-text-3 font-normal">•</span>
            <span>{stock.industry}</span>
            <span className="text-text-3 font-normal">•</span>
            
            {/* MARKET STATUS BADGE */}
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider">
              <span className={`h-1.5 w-1.5 rounded-full ${stock.marketState === "CLOSED" ? "bg-text-3" : "bg-bull animate-pulse"}`} />
              <span className={stock.marketState === "CLOSED" ? "text-text-2" : "text-bull"}>
                {stock.marketState === "CLOSED" ? "Closed" : "Live"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* PRICE INFO RIGHT SECTION */}
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <div className="font-mono text-2xl font-bold tracking-tight text-text-0 sm:text-3xl transition-colors">
          {formatPrice(stock.currentPrice)}
        </div>
        
        <div className={`flex items-center gap-1.5 font-mono text-xs font-bold ${isPositive ? "text-bull" : "text-bear"}`}>
          <span>{formattedChange}</span>
          <span>({formatPercent(stock.percentChange, true)})</span>
        </div>
      </div>

    </div>
  );
};

export default StockHeader;
