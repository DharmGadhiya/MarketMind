// src/components/NewsCard.jsx

import { useNavigate } from "react-router-dom";

const NewsCard = ({ news }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/news/${news._id}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <img
        src={
          news.image_url ||
          "https://via.placeholder.com/400x250?text=No+Image"
        }
        alt={news.title}
        className="w-full h-52 object-cover"
      />

      <div className="p-4">
        <h2 className="text-lg font-bold line-clamp-2">
          {news.title}
        </h2>

        <p className="text-gray-600 mt-2 line-clamp-3">
          {news.description}
        </p>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>{news.source}</span>

          <span>
            {new Date(news.published_at).toLocaleDateString()}
          </span>
        </div>

        {news.entities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {news.entities.slice(0, 3).map((entity, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
              >
                {entity.symbol}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;