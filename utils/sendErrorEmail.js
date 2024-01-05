const nodemailer = require('nodemailer');

module.exports = async (to, text, devDeps) => {
  // Read data from request body
  if (devDeps && devDeps !== process.env.NODE_ENV) return 'devDeps dismatch';
  try {
    // console.log(id, sendTo, product.price);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    // console.log(process.env.EMAIL, process.env.EMAIL_PASS, '=============');
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject: 'Verification code from Leadforest',
      html: text,
      //   html: `Your 6 digit code is : ${CODE}`,
    };
    return transporter.sendMail(mailOptions);
  } catch (err) {
    return { isSuccess: false, message: err.message };
  }
};
