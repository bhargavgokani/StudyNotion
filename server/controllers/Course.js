const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader");

// create Course handler function

exports.createCourse = async (req, res) => {
    try{
        // fetch data
        console.log("Creating course....");
        const userId = req.user.id;

        const {courseName, courseDescription, whatYouWillLearn, price,
          instructions: _instructions,category
        } = req.body;

        // Get thumbnail image from request files
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array to Array
        // const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)
    
        // console.log("tag", tag)
        console.log("instructions", instructions)
    
        // const tag = JSON.parse(_tag)
        // console.log("tag is ...",tag);

        // validation 
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !instructions.length) {
            return res.status(400).json({
              success: false,
              message: "All Fields are Mandatory" ,
            });
        }

        // check for instructor
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: " ,instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
              success: false,
              message: "Instructor Details Not Found",
            })
          }

        //   check if tag is valid or not 
        // const tagDetails = await Tag.findById(tag);
        // if(!tagDetails){
        //     return res.status(404).json({
        //         success: false,
        //         message: "Tag details not found",
        //       });        
        // }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        // create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            instructions,
            whatYouWillLearn: whatYouWillLearn,
            price,
            // tag,
            thumbnail: thumbnailImage.secure_url,
            category:category._id
        });

        // add new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        // update the tag ka schema
        // const tag = JSON.parse(_tag)
        // TODO:HW


        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data:newCourse
        });


    }
    

  // try{
  //       // Get user ID from request object
  //     const userId = req.user.id

  //     // Get all required fields from request body
  //     let {
  //       courseName,
  //       courseDescription,
  //       whatYouWillLearn,
  //       price,
  //       tag: _tag,
  //       category,
  //       status,
  //       instructions: _instructions,
  //     } = req.body
  //     // Get thumbnail image from request files
  //     const thumbnail = req.files.thumbnailImage

  //     // Convert the tag and instructions from stringified Array to Array
  //     const tag = JSON.parse(_tag)
  //     const instructions = JSON.parse(_instructions)

  //     console.log("tag", tag)
  //     console.log("instructions", instructions)

  //     // Check if any of the required fields are missing
  //     if (
  //       !courseName ||
  //       !courseDescription ||
  //       !whatYouWillLearn ||
  //       !price ||
  //       !tag.length ||
  //       !thumbnail ||
  //       !category ||
  //       !instructions.length
  //     ) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "All Fields are Mandatory",
  //       })
  //     }
  //     if (!status || status === undefined) {
  //       status = "Draft"
  //     }
  //     // Check if the user is an instructor
  //     const instructorDetails = await User.findById(userId, {
  //       accountType: "Instructor",
  //     })

  //     if (!instructorDetails) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Instructor Details Not Found",
  //       })
  //     }

  //     // Check if the tag given is valid
  //     const categoryDetails = await Category.findById(category)
  //     if (!categoryDetails) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Category Details Not Found",
  //       })
  //     }
  //     // Upload the Thumbnail to Cloudinary
  //     const thumbnailImage = await uploadImageToCloudinary(
  //       thumbnail,
  //       process.env.FOLDER_NAME
  //     )
  //     console.log(thumbnailImage)
  //     // Create a new course with the given details
  //     const newCourse = await Course.create({
  //       courseName,
  //       courseDescription,
  //       instructor: instructorDetails._id,
  //       whatYouWillLearn: whatYouWillLearn,
  //       price,
  //       tag,
  //       category: categoryDetails._id,
  //       thumbnail: thumbnailImage.secure_url,
  //       status: status,
  //       instructions,
  //     })

  //     // Add the new course to the User Schema of the Instructor
  //     await User.findByIdAndUpdate(
  //       {
  //         _id: instructorDetails._id,
  //       },
  //       {
  //         $push: {
  //           courses: newCourse._id,
  //         },
  //       },
  //       { new: true }
  //     )
  //     // Add the new course to the Categories
  //     const categoryDetails2 = await Category.findByIdAndUpdate(
  //       { _id: category },
  //       {
  //         $push: {
  //           courses: newCourse._id,
  //         },
  //       },
  //       { new: true }
  //     )
  //     console.log("HEREEEEEEEE", categoryDetails2)
  //     // Return the new course and a success message
  //     res.status(200).json({
  //       success: true,
  //       data: newCourse,
  //       message: "Course Created Successfully",
  //     })

  // }
  
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error:error.message
        });

    }
}

// get all course handler function

exports.showAllCourse = async (req, res) => {
    try{
        const allCourse = await Course.find({});

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data:allCourse
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error:error.message
        });

    }
}


// Get One Single Course Details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    console.log("fetching course id",courseId);

    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      // .populate({
      //   path: "instructor",
      //   // populate: {
      //   //   path: "additionalDetails",
      //   // },
      // })
      // .populate("category")
      // // .populate("ratingAndReviews")
      // .populate({
      //   path: "courseContent",
      //   // populate: {
      //   //   path: "subSection",
      //   // },
      // })
      // .exec()

    // console.log(
    //   "###################################### course details : ",
    //   courseDetails,
    //   courseId
    // );

    console.log("populate done");

// kaik problem che aaya commentout karisu to chalse  
// and populate ma pn problem che
    // if (!courseDetails || !courseDetails.length) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Could not find course with id: ${courseId}`,
    //   })
    // }

    if (courseDetails.status === "Draft") {
      return res.status(403).json({
        success: false,
        message: `Accessing a draft course is forbidden`,
      })
    }

    return res.status(200).json({
      success: true,
      data: courseDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

