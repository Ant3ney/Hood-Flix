//coment model
var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Film = require("../models/film");
var mongoose = require("mongoose");
var expressSanitizer = require("express-sanitizer");
var passport = require("passport");
var localStrategy = require("passport-local");

commentSchema = 
{
	id: 
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	username: String,
	comment: String
}
var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;