import mongoose from "mongoose";

const AIAnalysisSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      required: true,
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    aiModel: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AIAnalysis", AIAnalysisSchema);
