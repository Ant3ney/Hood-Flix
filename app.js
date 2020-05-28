var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOveride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");

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

//tempory hard code making me server owner
User.find({}, function(err, user)
{
	user[0].admin = "owner";
	user[0].save();
});

//show users page
app.get("/users", hasLv2Clear, function(req, res)
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
app.post("/users/:id/makeAdmin", hasLv2Clear, function(req, res)
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
app.get("/register", function(req, res)
{
	res.render("register");
});
//handle sign up logic
app.post("/register", function(req, res)
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
app.get("/login", function(req, res)
{
	res.render("login");
});
//handling login logic
app.post("/login", passport.authenticate("local", 
{
	successRedirect: "/all", 
	falureRedirect:	"/login"
	
}), function(req, res)
{
	res.send("Login logic page");
});

//logout route
app.get("/logout", isLoggedIn, function(req, res)
{
	console.log("NEWS: --- Loged-in ---");
	req.logout();
	res.redirect("/all");
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

app.listen((process.env.PORT || 3000), process.env.IP, function()
{
	console.log("server has started");
});