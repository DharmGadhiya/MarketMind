const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    url: {
        type: String
    },
    image_url: {
        type: String
    },
    source: {
        type: String
    },
    published_at: {
        type: Date
    },
    keywords: {
        type: String
    },

    entities: [
        {
            symbol: {
                type: String
            },
            name: {
                type: String
            },
            industry: {
                type: String
            },
            sentiment_score: {
                type: Number
            }
        }
    ],
    
}, {
    timestamps: true
});

NewsSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 3 * 24 * 60 * 60 }
);

module.exports = mongoose.model("News", NewsSchema);