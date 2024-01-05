const { isValidObjectId } = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { stripe } = require("../utils/stripe");
// GET ALL USERS

exports.getAllUsersExports = async (req, res) => {
  const allUsersExports = await User.find().select("-token -tokenSecret");
  res.json({ allUsersExports });
};

exports.getsingleUserExports = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: `User id must be provide` });

  if (id && !isValidObjectId(id))
    return res
      .status(400)
      .json({ success: false, message: `Please provide a valid user id!` });

  const singleUserExports = await User.findById(id).select(
    "-token -tokenSecret"
  );

  res.json({ singleUserExports });
};

exports.me = async (req, res) => {
  try {
    const { _id } = req.user;
    const me = await User.findById(_id).select(
      "-password -OTP -OTPExpiry -scrapedData -updatedAt -__v"
    );
    res.json({ me });
  } catch (e) {
    const status = e.status || 500;
    const message = e.message || `Something Went Wrong!`;
    res.status(status).json({
      message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { roles, status } = req.body;

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: `User id must be provide` });

  if (id && !isValidObjectId(id))
    return res
      .status(400)
      .json({ success: false, message: `Please provide a valid user id!` });
  try {
    const updateData = {};
    if (roles?.length) updateData.roles = roles;
    if (status) updateData.roles = status === "ACTIVE" ? true : false;
    const updateUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-token -tokenSecret");

    return res.json({ updateUser });
  } catch (e) {
    res.sendStatus(500);
  }
};

exports.updateTokenOfUser = async (req, res) => {
  try {
    const { token, tokenSecret, screenName, UID, photoUrl } = req.body;

    // console.log(req.body);

    if (!token || !tokenSecret || !UID || !screenName) {
      return res.sendStatus(400);
    }
    const currentUser = await User.findOne({ UID });
    if (!currentUser) {
      return res.sendStatus(400);
    }
    const LoggedUser = await LoggedinUser.findOne({ UID });

    if (!LoggedUser) {
      return res.sendStatus(400);
    }
    consumer().get(
      "https://api.twitter.com/1.1/account/verify_credentials.json",
      token,
      tokenSecret,
      async function (error, data) {
        if (error) {
          res.sendStatus(error?.statusCode || 500); // TODO: check on frontend
        } else {
          // console.log(data);
          const parseData = JSON.parse(data);
          console.log("You are signed in as: " + parseData["screen_name"]);
          // twitterID: parseData.id_str,
          const updateDoc = {
            $set: {
              //   user_email: email,
              token,
              tokenSecret,
              screenName,
              status: "Active",
              twitterID: parseData.id_str,
              profileIMG: photoUrl,
            },
          };
          const updated = await User.updateOne({ UID }, updateDoc, {
            upsert: true,
          });
          const Loggedupdated = await LoggedinUser.updateOne(
            { UID },
            { screenName },
            {
              upsert: true,
            }
          );
          // console.log(Loggedupdated);
          if (!updated || !Loggedupdated) {
            return res.sendStatus(500);
          }
          res.status(200).json({
            message: `Update successfullay`,
          });
        }
      }
    );
  } catch (e) {
    res.sendStatus(500);
  }
};

exports.getUserByUID = async (req, res) => {
  const UID = req.body.UID;

  if (!UID)
    return res
      .status(400)
      .json({ success: false, message: `Please provide valid UID` });

  try {
    const { UID, email } = req.body;
    if (!UID || !email) {
      return res.sendStatus(400);
    }

    const existUser = await User.findOne({
      $and: [{ user_email: email }, { UID }],
    }).exec();
    // console.log(existUser);
    //exist message for existing user
    if (!existUser) {
      return res.status(400).json({
        message: `Credentials doesn't match!U`,
      });
    }
    //check loggedin user by UID and email
    const existLogged = await LoggedinUser.findOne({
      $and: [{ user_email: email }, { UID }],
    }).exec();
    //loggedin  existing user
    if (!existLogged) {
      return res.status(400).json({
        message: `Credentials doesn't match!`,
      });
    }
    // User Data For Database
    const user = { ...existUser?._doc };

    // create jwt token
    const tokenData = {
      email: email,
      UID: UID,
    };
    var token = jwt.sign({ tokenData }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
    });
    let stripeInfo = { havePlan: false };

    if (user?.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list(
        {
          customer: user.stripeCustomerId,
          status: "all",
          expand: ["data.default_payment_method"],
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );

      if (subscriptions?.data?.length) {
        stripeInfo = {
          havePlan: true,
          created: subscriptions?.data[0].created * 1000,
          current_period_start:
            subscriptions?.data[0].current_period_start * 1000,
          current_period_end: subscriptions?.data[0].current_period_end * 1000,
          email: subscriptions?.data[0].email,
          name: subscriptions?.data[0].name,
          plan: subscriptions?.data[0].plan,
        };
      }
    }
    // stripeCustomerId
    res.json({
      stripe: stripeInfo,
      user,
      loggedin_user: { ...existLogged?._doc },
      token: token,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};
