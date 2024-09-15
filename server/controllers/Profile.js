const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImagetoCloudinary } = require("../utils/imageUploader");

exports.updateProfile = async (req,res) => {
    try{
        // get data
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
          } = req.body;

        // get userId
        const id = req.user.id;

        // valodation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
              });
        }

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);


        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "Profile updated   successfully",
            profileDetails,
          });

    }catch(error){
        return res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}

// deleteAccount
exports.deleteAccount = async (req,res) => {
    try{
        // get id
        const id = req.user.id;

        // validation
        const userDetails = await User.findById(id);
        if(!userDetails){ 
            return res.status(404).json({
                success: false,
                message: "User not found",
              });        
        }

        // deleteProfile
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});

        // deleteUser
        await User.findByIdAndDelete({ _id: id });
        
        // return response
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
          });

    }catch(error){
        res.status(500).json({
			success: false,
			message: "User cannot be deleted successfully",
			error: error.message,
		});
    }
};


exports.getAllUserDetails = async (req,res)=>{
    try{
        // get id
        const id = req.user.id;

        // validation and get user detail
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        
        // return response
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: userDetails,
          });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          });      
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImagetoCloudinary(
          displayPicture,
          process.env.FOLDER_NAME,
          1000,
          1000
        )
        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
          { _id: userId },
          { image: image.secure_url },
          { new: true }
        )
        res.send({
          success: true,
          message: `Image Updated successfully`,
          data: updatedProfile,
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        })
      }
}

