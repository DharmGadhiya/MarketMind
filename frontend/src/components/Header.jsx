import { Link } from "react-router-dom";

const Header = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 glass border-b border-black/8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10">

        <Link
          to="/"
          className="group flex items-center gap-3"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-black/10 bg-gradient-to-br from-[#0a8c5b] to-[#064a30]">

            <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-white">
              M
            </div>

            <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#0a8c5b] pulse-dot" />
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl text-[#0a0e14]">
              MarketMind
            </span>

            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b7280]">
              news terminal
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9ca3af]">
            Live Market Coverage
          </span>

          <span className="font-serif italic text-[15px] text-[#2a2f38]">
            {today}
          </span>
        </div>

      </div>
    </header>
  );
};

export default Header;