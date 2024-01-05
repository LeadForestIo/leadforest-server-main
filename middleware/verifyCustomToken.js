const jwt = require('jsonwebtoken');

// writing utils function instead of middleware
const getEmailFromToken = (token) => {};
const createError = require('http-errors');

const verifyCustomTokenMiddleware = async (req, res, next) => {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(JSON.stringify(decoded), 'dec');
      //   const { email } = decoded;
      const { tokenData, exp } = decoded;
      const { email, UID } = tokenData;
      // console.log(decoded);
      // console.log(email, UID, exp, 'console.log from middleware');
      req.user = {
        email, 
        UID,
      };
      // req.user.UID = UID;
      // return email;
    } catch (e) {
      return res.status(401).send({
        isSuccess: false,
        isTokenExpired: true,
        message: e.message || 'Token expired, please login again',
      });
    }
  } else {
    return res.status(401).send({
      isSuccess: false,
      isTokenExpired: true,
      message: 'Please send valid token at header!',
    });
  }
  next();
};

module.exports = { verifyCustomTokenMiddleware };
