// SCRAP EMAIL MODEL REQUIRES
const { Schema, model, Types } = require('mongoose');

// SCRAP Data SCHEMA
const scrapedDataSchema = new Schema(
  {
    importType: {
      type: String,
      enum: ["followers", "followings", "list", "like", "retweet"],
      required: true,
    }, 
    scrapeReference: {
      type: String,
      required: true,
    },
    uid: {
      type: Types.ObjectId,
      required: true, 
      ref: 'User'
    },
    totalScraped: { 
      type: Number
    },
    status: {
      type: String,
      enum: ["Scraped", "Initializing", "InProgress", "Done"],
      required: true, 
      default: 'Scraped'
    },
    data: {
      type: Array,
      required: true,
    },
    bioContains: {
      required: true,
      type: Array,
      default: [],
    },
    bioNotContains: {
      required: true,
      type: Array,
      default: [],
    },
    scrappedEmailCount: {
      type: Number,
      required: true,
      default: 0,
    },
    maxEmailScrapeCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'scrapedData',
  }
);

// Scraped Data MODEL
const ScrapedData = model('ScrapedData', scrapedDataSchema);

// EXPORTS
module.exports = ScrapedData;
