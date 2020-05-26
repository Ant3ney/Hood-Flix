//Misc/Index Routs
var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Film = require("../models/film");

router.get("/", function(req, res)
{
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

router.get("/film/ran", function(req, res)
{
	console.log("In standalone");
	res.send("in standalone add new film page");
});

module.exports = router;