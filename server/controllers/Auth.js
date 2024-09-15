const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenrator = require("otp-generator");
const bcrypt = require("bcryptjs");
const Profile = require("../models/Profile");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// send otp

exports.sendotp = async (req, res) => {
    try{
        const { email } = req.body;

        // check if user already present 

        const checkUserPresent = await User.findOne({ email });
        
        // if user already exist, then return response
        if (checkUserPresent) {
            return res.status(401).json({
              success: false,
              message: `User is Already Registered`,
            })
        }

        var otp = otpGenrator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,      
        });
        console.log("OTP genrated :", otp);
        const result = await OTP.findOne({ otp: otp });

        while(result){
            otp = otpGenrator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,   
            });
            result = await OTP.findOne({otp: otp});
        }

        // create an entry for otp
        const otpPayload = { email, otp }
        const otpBody = await OTP.create(otpPayload)
        console.log("otp Body",otpBody);
        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp,
        })


    }catch(error){
        console.log(error.message)
        return res.status(500).json({ success: false, error: error.message })    
    }
}


// sign-up

exports.signup = async (req, res) => {
    try{

        // data fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
          } = req.body
        // validate karlo
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp
          ) {
            return res.status(403).send({
              success: false,
              message: "All Fields are required",
            })
          }
        // 2 password match karlo
        if (password !== confirmPassword) {
            return res.status(400).json({
              success: false,
              message:
                "Password and Confirm Password do not match. Please try again.",
            })
          }
        // check user already exist or not
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }
        // find most recent OTP stored for the user
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
        console.log(response)
        // validate otp
        if (response.length === 0) {
            // OTP not found for the email
            return res.status(400).json({
              success: false,
              message: "The OTP is not valid",
            })
          }else if (otp !== response[0].otp) {
            // Invalid OTP
            return res.status(400).json({
              success: false,
              message: "The OTP is not valid",
            })
          }
        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // entry created in DB
        // profile details created beacause of user's additional detail
        const profileDetails = await Profile.create({
          gender: null,
          dateOfBirth: null,
          about: null,
          contactNumber: null,
        });

        const user = await User.create({
          firstName,
          lastName,
          email,
          contactNumber,
          password: hashedPassword,
          accountType: accountType,
          // approved: approved,
          additionalDetails: profileDetails._id,
          image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return res

        return res.status(200).json({
          success: true,
          user,
          message: "User registered successfully",
        });
    

    }catch(error){
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again.",
      });
    }
}

// login

exports.login = async(req,res)=>{
    try{
      // get data from req body
      // validation data
      // user check exist or not
      // generate JWT, after password matching
      // create cookie and send response

      // 1
      const { email, password } = req.body;

      // 2
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: `Please Fill up All the Required Fields`,
        });
      }

      // 3
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: `User is not Registered with Us Please SignUp to Continue`,
        });
      }

      // 4
      if (await bcrypt.compare(password, user.password)) {
        const payload = {email: user.email, id: user._id, accountType: user.accountType}
        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn: "2h",
          });
          user.token = token;
          user.password = undefined;

        // 5 create cookie and send response
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: `User Login Success`,
        });
      }

      else{
        return res.status(401).json({
          success: false,
          message: `Password is incorrect`,
        });
      }
    }catch(error){
      console.error(error);
      return res.status(500).json({
        success: false,
        message: `Login Failure Please Try Again`,
      });
    }
}

  // change password

exports.changePassword = async(req,res)=>{

    try{

      // get data from req body
      // get old, new, confirmPassword
      const userDetails = await User.findById(req.user.id);
      const { oldPassword, newPassword } = req.body;

      // validation
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      );
      
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }

      // update password in DB
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      );

      // send mail-password updated
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response);
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        });
      }

      // return res
      return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });

    }catch(error){
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })

    }
}