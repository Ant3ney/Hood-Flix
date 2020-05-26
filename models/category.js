//Category Model
var mongoose = require("mongoose");
var categorySchema = new mongoose.Schema(
{
	name: String,
	description: String,
	featured: String,
	featureUrl: String,
	films: 
	[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Film"
		}
	]
});

var Category = mongoose.model("Category", categorySchema);
module.exports = Category;