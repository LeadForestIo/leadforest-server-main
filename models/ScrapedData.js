const { Schema, model, Types } = require("mongoose");
module.exports = model(
  "ScrapedData",
  new Schema(
    {
      importType: {
        type: String,
        required: true,
      },
      scrapeReference: {
        type: String,
        required: true,
      },
      uid: {
        // user _id
        type: Types.ObjectId,
        required: true,
        ref: "User",
      },
      totalScraped: { type: Number },
      foundEmailCount: { type: Number, default: 0 },
      status: {
        type: String,
        default: "Scraped",
      },
      data: {
        type: Array,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )
);
