var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOveride = require("method-override");
var expressSanitizer = require("express-sanitizer");

//mongodb+srv://Anthony2361:<password>@cluster0-j2fws.mongodb.net/test?retryWrites=true&w=majority
//mongodb://localhost:27017/AllMovies
mongoose.connect('mongodb+srv://Anthony2361:7*h!WUUebHAu3vz@cluster0-j2fws.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

//temporary model handling
var Category = require("./models/category");
var Film = require("./models/film");

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

//process.env.PORT, process.env.IP
app.listen((process.env.PORT || 3000), process.env.IP, function()
{
	var port = process.env.PORT || 3000;
	console.log("server has started");
});