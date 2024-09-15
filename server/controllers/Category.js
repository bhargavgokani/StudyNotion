const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
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
        const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);

        // return response
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});


    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
          });    
    }
}

// getAllcategories handler function 

exports.showAllCategories = async (req, res) => {
	try {
        console.log("INSIDE SHOW ALL CATEGORIES");

		const allCategorys = await Category.find({},{name:true,description:true});

		res.status(200).json({
			success: true,
            message:"All Category returned successfully",
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// categoryPage details
exports.categoryPageDetails = async (req, res) => {
    try{
        // get category id
        const { categoryId } = req.body;

        // get courses for specified category id
        const selectedCategory = await Category.findById(categoryId)  
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()

        // validation
        if (!selectedCategory) {
            console.log("Category not found.")
            return res
              .status(404)
              .json({ success: false, message: "Category not found" })
          }
    
        // get courses for different categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
          })
          let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
          )
            .populate({
              path: "courses",
              match: { status: "Published" },
            })
            .exec()
    
        // get top selling courses
        const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)


        // return res
        res.status(200).json({
            success: true,
            data: {
              selectedCategory,
              differentCategory,
              mostSellingCourses,
            },
          })
    

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
          })    
        }
}