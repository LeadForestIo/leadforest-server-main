const Joi = require("joi");
const extensionNewScrapSchema = Joi.object({
    importType: Joi.string().required(),
    scrapeReference: Joi.string().required(),
    extensionCode: Joi.string()
        .pattern(/^[a-f0-9]{24}$/)
        .required()
        .messages({
            "string.pattern.base": "Invalid code!",
        }),

    data: Joi.array().items({
        name: Joi.string().required(),
        username: Joi.string().required(),
        bio: Joi.string(),
    }).required(),
}).required();

exports.isValidExtensionScrapData = (req, res, next) => {
    try {
        const { error } = extensionNewScrapSchema.validate(req.body, {
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
