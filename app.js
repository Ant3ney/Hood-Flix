var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOveride = require("method-override");
var expressSanitizer = require("express-sanitizer");

mongoose.connect(process.env.DATABASEURL , {useNewUrlParser: true});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOveride("_method"));
app.use(expressSanitizer());

//route handling
var categoryRouts = require("./routs/categorys.js");
var categoryFilmRouts = require("./routs/categoryFilms.js");
var filmRouts = require("./routs/films.js");
var indexRouts = require("./routs/index.js");
app.use("/all", categoryRouts);
app.use("/all/:id/film", categoryFilmRouts);
app.use("/film", filmRouts);
app.use(indexRouts);

app.listen((process.env.PORT || 3000), process.env.IP, function()
{
	console.log("server has started");
});