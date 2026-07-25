import { useState } from "react";

const CompanyCard = ({ stock }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stock) return null;

  const hasDescription = stock.description && stock.description !== "N/A";

  return (
    <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4 transition-colors duration-300">
      <h3 className="font-serif text-base font-bold text-text-0">
        Company Information
      </h3>

      <div className="space-y-3">
        {/* SECTOR & INDUSTRY */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="font-sans text-[10px] text-text-2 font-medium">Sector</span>
            <div className="text-text-0 font-semibold">{stock.sector}</div>
          </div>
          <div className="space-y-1">
            <span className="font-sans text-[10px] text-text-2 font-medium">Industry</span>
            <div className="text-text-0 font-semibold leading-tight">{stock.industry}</div>
          </div>
        </div>

        {/* BUSINESS DESCRIPTION */}
        {hasDescription && (
          <div className="border-t border-border-custom/50 pt-3 space-y-2">
            <span className="font-sans text-[10px] text-text-2 font-medium block">
              Business Description
            </span>
            <p 
              className={`text-xs leading-relaxed text-text-2 transition-all duration-300 ${
                isExpanded ? "" : "clamp-4"
              }`}
            >
              {stock.description}
            </p>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="font-mono text-[10px] font-bold text-bull hover:underline cursor-pointer select-none"
            >
              {isExpanded ? "Read Less ▲" : "Read More ▼"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
