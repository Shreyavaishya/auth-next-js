import nodemailer from 'nodemailer';
import User from "../models/userModels.js";
import bcrypt from "bcrypt"
import { error } from 'console';

export const sendEmail = async({email, emailType, userId}: any) => {
    try {
      // create a hashed token 
      const hashedToken = await bcrypt.hash(userId.toString(), 10)

      if(emailType === "VERIFY"){
        await User.findByIdAndUpdate(userId, 
            { verifyToken: hashedToken,
              VerifyTokenExpiry: Date.now() + 3600000
            })
      } else if (emailType === "RESET"){
        await User.findByIdAndUpdate(userId,
            {forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry: Date.now() + 3600000})
      }

      var transport = nodemailer.createTransport({
        host: "sandbox.smtp.maitrap.io",
        port: 2525,
        auth: { // add these credentials to .env file
            user: "",
            pass: ""
        }
      });
      const mailOptions = {
        from: 'shreyavaishya@gmail.com',
        to: email,
        subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
        html:'', // write code here
      }

      const mailresponse = await transport.sendMail(mailOptions);
      return mailresponse;
      
      await User.findByIdAndUpdate(userId, {verifyToken: hashedToken, resetPasswordExpires: Date.now() + 3600000}, {new: true, runValidators: true})
    } catch (error:any){
        throw new Error(error.message);
    }
}