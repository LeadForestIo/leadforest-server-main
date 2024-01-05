// ALL Requires
const jwt = require("jsonwebtoken");
const User = require("../models/User");
// const LoggedinUser = require('../models/LoggedinUser');
const crypto = require("crypto");
const { auth } = require("../config/firebaseAdminConfig");
const sendEmail = require("../utils/sendEmail");
const { stripe } = require("../utils/stripe");
const { Types } = require("mongoose");
const ScrapTrac = require("../models/ScrapTrac");
const { ALLOW_TRAIL, TRAIL_DAYS } = require("../config");
// Twitter SignIn + Authorization Controller

exports.authByExtension = async (req, res) => {
  try {
    const { extensionCode } = req.body;
    //check user by UID and email
    const existUser = await User.findOne({ extensionCode })
      .select("-_id name email")
      .exec();
    //exist message for existing user
    if (!existUser) {
      return res.status(400).json({
        message: `Invalid Credentils!`,
        isSuccess: false,
      });
    }
    const { name: name, email: email } = existUser._doc;
    res.status(200).send({
      isSuccess: true,
      name,
      email,
    });
  } catch (e) {
    const status = e?.status || 500;
    res.status(status).json({
      isSuccess: false,
      message: e.message ? e.message : "Something went wrong!",
    });
  }
};
exports.emailPasswordRegister = async (req, res) => {
  try {
    const { UID, email, displayName: name, password } = req.body;
    // create Stripe customer ID

    if (!UID || !email || !name || !password) {
      return res.sendStatus(400);
    }
    //check user by UID and email
    const existUser = await User.findOne({
      $or: [{ email: email }, { UID }],
    });

    //exist message for existing user
    if (existUser) {
      return res.status(400).json({
        message: `User already exist!`,
      });
    }
    //check loggedin user by UID and email
    // const existLogged = await LoggedinUser.findOne({
    //   $or: [{ email: email }, { UID }],
    // });
    // if (!existUser && existLogged) {
    //   return res.sendStatus(500);
    // }

    let trial = new Date().valueOf();
    const end_date = new Date(trial).toISOString().split("T")[0];
    // User Data For Database
    const userData = {
      email: email,
      name,
      UID,
      endDate: end_date,
    };

    // Insert User to USER MODEL
    const saved = await User.create(userData);
    // Login User Data For User
    // create jwt token
    const tokenData = {
      id: saved.id,
      email: email,
      UID: UID,
    };
    var token = jwt.sign({ tokenData }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
    });

    res.json({
      user: saved?._doc || saved,
      loggedin_user: saved?._doc || saved,
      token: token,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};
const otpHash = (OTP) =>
  crypto.createHash("sha256").update(OTP?.toString()).digest("hex");
/**
 * ইমেইল এবং ওটিপি রিকোয়েস্ট বডি থেকে নিয়ে এবং OTP এক্সপিরি দিয়ে ডাটাবেজে চেক করা হচ্ছে যদি ইউজার না থাকে তাহলে ডাটাবেজে আবার ইমেইল ওটিপি ও ওটিপি এক্সপায়ারি বর্তমান সময় থেকে ছোট সময় দিয়ে চেক করা হচ্ছে এরপরে যদি ইউজার পাওয়া যায় তাহলে ওটিপি এক্সপায়ারি বর্তমান সময় থেকে কমিয়ে এবং ওটিপি এম্পটি করে ডাটাবেজে সেভ করা হচ্ছে আর যদি প্রথমবারই বাড়ি ইউজার পাওয়া যায় তাহলে আইডি একাউন্ট স্টেটাস ক্রেডিট ওটিপি নাল এক্সপায়ারি নাল এক্সটেনশন কোড এগুলো এগুলো ডাটাবেজে আপডেট করা হচ্ছে এবং ইমেইল আইডি ইউজার এবং _id  দিয়ে যে ডব্লিউ টি টোকেন জেনারেট করে stripe  havePlan false  করে রেসপন্স হিসেবে পাঠানো হচ্ছে
 */
exports.veriryOTPAndUpdateUserAndCrateLoggedIn = async (req, res) => {
  try {
    const { UID, email, OTP } = req.body;
    console.log("veriryOTPAndUpdateUserAndCrateLoggedIn");
    //check user by UID and OTP
    const OTPToken = otpHash(OTP);
    const findUser = await User.findOne({
      $and: [{ email }, { OTP: OTPToken }, { OTPExpiry: { $gt: Date.now() } }],
    });

    // if user not found then clean the OTP token and expiry time
    if (!findUser) {
      const again = await User.findOne({
        $and: [
          { email: email },
          { OTP: OTPToken },
          { OTPExpiry: { $lt: Date.now() } },
        ],
      });
      if (again) {
        await User.findOneAndUpdate(
          { email: email },
          {
            OTP: "",
            OTPExpiry: Date.now() - 3600,
          },
          { upsert: true }
        );
      }
    }

    if (!findUser) {
      return res.status(400).json({
        message: `invalid or expiried OTP`,
        isSuccess: false,
      });
    }

    let trial = new Date().valueOf();
    const end_date = new Date(trial).toISOString().split("T")[0];

    findUser.uid = UID;

    findUser.status = "active";
    findUser.OTP = null;
    findUser.OTPExpiry = null;
    await findUser.save();
    const userData = { ...findUser._doc };
    delete userData.password;
    delete userData.OTP;
    delete userData.OTPExpiry;
    await ScrapTrac.create({ email, screenNames: [] });

    // create jwt token
    const tokenData = { email, UID, id: userData._id };
    const token = jwt.sign({ tokenData }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
    });
    let stripe = { havePlan: false };
    res.json({
      stripe,
      user: userData,
      loggedin_user: userData,
      token: token,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

const generateOTP = () => {
  // Generating OTP for Client
  const OTP = crypto.randomInt(100000, 999999);
  //Generate OTP for server
  const OTPToken = crypto
    .createHash("sha256")
    .update(OTP.toString())
    .digest("hex");
  //OTP Expiry
  const OTPExpiry = Date.now() + 15 * 60 * 1000;
  return {
    OTPToken,
    OTP,
    OTPExpiry,
  };
};
/**
রিকোয়েস্ট বডি  থেকে ইমেইল এবং ওটিপি যদি থাকে তাহলে ওটিপি দিয়ে এবং ইমেইল দিয়ে এবং ওটিপি এক্সপায়ারি, প্রতিটি এক্সপেয়ার হিসেবে বর্তমান সময়ের সাথে কম্পেয়ার করে ডাটাবেজে চেক করতেছে যদি ইউজার থাকে তাহলে 202 রেসপন্স পাঠাচ্ছি
 */
exports.isExistOTPUser = async (req, res) => {
  try {
    const { email, OTP } = req.body;

    if (!email || !OTP) {
      return res.sendStatus(400);
    }

    //check user by email and OTP
    const OTPToken = otpHash(OTP);
    const user = await User.findOne({
      $and: [
        { email: email },
        { OTP: OTPToken },
        { OTPExpiry: { $gt: Date.now() } },
      ],
    }).exec();
    if (!user) {
      return res.status(400).json({
        message: `Invalid or expired OTP`,
      });
    }
    res.sendStatus(202);
  } catch (err) {
    res.sendStatus(500);
  }
};
/**
এখানেই বাড়িতেই ইমেইল পাসওয়ার্ড এবং নাম পাচ্ছি ইমেইল দিয়ে ফায়ারবেজ এর মাধ্যমে ইউজার আছে কিনা চেক করতেছি যদি জানা থাকে ফায়ার বেঁচে তাহলে ডাটাবেজে চেক করতেছি ইমেইল অথবা ইউ আই ডি এ
যদি ইউজার না থাকে তাহলে ওটিপি তকেন ওটিপি এবং ওটিপি এক্সপায়ারি জেনারেট করতেছি ইমেইলের মাধ্যমে ইউজারকে ওটিপি পাঠাচ্ছি মেইল যদি অ্যাকসেপ্ট না হয় তাহলে ইউজারকে 400 ইরর পাঠাচ্ছি এরপরে পাসওয়ার্ডকে এস করতেছি এরপর এক্সপায়ারি ওটিপি এবং ইমেইল নিন ক্রেডিট এবং পাসওয়ার্ড দিয়ে নতুন ইউজার ক্রিয়েট করতেছে এবং রেসপন্স হিসেবে ইমেইল এবং ওটিপি true পাঠাচ্ছি
 */
//  name, email
exports.emailPasswordRegisterWithOTP = async (req, res) => {
  try {
    const { email, displayName: name, password } = req.body;
    const customer = await stripe.customers.create({
      email: email,
    });

    let UID = "";
    auth()
      .getUserByEmail(email)
      .then(({ uid }) => {
        UID = uid;
      })
      .catch(() => {
        // console.log(d);
      });
    if (UID) {
      console.log({ UID });
      return res.status(400).json({
        message: `User already exist!`,
      });
    }
    //check user by UID and email
    const existUser = await User.findOne({
      $or: [{ email: email }, { UID }],
    }).exec();

    console.log({ existUser });

    //exist message for existing user
    if (existUser) {
      if (existUser?.status !== "pending") {
        return res
          .status(400)
          .json({ isSuccess: false, message: `User already exist!` });
      }
      // User Data For Database
      const { OTPToken, OTP, OTPExpiry } = generateOTP();
      const mailSend = await sendEmail(OTP, email, name.split(" ")?.[0]);
      if (!mailSend?.accepted) {
        return res.sendStatus(400);
      }

      const userData = {
        OTPExpiry,
        OTP: OTPToken,
        email,
        name,
        stripeCustomerID: customer.id,
        credits: 50,
        selectedPlan: "trial",
        extensionCode: Types.ObjectId(),
      };

      if (ALLOW_TRAIL) {
        const trailDays = TRAIL_DAYS ?? 7;
        const oneDays = 86400000; //seconds
        const endDate = new Date() + trailDays * oneDays;
        userData.endDate = endDate;
      }
      console.log({ userData });

      await User.updateOne({ email: email }, userData, {
        upsert: true,
      });

      return res.status(200).send({
        otp: true,
        email,
        isSuccess: true,
      });
    }

    // User Data For Database
    const { OTPToken, OTP, OTPExpiry } = generateOTP();
    const mailSend = await sendEmail(OTP, email, name.split(" ")?.[0]);
    if (!mailSend?.accepted) {
      return res.sendStatus(400);
    }

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100);
    const userData = {
      OTPExpiry,
      OTP: OTPToken,
      email,
      // UID: '',
      name,
      stripeCustomerID: customer.id,
      credits: 50,
      selectedPlan: "trial",
      endDate,
      extensionCode: Types.ObjectId(),
    };

    await User.create(userData);

    res.send({
      otp: true,
      email,
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};
// User.findOne({ email: 'dev.tweetsy@gmail.com' }).then(d => console.log(d)).catch(d => console.log(d))
/**
 বডি থেকে ইউআইডি ইমেইল এবং পাসওয়ার্ড নিচ্ছে এরপর ইউজার মডেলের ইমেইল দিয়ে চেক করতেছে ইউজার আছে কিনা যদি না থাকে সে ক্ষেত্রে এরর দিচ্ছে আর যদি থাকে তাহলে পূর্বে আমাদের একটা সমস্যা ছিল ফায়ারবেজ থেকে ইউজার ডিলিট করে দেয়া হচ্ছিল যদি সমস্যা থাকে এজন্য একই ইমেইল দিয়ে স্টোর করা ডাটাবেজ তৈরি এবং রিকোয়েস্ট বডি থেকে পাওয়া ইউআইডি যদি সমাধান না হয় তাহলে ডাটাবেজে বর্তমান ইউআইডি আপডেট করে দিচ্ছিলাম ইমেইলের মাধ্যমে ডাটাবেজ থেকে পাওয়া ইনফরমেশন থেকে পাসওয়ার্ড ডিলিট করে দিচ্ছি ইউজারের। 
এরপর টোকন জেনারেট করতেছি 
আইডি ইমেইল এবং ইউ আই ডি দিয়ে.
এরপরে ইউজার ইনফরমেশন এর ভিতরে যদি স্ট্রাইপ কাস্টমার আইডি থাকে তাহলে স্ট্রাইপ থেকে পেমেন্ট ইনফর্মেশন নিয়ে আসতেছি
 * @returns 
 */
exports.emailPasswordLogin = async (req, res) => {
  try {
    const { UID, email, password } = req.body;
    if (!UID || !email || !password) {
      return res.sendStatus(400);
    }
    const existUser = await User.findOne(
      { email }
      //   {
      //   $and: [{ email: email }, { UID }],
      // }
    ).exec();
    //exist message for existing user
    if (!existUser) {
      return res.status(400).json({
        message: `Credentials doesn't match!`,
      });
    }

    // User Data For Database
    const user = { ...existUser?._doc };
    if (user.uid !== UID) {
      existUser.uid = UID;
      await existUser.save();
    }
    delete user.password;

    // create jwt token
    const tokenData = {
      id: user._id,
      email: email,
      UID: UID,
    };
    var token = jwt.sign({ tokenData }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE, // expires in 365 day
    });

    // stripeCustomerId
    res.json({
      user,
      token: token,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};
exports.userInfo = (req, res) => {
  res.json(req.user);
};
exports.recreateToken = async (req, res) => {
  try {
    // create jwt token
    const tokenData = req.user;
    var token = jwt.sign({ tokenData }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE, // expires in 50 mins
    });
    res.json({
      token: token,
      isSuccess: true,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};
