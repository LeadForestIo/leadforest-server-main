const nodemailer = require("nodemailer");

const temp = (
  CODE,
  name
) => `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
<div style="margin:50px auto;width:70%;padding:20px 0">
  <div style="border-bottom:1px solid #eee">
    <a href="https://app.leadforest.io" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Leadforest.io</a>
  </div>
  <p style="font-size:1.1em">Hi ${name || ""},</p>
  <p>Thank you for choosing Leadforest.io. Use the following OTP to complete your Sign Up procedures. OTP is valid for 15 minutes</p>
  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${CODE}</h2>
  <p style="font-size:0.9em;">Regards,<br />Tweetsy</p>
  <hr style="border:none;border-top:1px solid #eee" />
  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
    <p>Leadforest.io</p>
    <p>1600 Amphitheatre Parkway</p>
    <p>California</p>
  </div>
</div>
</div>`;

module.exports = async (CODE, sendTo, name) => {
  // Read data from request body
  try {
    // console.log(id, sendTo, product.price);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    // console.log(process.env.EMAIL, process.env.EMAIL_PASS, '=============');
    const mailOptions = {
      from: process.env.EMAIL,
      to: sendTo,
      subject: "Verification code from Leadforest",
      html: temp(CODE, name),
      //   html: `Your 6 digit code is : ${CODE}`,
    };
    console.log(sendTo, CODE, "this is log");
    return transporter.sendMail(mailOptions);

    // return transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //       return { isSuccess: false, message: error.message };
    //     } else {
    //       console.log();
    //       return { isSuccess: true, msg: 'success', info: info };
    //     }
    //   });
  } catch (err) {
    console.log(err);
    return { isSuccess: false, message: err.message };
  }
};
