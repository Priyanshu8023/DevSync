const mongoose = require("mongoose");

const codechefSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true },

    // Profile Info
    profile: { type: String }, // profile image URL
    name: { type: String },

    // Country Info
    countryFlag: { type: String },
    countryName: { type: String },

    // Rating Details
    currentRating: { type: Number },
    highestRating: { type: Number },
    globalRank: { type: Number },
    countryRank: { type: Number },
    stars: { type: String },

    // Performance Data
    heatMap: { type: Object }, // daily submission stats
    ratingData: { type: Object }, // contest rating data

    // For batch updates / cron jobs
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CodeChef = mongoose.model("CodeChef", codechefSchema);

module.exports = CodeChef;


