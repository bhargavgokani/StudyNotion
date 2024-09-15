const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const uploadImageToCloudinary = require("../utils/imageUploader");

// create sub section
exports.createSubSection = async (req,res) => {
    try{
        // fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body

        console.log("coming in subsection");
        
        // fetch video/file
        const video = req.files.video;

        if(!video){
          console.log("add video...",video);
          
        }

        // data validation
        if (!sectionId || !title || !timeDuration || !description) {
            return res
              .status(404)
              .json({ success: false, message: "All Fields are Required" });
          }

        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        // create subSection
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
          });

        // update the section with subSection objectId
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
          ).populate("subSection");

        // return res
        res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedSection,
		});

    }catch(error){
        res.status(500).json({
			success: false,
			message: "Unable to create subSection",
			error: error.message,
		});
    }
}

// update subSection
exports.updateSubSection = async (req, res) => {
    try{
        const { sectionId, subSectionId, title, timeDuration, description } = req.body;

        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
              success: false,
              message: "SubSection not found",
            });
          }

          if (title !== undefined) {
            subSection.title = title;
          }
          if (timeDuration !== undefined) {
            subSection.timeDuration = timeDuration;
          }
          if (description !== undefined) {
            subSection.description = description;
          }

          if (req.files && req.files.videoFile !== undefined) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(
              video,
              process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
          }
      
          await subSection.save();

          const updatedSection = await Section.findById(sectionId).populate("subSection");

          console.log("updated section", updatedSection);

        //   return response
          return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
          });

    }catch(error){
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the section",
        });
    }
}

// delete subSection
exports.deleteSubSection = async (req, res) => {
    try{
        const { subSectionId, sectionId } = req.body;
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
              $pull: {
                subSection: subSectionId,
              },
            }
          )

        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId });

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
              });
            }

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
          })    

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
          });      
    }
}