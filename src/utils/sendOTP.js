const { generateOTP } = require("../helpers/generateOTP");
const sendMail = require("./sendMail");

const sendOTP = async (user) => {
    const otp = generateOTP();
    console.log(`Generated OTP: ${otp}`); 
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();
  
    const emailText = `Your OTP code is ${otp}. It is valid for 10 minutes.`;
    await sendMail(user.email, "Your OTP Code", emailText);
  };

module.exports = {
  sendOTP,
};
