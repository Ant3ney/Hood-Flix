//User Model
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema(
{
	username: String,
	password: String,
	admin: String
});

UserSchema.plugin(passportLocalMongoose);

User = mongoose.model("User", UserSchema);

module.exports = User