const firebase = require('../../config/firebaseAdminConfig');
const User = require('../../models/User');
let count = 0;
exports.isAuthenticated = async (req, res, next) => {
  try {
    const authorization = req?.headers?.authorization;
    // console.log(authorization);
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      console.log(token, 'token');
      if (!token) {
        return next({ status: 400, message: `Missing token` });
      }

      try {
        const decode = await firebase.auth().verifyIdToken(token);
        const { uid, exp } = decode;
        console.log(uid, exp, decode, 'uid exp decode');
        console.log(new Date(exp * 1000).toLocaleTimeString());
        const user = await User.findOne({ UID: uid });
        console.log(user, 'user');
        // if (count === 3) {
        //   count++;
        //   return next({
        //     message: `refresh token test`,
        //     status: 403,
        //   });
        // }

        if (uid === '8nirA5UcmCbD5BwUvuZnBk37wrG3') {
          count++;
        }
        if (!user) {
          return next({
            status: 401,
            message: `User not found!`,
          });
        }
        req.user = user;
        return next();
      } catch (e2) {
        return next({ status: 403, message: e2.message });
      }
    } else {
      return next({ status: 400, message: `Missing token` });
    }
  } catch (ee) {
    return res.sendStatus(500);
  }
};
