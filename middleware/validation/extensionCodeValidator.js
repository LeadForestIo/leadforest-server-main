const Joi = require("joi");
const extensionAuthSchema = Joi.object({
    // email: Joi.string().email().required(),
    extensionCode: Joi.string()
        .pattern(/^[a-f0-9]{24}$/)
        .required().messages({
            'string.pattern.base': 'Invalid code!'
        }),
}).required();

exports.isExtensionCodeValid = (req, res, next) => {
    try {
        const { error } = extensionAuthSchema.validate(req.body, {
            abortEarly: false,
        }); 
        if (!error) return next();
        return res.status(400).json({ message:"Invalid ID", isSuccess: false });
    } catch (e) {
        res.status(500).json({
            message: e.message? e.message:"Something went wrong",
            isSuccess: false,
        });
    }
};
