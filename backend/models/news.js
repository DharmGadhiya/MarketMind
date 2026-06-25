import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    url: String,

    image_url: String,

    source: String,

    published_at: {
      type: Date,
      required: true,
    },

    keywords: {
      type: [String],
      default: [],
    },

    entities: [
      {
        symbol: String,
        name: String,

        industry: String,
        sentiment_score: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
);

NewsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 });

export default mongoose.model("News", NewsSchema);
