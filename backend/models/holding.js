import mongoose from "mongoose";

/**
 * Holding Schema for tracking user stock trade entries.
 * Represents individual transactions of a user's holdings.
 */
const HoldingSchema = new mongoose.Schema(
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
      index: true,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: [0.0001, "Buy price must be greater than 0"],
    },
    qty: {
      type: Number,
      required: true,
      min: [0.0001, "Quantity must be greater than 0"],
    },
  },
  {
    timestamps: true,
  }
);

const Holding = mongoose.model("Holding", HoldingSchema);

export default Holding;
