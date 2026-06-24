const TickerTape = () => {
  return (
    <div className="relative w-full overflow-hidden border-y border-black/8 bg-[#f3efe7]">

      <div className="marquee-track py-3 font-mono text-[12px]">

        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-2 whitespace-nowrap"
          >
            <span className="tracking-wider text-[#6b7280]">
              Market Data Integration Coming Soon
            </span>

            <span className="text-[#0a8c5b]">
              •
            </span>
          </span>
        ))}

      </div>

    </div>
  );
};

export default TickerTape;