const Joi = require("joi");
const newPlanSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string().valid("monthly", "yearly").required(),
    facilities: Joi.array().items(Joi.string().required()).required(),
    permission: Joi.array().items(Joi.number().required()),
    price: Joi.number().required(),
    priceId: Joi.string().required(),
    prodId: Joi.string().required(),
    status: Joi.string().valid("active", "deactive"),
}).required();

const updatePlanSchema = Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    type: Joi.string().valid("monthly", "yearly"),
    facilities: Joi.array().items(Joi.string()),
    permission: Joi.array().items(Joi.number().required()),
    price: Joi.number(),
    priceId: Joi.string(),
    prodId: Joi.string(),
    status: Joi.string().valid("active", "deactive"),
}).min(1).required();

exports.isValidNewPlanData = (req, res, next) => {
    try {
        const { error } = newPlanSchema.validate(req.body, {
            abortEarly: false,
        });
        if (!error) return next();
        const errors = error?.details?.reduce?.((a, { context, message }) => {
            a[context.key] = message?.replace(/"/g, "");
            return a;
        }, {});
        return res.status(400).json({ errors, success: false });
    } catch (e) {
        res.status(500).json({
            message: e.message,
            success: false,
        });
    }
};

exports.isValidUpdatePlanData = (req, res, next) => {
    try {
        const { error } = updatePlanSchema.validate(req.body, {
            abortEarly: false,
        });
        if (!error) return next();
        const errors = error?.details?.reduce?.((a, { context, message }) => {
            a[context.key] = message?.replace(/"/g, "");
            return a;
        }, {});
        return res.status(400).json({ errors, success: false });
    } catch (e) {
        res.status(500).json({
            message: e.message,
            success: false,
        });
    }
};
