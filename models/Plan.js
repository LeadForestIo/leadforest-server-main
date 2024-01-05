const { Schema, model } = require("mongoose");

module.exports = model(
    "Plan",
    new Schema({
        name: {
            type: String,
            required: true,
        },
        description: String,
        type: {
            enum: ["monthly", "yearly"],
            type: String,
            required: true,
        },
        facilities: [
            {
                type: String,
                required: true,
            },
        ],
        permission: { type: [Number], required: true },
        price: {
            type: Number,
            required: true,
        },
        priceId: {
            type: String,
            required: true,
            unique: true,
        },
        prodId: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            required: true,
            default: "active",
        },

        // credit: { type: Number, default: 1 },
    })
);
