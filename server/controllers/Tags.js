const Tag = require("../models/tags");

// create Tag ka handler func.

exports.createTag = async (req,res) =>{
    try{
        // fetch data from body 
        const {name,description} = req.body;
        // validation
        if(!name || !description){
            return res.status(401).json({
                success: false,
                message: `All fields are require`,
              });        
        }
        // create entry in db
        const tagDetails = await Tag.create({
            name:name,
            description:description
        });
        console.log(tagDetails);

        // return response 
        return res.status(200).json({
            success:true,
            message:"Tag created successfully"
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          });    
    }
}

// getAlltags handler function 
exports.showAlltags = async (req,res) => {
    try{
        const allTags = await Tag.find({},{name:true,description:true});
        return res.status(200).json({
            success:true,
            message:"All Tags returned successfully",
            allTags
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          });    
    }
}