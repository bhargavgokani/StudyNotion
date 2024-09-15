const mongoose = require("mongoose");

// AA FILEKOI KAAM NI NATHI


const tagsSchema = new mongoose.Schema({
	name: { 
        type: String,
        require: true
     },
	description: { type: String },
	course: { 
		type: mongoose.Schema.Types.ObjectId,
        ref : "Course", 
     },
});

module.exports = mongoose.model("Tag", tagsSchema);