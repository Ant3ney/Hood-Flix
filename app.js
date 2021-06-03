var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOveride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");
var Film = require("./models/film");
var Comment = require("./models/comment");
require('dotenv').config();

mongoose.connect(process.env.DATABASEURL , {useNewUrlParser: true});

//app setting and getting
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOveride("_method"));
app.use(expressSanitizer());

//passport configuration
app.use(require("express-session")(
{
	secret: "unknown",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next)
{
	res.locals.currentUser = req.user;
	next();
});

//route handling
var categoryRouts = require("./routs/categorys.js");
var categoryFilmRouts = require("./routs/categoryFilms.js");
var filmRouts = require("./routs/films.js");
var indexRouts = require("./routs/index.js");
app.use("/all", categoryRouts);
app.use("/all/:id/film", categoryFilmRouts);
app.use("/film", filmRouts);
app.use(indexRouts);

//show comments on film
app.get("/film/:filmid/comments", function(req, res)
{
	var id = req.params.filmid;
	Film.findById(id).populate("comments").exec(function(err, film)
	{
		console.log("Film.comments: " + film);
		res.render("film/comment/comments", {film: film});
	});
});

//show new comment form
app.get("/film/:filmid/comments/new", function(req, res)
{
	var film_id = req.params.filmid;
	Film.findById(film_id, function(err, film)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("film/comment/new", {film: film});
		}
	});
});

//post mew comment
app.post("/film/:filmid/comments", function(req, res)
{
	//create comment obj
	var comment = 
	{
		id: req.user,//might not work. check udemy video to clarify or if problems start
		username: req.user.username,
		comment: req.body.comment
	}
	//get filmid
	var film_id = req.params.filmid;
	Film.findById(film_id).populate("comments").exec(function(err, film)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			//create comment model obj
			Comment.create(comment, function(err, newComment)
			{
				console.log("newComment: " + newComment);
				//add new comment to film comments aray
				film.comments.push(newComment);
				
				//add display comments
				if(film.comments[0])
				{
					film.displayComment.comment01 = film.comments[0];
				}
				if(film.comments[1])
				{
					film.displayComment.comment02 = film.comments[1];
				}
				
				film.save();
				
				console.log("---------Film after comments: \n" + film);
				res.redirect("/film/" + film_id + "/comments");
			});
		}
	});
});

app.listen((process.env.PORT || 3000), process.env.IP, function()
{
	console.log(`server has started on port: ${process.env.PORT}`);
});

//comment for updating git hub