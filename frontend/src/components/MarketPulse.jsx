import { Activity } from "lucide-react";

const MarketPulse = () => {
  return (
    <aside className="sticky top-24 rounded-2xl border border-black/8 bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center gap-2 border-b border-black/8 pb-3">
        <Activity size={14} className="text-[#0a8c5b]" />

        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2a2f38]">
          Market Pulse
        </span>
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-black/10 bg-[#faf7f2]">

        <div className="text-center">
          <p className="font-serif text-xl">
            Market Data
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Integration coming soon
          </p>
        </div>

      </div>

    </aside>
  );
};

export default MarketPulse;