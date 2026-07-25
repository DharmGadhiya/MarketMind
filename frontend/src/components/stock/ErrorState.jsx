import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex min-h-[450px] w-full flex-col items-center justify-center py-12 px-6">
      <div className="max-w-md text-center rounded-2xl border border-border-custom bg-bg-1 p-8 shadow-sm transition-all duration-300">
        
        {/* ICON */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bear/10 text-bear animate-bounce">
          <AlertCircle size={26} />
        </div>

        {/* ERROR MSG */}
        <h3 className="font-serif text-2xl text-text-0 font-bold mb-2">
          Unable to Load Stock Details
        </h3>
        
        <p className="text-xs text-text-2 mb-6 leading-relaxed">
          {message || "We encountered an issue fetching the live stock metrics or chart data from Yahoo Finance. Please check your network or try again."}
        </p>

        {/* RETRY BUTTON */}
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-bull hover:bg-bull/95 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
