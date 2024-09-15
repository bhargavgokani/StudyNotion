const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

//resetPassword token

exports.resetPasswordToken = async (req, res) => {
    try{
        // get email from req body
        // check user for this mail,email validaation
        // genrate token
        // update user by adding token and expiration time
        // create url
        // send mail containing the url
        // return res

        // 1
        
		console.log("BODY..........",req.body);
		const email = req.body.email;

        // 2
        const user = await User.findOne({ email: email });
		if (!user) {
			return res.json({
				success: false,
				message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
			});
		}

        // 3
        const token = crypto.randomUUID();

        // 4
        const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        await mailSender(
			email,
			"Password Reset",
			`Your Link for email verification is ${url}. Please click this url to reset your password.`
		);

        // return res
		return res.json({
			success: true,
			message:
				"Email Sent Successfully, Please Check Your Email to Continue Further",
		});        


    }catch(error){
        return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
    }
}

// reset Password

exports.resetPassword = async (req, res) => {
    try{
        // data fetch
        const { password, confirmPassword, token } = req.body;
        // validation
        if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
        // get user datail from db using token
		const userDetails = await User.findOne({ token: token });
        // if no entry - invalid token
        if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
        }
        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
        // hash pwd
        const encryptedPassword = await bcrypt.hash(password, 10);
        // password update
        await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);
        // retuen res
		res.json({
			success: true,
			message: `Password Reset Successful`,
		})

    }catch(error){
        return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
    }
}