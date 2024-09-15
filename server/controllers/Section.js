const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");


exports.createSection = async (req,res) => {
    try{
        // data fetch
        const { sectionName, courseId } = req.body;

        // data validation
        if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

        console.log("coming in to the create section ");
        
        // create section
        const newSection = await Section.create({ sectionName });

        // update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent: newSection._id,
                                                }
                                            },
                                            {new:true},
                                        )
                                            .populate({
                                                path:"courseContent",
                                                populate: {
                                                    path: "subSection",
                                                },
                                            })
                                              .exec(); 

        // return response
        res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetails,
		});
    }catch(error){
// Handle errors
		res.status(500).json({
			success: false,
			message: "Unable to create section",
			error: error.message,
		});
    }
}

// update a section
exports.updateSection = async (req,res) =>{
    try{
        // data input 
        const { sectionName, sectionId } = req.body;

        // data validation
        if (!sectionName || !sectionId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

        // update data 
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        // return res
        res.status(200).json({
			success: true,
			message: "Section updated successfully",
			updatedCourse,
		});

    }catch(error){
		res.status(500).json({
			success: false,
			message: "Unable to update section",
			error: error.message,
		});

    }
}

// delete section
exports.deleteSection = async (req,res) =>{
    try{
        // get Id - assuming that we are sending id in params
        const {sectionId} = req.params;

        // use findbyidanddelete
        await Section.findByIdAndDelete(sectionId);

        // return response
        res.status(200).json({
			success: true,
			message: "Section deleted successfully",
			updatedCourse,
		});

    }catch(error){
		res.status(500).json({
			success: false,
			message: "Unable to delete section",
			error: error.message,
		});

    }
}