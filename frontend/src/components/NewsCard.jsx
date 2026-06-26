import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { timeAgo, cleanSource } from "../Utilities/utils/format";

const FALLBACK =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop&q=70";

const NewsCard = ({ news, index = 0 }) => {
  return (
    <Link
      to={`/news/${news._id}`}
      className="group card-lift shimmer relative overflow-hidden rounded-xl border border-border-custom bg-bg-1 rise-up transition-colors duration-300"
      style={{
        animationDelay: `${Math.min(index * 60, 480)}ms`,
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-2">

        <img
          src={news.image_url || FALLBACK}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/55 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight size={15} />
        </span>

      </div>

      <div className="flex flex-col gap-3 p-5">

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-2 transition-colors">

          <span className="text-bull transition-colors">
            {cleanSource(news.source)}
          </span>

          <span>/</span>

          <Clock size={10} />

          <span>
            {timeAgo(news.published_at)}
          </span>

        </div>

        <h3 className="clamp-3 font-serif text-[22px] leading-[1.15] text-text-0 transition-colors duration-300 group-hover:text-bull">
          {news.title}
        </h3>

        {news.description && (
          <p className="clamp-2 text-[13.5px] leading-relaxed text-text-2 transition-colors">
            {news.description}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between border-t border-border-custom pt-3 transition-colors">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-3 transition-colors">
            Read story
          </span>

          <span className="h-px w-10 bg-[#d4cfc4] dark:bg-[#334155] transition-all duration-500 group-hover:w-20 group-hover:bg-bull" />
        </div>

      </div>
    </Link>
  );
};

export default NewsCard;