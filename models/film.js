//Film Model

var mongoose = require("mongoose");
var filmSchema = new mongoose.Schema(
{
	title: String,
	url: String,
	description: String,
	embed: String,
	credits:
	{
		director: String,
		cinematography: String,
		editor: String,
		writer: String,
		casting: String,
		staring: String,
		guestStarring: String
	},
	comments: 
	[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	displayComment:
	{
		comment01: String,
		comment02: String
	}
});

var Film = mongoose.model("Film", filmSchema);

module.exports = Film;