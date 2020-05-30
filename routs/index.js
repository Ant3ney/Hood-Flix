//Misc/Index Routs
var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Film = require("../models/film");
var expressSanitizer = require("express-sanitizer");
var passport = require("passport");
var localStrategy = require("passport-local");

router.get("/", function(req, res)
{
	res.redirect("/all");
});

//show users page
router.get("/users", hasLv2Clear, function(req, res)
{
	User.find({}, function(err, user)
	{
		if(err)
		{
			console.log(user);
		}
		else
		{
			res.render("users/users", {users: user});
		}
	});
});
//make Admin routs
router.post("/users/:id/makeAdmin", hasLv2Clear, function(req, res)
{
	var id = req.params.id;
	User.findById(id, function(err, user)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			if(user.admin == "true")
			{
				user.admin = "false";
			}
			else
			{
				user.admin = "true";
			}
			user.save();
			res.redirect("/users");
		}
	});
});

//Authentication Route
//show register form
router.get("/register", function(req, res)
{
	res.render("register");
});
//handle sign up logic
router.post("/register", function(req, res)
{
	//constructing new user object
	var newUser = new User({username: req.body.username, admin: "false"}); 
	
	User.register(newUser, req.body.password, function(err, user)
	{
		if(err)
		{
			console.log(err);
			return res.render("register");
		}
		else
		{
			console.log("createdUser: " + user);
			passport.authenticate("local")(req, res, function()
			{
				res.redirect("/all");
			});
		}
	});
});
//show login form
router.get("/login", function(req, res)
{
	res.render("login");
});
//handling login logic
router.post("/login", passport.authenticate("local", 
{
	successRedirect: "/all", 
	falureRedirect:	"/login"
	
}), function(req, res)
{
	res.send("Login logic page");
});

//logout route
router.get("/logout", isLoggedIn, function(req, res)
{
	console.log("NEWS: --- Loged-in ---");
	req.logout();
	res.redirect("/all");
});

//post exzisting film
router.post("/all/:id/exzistingFilm/:filmid", function(req, res)
{
	var id = req.params.id;
	var film_id = req.params.filmid;
	Category.findById(id).populate("films").exec(function(err, foundCategory)
	{
		if(err)
		{
			console.log(err);
			res.send("Something went wrong");
		}
		else
		{	
			Film.findById(film_id, function(err, foundFilm)
			{
				foundCategory.films.push(foundFilm);
				foundCategory.save();
				console.log("The added film's title is " + foundFilm.title);
				res.redirect("/all/" + id);
			});
				
		}
	});
});

//Fremove film from catigory
router.delete("/all/:id/categoryFilm/:filmid", function(req,res)
{
	var category_id = req.params.id;
	var film_id = req.params.filmid;
	
	//Remove the film with film_id from category with category_id
	Category.findById(category_id).populate("films").exec(function(err, foundCategory)
	{
		foundCategory.films.forEach(function(film, i)
		{
			if(film._id == film_id)
			{
				//console.log("********* " + film._id + " == " + film_id);
				foundCategory.films.splice(i, 1);
				foundCategory.save();
			}
			else
			{
				//console.log(film._id + " != " + film_id);
			}
		});
		res.redirect("/all/" + category_id);
	});
});

//middleware
function isLoggedIn(req, res, next)
{
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/login");
}
function hasLv2Clear(req, res, next)
{
	if(req.user && req.user.admin == "owner")
	{
		return next();
	}
	res.redirect("/all");
}

router.get("/film/ran", function(req, res)
{
	console.log("In standalone");
	res.send("in standalone add new film page");
});

module.exports = router;