const Joi = require("joi");

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    displayName: Joi.string().required(),
    password: Joi.string().required(),
}).required();


const registerUpdateSchema = Joi.object({
    email: Joi.string().email().required(),
    UID: Joi.string().required(),
    OTP: Joi.string().required(),
    password: Joi.string().required(),
}).required();

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    UID: Joi.string().required(),
    password: Joi.string().required(),
}).required();
exports.isValidRegisterData = (req, res, next) => {
    try {
        const { error } = registerSchema.validate(req.body, {
            abortEarly: false,
        });
        if (!error) return next();
        const errors = error?.details?.reduce?.((a, { context, message }) => {
            a[context.key] = message?.replace(/"/g, "");
            return a;
        }, {});
        return res
            .status(400)
            .json({ errors, message: `Fail to register user!`, success: false });
    } catch (e) {
        res.status(500).json({
            message: e.message,
            success: false,
        });
    }
};

exports.isValidRegisterDataUpdate = (req, res, next) => {
    try {
        const { error } = registerUpdateSchema.validate(req.body, {
            abortEarly: false,
        });
        if (!error) return next();
        const errors = error?.details?.reduce?.((a, { context, message }) => {
            a[context.key] = message?.replace(/"/g, "");
            return a;
        }, {});
        return res
            .status(400)
            .json({ errors, message: `Fail to register user!`, success: false });
    } catch (e) {
        res.status(500).json({
            message: e.message,
            success: false,
        });
    }
};

exports.isValidLoginData = (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body, {
            abortEarly: false,
        });
        if (!error) return next();
        const errors = error?.details?.reduce?.((a, { context, message }) => {
            a[context.key] = message?.replace(/"/g, "");
            return a;
        }, {});
        return res
            .status(400)
            .json({ errors, message: `Fail to login!`, success: false });
    } catch (e) {
        res.status(500).json({
            message: e.message,
            success: false,
        });
    }
};
