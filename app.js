var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOveride = require("method-override");
var expressSanitizer = require("express-sanitizer");
//mongodb+srv://Anthony2361:<password>@cluster0-j2fws.mongodb.net/test?retryWrites=true&w=majority
//mongodb://localhost:27017/AllMovies
mongoose.connect('mongodb+srv://Anthony2361:<password>@cluster0-j2fws.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOveride("_method"));
app.use(expressSanitizer());

//film model setup
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
	}
});

var Film = mongoose.model("Film", filmSchema);
/*Film.remove({}, function(err)
{
	if(err)
	{
		console.log(err);
	}
});*/

//category model setup
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
/*Category.remove({}, function(err)
{
	if(err)
	{
		console.log(err);
	}
});*/

app.get("/", function(req, res)
{
	res.redirect("/all");
});
app.get("/all", function(req, res)
{
	Category.find({}).populate("films").exec(function(err, foundCategory)
	{
		var featuredCategory;
		foundCategory.forEach(function(category)
		{
			if(category.featured == "true")
			{
				featuredCategory = category;
			}
		});
		//console.log("featuredUrl: " + featuredUrl);
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("AllMovies", {categorys: foundCategory, featuredCategory: featuredCategory});
		}
	});
});
//make new category
app.get("/all/new", function(req, res)
{
	res.render("catagories/new")
});
app.post("/all", function(req, res)
{
	var category =
	{
		name: req.body.name,
		description: req.body.description
	};
	Category.create(category, function(err, createdCategory)
	{
		console.log("Gotten here now");
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log(createdCategory.name + " was created");
			res.redirect("/all");
		}
	});
});
//show categorys
app.get("/all/:id", function(req, res)
{
	var id = req.params.id;
	
	
	//console.log("This far id: and update02" + req.params.id);
	Category.findById(id).populate("films").exec(function(err, foundCategory)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			Category.find({}).populate("films").exec(function(err, allCategorys)
			{
			// set featuredCategory to the category model found in data base that has the obj key "feature" set to "true"
			var featuredCategory;
			allCategorys.forEach(function(category)
			{
				if(category.featured == "true")
				{
					featuredCategory = category;
				}
			});
			//get featured function. In future. find out how to create a custum function that calls returns a callback.
			res.render("catagories/show", {category: foundCategory, feature: featuredCategory});
			});
		}
	});
});
//make new film
app.get("/all/:id/film/new", function(req, res)
{
	var id = req.params.id;
	Film.find(function(err, films)
	{
		if(err)
		{
			console.log("err in add new film page");
			console.log(err);
		}
		else
		{
			res.render("catagories/film/new", {category_id: id, films: films});
		}
	});
});
//post film
app.post("/all/:id/film", function(req, res)
{
	var id = req.params.id;
	console.log("Film name = " + req.body.title);
	Category.findById(id).populate("films").exec(function(err, foundCategory)
	{
		if(err)
		{
			console.log(err);
			res.send("Something went wrong");
		}
		else
		{
			var newFilm = assymbleFilm(req);
			Film.create(newFilm, function(err, createdFilm)
			{
				if(err)
				{
					console.log(err);
				}
				else
				{
					createdFilm.save();
					foundCategory.films.push(createdFilm);
					foundCategory.save();
					console.log("The created film's title is " + createdFilm.title);
					res.redirect("/all/" + id);
				}
			});
		}
	});
	
});
//post exzisting film
app.post("/all/:id/exzistingFilm/:filmid", function(req, res)
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

//show film
app.get("/all/:id/film/:filmid", function(req, res)
{
	var id = req.params.id;
	var filmid = req.params.filmid;
	console.log("film-id: " + filmid + " vs " + "5ec15b7199a3390dd2e9d83b");
	Film.findById(filmid, function(err, foundFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			Category.findById(id).populate("films").exec(function(err, foundCategory)
			{
				res.render("catagories/film/show", {film: foundFilm, cetagory: foundCategory});
			});
		}
	});
});
//edit film page
app.get("/all/:id/film/:filmid/edit", function(req, res)
{
	var id = req.params.filmid;
	var category_id = req.params.id
	Film.findById(id, function(err, foundFilm)
	{
		if(err)
		{
			console.log("Something went wrong " + err.message);
		}
		else
		{
			res.render("catagories/film/edit", {film: foundFilm, category_id: category_id});
		}
	});
});
//update category
app.put("/all/:id", function(req,res)
{
	console.log("Featured value: " + req.body.featured);
	//if featured == true then get all categorys and set set featured to false
	var featured = (req.body.featured == "true");
	var featuredString = "false";
	if(featured)
	{
		featuredString = "true";
	}
	else
	{
		featuredString = "false";
	}
	console.log("Featured value: " + featured);
	
		//console.log("-------------here");
		Category.find({}).populate("films").exec(function(err, categorys)
		{
			if(featured)
			{
				categorys.forEach(function(category)
				{
					category.featured = "false";
					category.save();
				});
			}
			//get category id from params
			var id = req.params.id;
			Category.findById(id).populate("films").exec(function(err, foundCategory)
			{
				if(err)
				{
					console.log(err);
				}
				//construct new category model using reqbody
				var updatedCategory = 
				{
					name: req.body.title,
					description: req.body.description,
					featured: featuredString,
					featureUrl: req.body.featuredUrl,
					films: foundCategory.films
				}
				console.log("Category name: " + updatedCategory.name);
				console.log("Category description: " + updatedCategory.description);
				console.log("Category featured: " + updatedCategory.featured);
				console.log("Category featureUrl: " + updatedCategory.featureUrl);/*
				console.log("Category name: " + updatedCategory.films);*/
				
				//get category by id and update using new category object
				//redirect to all
				Category.findByIdAndUpdate(id, updatedCategory, function(err, upCat)
				{
					if(err)
					{
						console.log(err);
					}
					else
					{
						//console.log(upCat.title + " was updated");
						res.redirect("/all");
					}
				});
				
			});
		});
	
	
	
	
	
	
	
});
//film update route
app.put("/all/:id/film/:filmid", function(req,res)
{
	var category_id = req.params.id;
	var film_id = req.params.filmid;
	var changedFilm = assymbleFilm(req);
	Film.findByIdAndUpdate(film_id, changedFilm, function(err, editedFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.redirect("/all/" + category_id);
		}
	});
});
function assymbleFilm(req)
{
	req.body.description = req.sanitize(req.body.description);
	var assembledFilm = 
	{
		title: req.body.title,
		url: req.body.url,
		description: req.body.description,
		embed: req.body.embed,
		credits: 
		{
			director: req.body.director,
			cinematography: req.body.cinematography,
			editor: req.body.editor,
			writer: req.body.writer,
			casting: req.body.casting,
			staring: req.body.staring,
			guestStarring: req.body.guestStarring
		}
	};
	return assembledFilm;
}
//Delete film
app.delete("/all/:id/film/:filmid", function(req,res)
{
	var category_id = req.params.id;
	var film_id = req.params.filmid;
	console.log("In delete route");
	Film.findByIdAndRemove(film_id, function(err, deleatedFilm)
		{
			if(err)
			{
				console.log(err.message);
			}
			else
			{
				console.log("In delete rout again. removed: " + deleatedFilm);
				res.redirect("/all/" + category_id);
			}
		});
	
});
//Fremove film from catigory
app.delete("/all/:id/categoryFilm/:filmid", function(req,res)
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
//edit catagory
app.get("/all/:id/edit", function(req, res)
{
	var id = req.params.id;
	Category.findById(id, function(err, foundCategory)
	{
		if(err)
		{
			console.log("err");
		}
		else
		{
			var featured = false;
			if(foundCategory.featured == "true")
			{
				var featured = true;
			}
			res.render("catagories/edit", {category: foundCategory, featured: featured});
		}
	});
});
//Delete category
app.delete("/all/:id", function(req, res)
{
	//res.send("Delete page");
	var id = req.params.id;
	//find category by id
	//delete category
	Category.findByIdAndRemove(req.params.id, function(err, deleatedCategory)
	{
		console.log("id: " + id);
		console.log(deleatedCategory.name);
		if(err)
		{
			console.log("Error in deleated category");
			console.log(err);
		}
		else
		{
			res.redirect("/all");
		}
	});
});
//show films
app.get("/film", function(req, res)
{
	Film.find({}, function(err, foundFilms)
	{
		res.render("film/film", {films: foundFilms});
	});
});
//Standalone addnew film
app.get("/film/new", function(req, res)
{
	res.render("film/new");
});
//standalone post new film
app.post("/film", function(req, res)
{
	//assembel film object
	//create new film with onj
	//redirect to all films
	var assembledFilm = assymbleFilm(req);
	Film.create(assembledFilm, function(err, createdFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.redirect("/film");
		}
	});
});
//delete film without category
app.delete("/all/film/:filmid", function(req,res)
{
	var film_id = req.params.filmid;
	console.log("In delete route");
	Film.findByIdAndRemove(film_id, function(err, deleatedFilm)
		{
			if(err)
			{
				console.log(err.message);
			}
			else
			{
				console.log("In delete rout again. removed: " + deleatedFilm);
				res.redirect("/all");
			}
		});
	
});

