import { Link } from "react-router-dom";
import { ArrowUpRight, Flame } from "lucide-react";
import { timeAgo, cleanSource } from "../Utilities/utils/format";

const FALLBACK =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop&q=70";

const FeaturedHero = ({ items }) => {
  if (!items || items.length === 0) return null;

  const [main, ...rest] = items;
  const sides = rest.slice(0, 2);

  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 rise-up">

      <Link
        to={`/news/${main._id}`}
        className="group relative col-span-1 overflow-hidden rounded-2xl border border-border-strong bg-bg-1 lg:col-span-2 transition-colors duration-300"
      >
        <div className="relative h-[440px] lg:h-[540px] overflow-hidden">
          <img
            src={main.image_url || FALLBACK}
            alt={main.title}
            className="h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-7 lg:p-10">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#fbbf24]/50 bg-[#fbbf24]/15 px-3 py-1 text-[#fde68a] backdrop-blur-md">
            <Flame size={12} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Top Story
            </span>
          </div>

          <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/80">
            <span className="text-[#4ade80]">
              {cleanSource(main.source)}
            </span>

            <span>•</span>

            <span>
              {timeAgo(main.published_at)}
            </span>
          </div>

          <h2 className="clamp-3 font-serif text-3xl text-white sm:text-4xl lg:text-[44px] lg:leading-[1.05]">
            {main.title}
          </h2>

          <p className="clamp-2 mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">
            {main.description}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 border-b border-white/60 pb-1 text-sm text-white">
            Read full story
            <ArrowUpRight size={15} />
          </div>

        </div>
      </Link>

      <div className="grid grid-cols-1 gap-5">

        {sides.map((n) => (
          <Link
            key={n._id}
            to={`/news/${n._id}`}
            className="group relative flex h-[258px] overflow-hidden rounded-2xl border border-border-custom bg-bg-1 card-lift transition-colors duration-300"
          >

            <div className="relative w-[45%] overflow-hidden">
              <img
                src={n.image_url || FALLBACK}
                alt={n.title}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">

              <div>

                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-2 transition-colors">

                  <span className="text-bull transition-colors">
                    {cleanSource(n.source)}
                  </span>

                  <span>/</span>

                  <span>
                    {timeAgo(n.published_at)}
                  </span>

                </div>

                <h3 className="clamp-3 font-serif text-[19px] leading-[1.15] text-text-0 transition-colors">
                  {n.title}
                </h3>

              </div>

              <div className="flex items-center gap-2 text-xs text-text-2 transition-colors">
                Read
                <ArrowUpRight size={12} />
              </div>

            </div>

          </Link>
        ))}

      </div>

    </section>
  );
};

export default FeaturedHero;