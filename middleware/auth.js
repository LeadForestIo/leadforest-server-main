const User = require("../models/User");
const { verify } = require("jsonwebtoken");

exports.authentication = async (req, res, next) => {
  try {
    const auth = req.headers?.authorization;
    if (!auth) return res.sendStatus(400);
    const token = auth?.split?.(`Bearer `)?.[1];
    if (!token) return res.sendStatus(400);
    verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(401);
      User.findById(decoded.tokenData.id)
        .select("-password -OTP -OTPExpiry -__v")
        .then((d) => {
          req.user = d._doc;
          return next();
        })
        .catch((d) => res.sendStatus(401));
    });
  } catch (e) {
    return res.sendStatus(500);
  }
};

exports.authorization = async (req, res, next) => {
  try {
    const role = req.user?.role;
    const authorizedRoles = process.env.AUTHORIZED_ROLES.split(",");

    if (!authorizedRoles.includes(role)) return res.sendStatus(403);
    return next();
  } catch (e) {
    return res.sendStatus(500);
  }
};
