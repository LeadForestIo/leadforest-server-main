var nodemailer = require('nodemailer');

const emailController = {};

emailController.sendEmail = async (req, res, next) => {
  // Read data from request body
  const CODE = req.body.code;
  const sendTo = req.body.email;
  try {
    // console.log(id, sendTo, product.price);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: sendTo,
      subject: 'Verification code from Leadforest.io',
      html: `<h1>Your 6 digit code is : ${CODE}</h1>`,
    };
    console.log(sendTo, CODE, 'this is log');
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).send({
          isSuccess: false,
          msg: error.message || 'something went wrong at server',
        });
      } else {
        res.status(200).send({ isSuccess: true, msg: 'success', info: info });
      }
    });
  } catch (err) {
    res
      .status(500)
      .send({ msg: err.message || 'something went wrong at server' });
  }
};

module.exports = emailController;
