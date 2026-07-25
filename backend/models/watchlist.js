import mongoose from "mongoose";

/**
 * Watchlist Schema for tracking user's stock alert preferences.
 * Each entry connects a User to a stock symbol with a specific alert threshold.
 */
const WatchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    alertThreshold: {
      type: Number,
      required: true,
    },
    isWatched: {
      type: Boolean,
      default: false,
    },
    lastAlertedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from adding the same stock to their watchlist multiple times
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", WatchlistSchema);

export default Watchlist;
