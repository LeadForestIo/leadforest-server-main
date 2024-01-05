// SCRAP EMAIL MODEL REQUIRES
const { Schema, model } = require("mongoose");

// SCRAP EMAIL SCHEMA

// EXPORTS
module.exports = model(
  "TwitterUser",
  new Schema(
    {
      screenName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    {
      collection: "users",
    }
  )
);
