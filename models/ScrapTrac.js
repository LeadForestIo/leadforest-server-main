// ScrapTrac MODEL REQUIRES
const { Schema, model } = require("mongoose");
//  ScrapTrac SCHEMA
const scrapTrac = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        screenNames: [String],
    },
    {
        timestamps: true,
        collection: "ScrapTrac",
    }
);
// ScrapTrac MODEL
const ScrapTrac = model("ScrapTrac", scrapTrac);
// EXPORTS
module.exports = ScrapTrac;