//view film alown
app.get("/film/:filmid", function(req, res)
{
	//get film by filmid
	//render film show
	//pass in film 
	var film_id = req.params.filmid;
	Film.findById(film_id, function(err, foundFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("film/show", {film: foundFilm});
		}
	});
});
//edit film standalone
app.get("/film/:filmid/edit", function(req, res)
{
	//get film filmid
	//get film by filmid
	//render stanalone film edit
	//send int found film
	var film_id = req.params.filmid;
	Film.findById(film_id, function(err, foundFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("film/edit", {film: foundFilm});
		}
	});
});
//Standalone update film
app.put("/film/:filmid", function(req, res)
{
	//get filmid
	//assemple film object model
	//find film by id and update using film object model
	//redirect to view all films
	var film_id = req.params.filmid;
	var updatedFilm = assymbleFilm(req);
	Film.findByIdAndUpdate(film_id, updatedFilm, function(err, upUpdatedfilm)
	{
		if(err)
		{
			console.log(err)
		}
		else
		{
			res.redirect("/film");
		}
	});
});
//standalone delete film
app.delete("/film/:filmid", function(req, res)
{
	//find film filmid
	//delete film by filmid
	//redirect back to films
	var film_id = req.params.filmid;
	Film.findByIdAndRemove(film_id, function(err, deletedFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.redirect("/film");
		}
	});
});

app.get("/film/ran", function(req, res)
{
	console.log("In standalone");
	res.send("in standalone add new film page");
});

app.listen(process.env.PORT, process.env.IP, function()
{
	console.log("Server has started");
});