const ChartToolbar = ({ activeRange, onChangeRange }) => {
  const TIMEFRAMES = [
    { label: "1D", value: "1d" },
    { label: "5D", value: "5d" },
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
    { label: "3Y", value: "3y" },
    { label: "5Y", value: "5y" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-custom bg-bg-1 pb-3.5 transition-colors">
      <h3 className="font-serif text-base font-bold text-text-0">
        Interactive Chart
      </h3>

      {/* TIMEFRAME BUTTONS */}
      <div className="flex items-center gap-1 rounded-xl bg-bg-0 p-1 border border-border-custom/50 font-mono text-[10px] font-bold text-text-2 transition-colors">
        {TIMEFRAMES.map((tf) => {
          const isActive = tf.value === activeRange;
          return (
            <button
              key={tf.value}
              onClick={() => onChangeRange(tf.value)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-center select-none ${
                isActive
                  ? "bg-bull text-white shadow-sm scale-[1.03]"
                  : "hover:text-text-0 hover:bg-bg-1"
              }`}
            >
              {tf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChartToolbar;
