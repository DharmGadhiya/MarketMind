import { formatPrice, formatVolume } from "../../Utilities/utils/stockFormat";

const PerformanceCard = ({ stock }) => {
  if (!stock) return null;

  const currentVal = Number(stock.currentPrice);
  
  // Calculate slider position for Today's High/Low
  const todayLow = Number(stock.dayLow);
  const todayHigh = Number(stock.dayHigh);
  let todayProgress = 0;
  if (!isNaN(todayLow) && !isNaN(todayHigh) && todayHigh !== todayLow && !isNaN(currentVal)) {
    todayProgress = ((currentVal - todayLow) / (todayHigh - todayLow)) * 100;
    todayProgress = Math.max(0, Math.min(100, todayProgress));
  }

  // Calculate slider position for 52 Week High/Low
  const yrLow = Number(stock.fiftyTwoWeekLow);
  const yrHigh = Number(stock.fiftyTwoWeekHigh);
  let yrProgress = 0;
  if (!isNaN(yrLow) && !isNaN(yrHigh) && yrHigh !== yrLow && !isNaN(currentVal)) {
    yrProgress = ((currentVal - yrLow) / (yrHigh - yrLow)) * 100;
    yrProgress = Math.max(0, Math.min(100, yrProgress));
  }

  return (
    <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-6 transition-colors duration-300">
      <h3 className="font-serif text-base font-bold text-text-0">
        Performance
      </h3>

      <div className="space-y-6">
        
        {/* TODAY'S HIGH-LOW SLIDER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-sans text-text-2 font-medium">
            <span>Today's Low</span>
            <span>Today's High</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs text-text-0 font-bold">
            <span>{formatPrice(stock.dayLow)}</span>
            <span>{formatPrice(stock.dayHigh)}</span>
          </div>
          
          {/* Slider track */}
          <div className="relative pt-2 pb-2">
            <div className="h-1.5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-bull/60 to-bull"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            {/* Floating indicator */}
            {todayProgress > 0 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 -ml-1 h-3 w-2 rounded bg-text-0 border border-bg-1 shadow-sm transition-all duration-300"
                style={{ left: `${todayProgress}%` }}
              />
            )}
          </div>
        </div>

        {/* 52-WEEK HIGH-LOW SLIDER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-sans text-text-2 font-medium">
            <span>52 Week Low</span>
            <span>52 Week High</span>
          </div>
          <div className="flex items-center justify-between font-mono text-xs text-text-0 font-bold">
            <span>{formatPrice(stock.fiftyTwoWeekLow)}</span>
            <span>{formatPrice(stock.fiftyTwoWeekHigh)}</span>
          </div>
          
          {/* Slider track */}
          <div className="relative pt-2 pb-2">
            <div className="h-1.5 w-full rounded-full bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-bull/60 to-bull"
                style={{ width: `${yrProgress}%` }}
              />
            </div>
            {/* Floating indicator */}
            {yrProgress > 0 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 -ml-1 h-3 w-2 rounded bg-text-0 border border-bg-1 shadow-sm transition-all duration-300"
                style={{ left: `${yrProgress}%` }}
              />
            )}
          </div>
        </div>

        {/* GENERAL STATS */}
        <div className="border-t border-border-custom pt-4 grid grid-cols-2 gap-4 font-mono text-xs">
          <div className="space-y-1">
            <span className="font-sans text-[10px] text-text-2 font-medium">Open Price</span>
            <div className="text-text-0 font-bold">{formatPrice(stock.open)}</div>
          </div>
          <div className="space-y-1">
            <span className="font-sans text-[10px] text-text-2 font-medium">Prev Close</span>
            <div className="text-text-0 font-bold">{formatPrice(stock.previousClose)}</div>
          </div>
          <div className="space-y-1 col-span-2">
            <span className="font-sans text-[10px] text-text-2 font-medium">Trading Volume</span>
            <div className="text-text-0 font-bold text-sm tracking-wide">
              {formatVolume(stock.volume)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceCard;
