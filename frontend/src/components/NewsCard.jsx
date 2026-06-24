import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { timeAgo, cleanSource } from "../Utilities/utils/format";

const FALLBACK =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop&q=70";

const NewsCard = ({ news, index = 0 }) => {
  return (
    <Link
      to={`/news/${news._id}`}
      className="group card-lift shimmer relative overflow-hidden rounded-xl border border-black/8 bg-white rise-up"
      style={{
        animationDelay: `${Math.min(index * 60, 480)}ms`,
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f3efe7]">

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

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b7280]">

          <span className="text-[#0a8c5b]">
            {cleanSource(news.source)}
          </span>

          <span>/</span>

          <Clock size={10} />

          <span>
            {timeAgo(news.published_at)}
          </span>

        </div>

        <h3 className="clamp-3 font-serif text-[22px] leading-[1.15] text-[#0a0e14] transition-colors duration-300 group-hover:text-[#0a8c5b]">
          {news.title}
        </h3>

        {news.description && (
          <p className="clamp-2 text-[13.5px] leading-relaxed text-[#6b7280]">
            {news.description}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between border-t border-black/8 pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af]">
            Read story
          </span>

          <span className="h-px w-10 bg-[#d4cfc4] transition-all duration-500 group-hover:w-20 group-hover:bg-[#0a8c5b]" />
        </div>

      </div>
    </Link>
  );
};

export default NewsCard;