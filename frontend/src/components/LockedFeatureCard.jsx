import { Lock } from "lucide-react";

/**
 * LockedFeatureCard Component
 * Displays a premium card indicating the feature is locked for guest users.
 * Matches the reference image styling: rounded container, outline lock badge,
 * serif title, description, and an amber-accent login button.
 */
const LockedFeatureCard = ({ title, description }) => {
  const handleTriggerLogin = () => {
    window.dispatchEvent(new CustomEvent("open-login-modal"));
  };

  return (
    <div className="mx-auto my-10 max-w-xl rounded-3xl border border-border-strong bg-bg-1 p-8 md:p-12 text-center shadow-2xl transition-all duration-300 animate-fade-in flex flex-col items-center justify-center gap-6 relative overflow-hidden">
      {/* Decorative Blur Background Element */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-bull/5 rounded-full blur-3xl pointer-events-none" />

      {/* OUTLINE CIRCLE LOCK BADGE */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-500/10 shadow-inner">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
          <Lock size={18} className="stroke-[2.5]" />
        </div>
      </div>

      {/* TEXT CONTENT */}
      <div className="space-y-3">
        <h2 className="font-serif text-2xl md:text-3xl text-text-0 font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-xs md:text-sm text-text-2 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {/* ACCENT LOGIN BUTTON */}
      <button
        onClick={handleTriggerLogin}
        className="mt-2 flex items-center gap-2 rounded-xl bg-[#b45309] hover:bg-[#9a4004] px-6 py-3 text-xs font-semibold text-white tracking-wide transition-all active:scale-95 shadow-lg shadow-orange-950/20 cursor-pointer font-sans"
      >
        <Lock size={13} className="stroke-[2.5]" />
        <span>Login to Unlock</span>
      </button>
    </div>
  );
};

export default LockedFeatureCard;
