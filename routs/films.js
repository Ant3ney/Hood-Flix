//SandLone Film Route
var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Film = require("../models/film");


//show films
router.get("/", function(req, res)
{
	Film.find({}, function(err, foundFilmsOrgi)
	{
		//handle films description
		var foundFilms = foundFilmsOrgi;
		console.log("foundFilms: " + foundFilms);
		foundFilms.forEach(function(film)
		{
			if(film.description && film.description.length > 90)
			{
				film.description = (film.description.substring(0, 90) + "...");
			}
		});
		
		res.render("film/film", {films: foundFilms});
	});
});
//Standalone addnew film
router.get("/new", hasLv1Clear, function(req, res)
{
	res.render("film/new");
});
//standalone post new film
router.post("/", hasLv1Clear, function(req, res)
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

function assymbleFilm(req, foundFilm)
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
	
	if(foundFilm && foundFilm.displayComments && foundFilm.displayComments.comment01)
	{
		assembledFilm.displayComments.comment01 = foundFilm.displayComments.comment01;
	}
	if(foundFilm && foundFilm.displayComments && foundFilm.displayComments.comment02)
	{
		assembledFilm.displayComments.comment02 = foundFilm.displayComments.comment02;
	}
	
	return assembledFilm;
};
//view film alown
router.get("/:filmid", function(req, res)
{
	//get film by filmid
	//render film show
	//pass in film 
	var film_id = req.params.filmid;
	Film.findById(film_id).populate("comments").exec(function(err, foundFilm)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
	Category.find({}).populate("films").exec(function(err, foundCategory)
	{
		var featuredCategory;
		var foundFeatured = false;
		foundCategory.forEach(function(category)
		{
			if(category.featured == "true")
			{
				featuredCategory = category;
				foundFeatured = true;
			}
		});
		
		res.render("film/show", {film: foundFilm, feature: featuredCategory});
	});
			
		}
	});
});
//edit film standalone
router.get("/:filmid/edit", hasLv1Clear, function(req, res)
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
router.put("/:filmid", hasLv1Clear, function(req, res)
{
	//get filmid
	//assemple film object model
	//find film by id and update using film object model
	//redirect to view all films
	var film_id = req.params.filmid;
	Film.findById(film_id, function(err, fFilm)
	{
		var updatedFilm = assymbleFilm(req, fFilm);
		if(err)
		{
			console.log(err);
		}
		else
		{
			Film.findByIdAndUpdate(film_id, updatedFilm).populate("comments").exec(function(err, foundFilm)
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
		}
	});
});
//standalone delete film
router.delete("/:filmid", hasLv1Clear, function(req, res)
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
//delete film without category
router.delete("/:filmid", hasLv1Clear, function(req,res)
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

//middleware
function hasLv1Clear(req, res, next)
{
	if((req.user && (req.user.admin == "true" || req.user.admin == "owner")))
	{
		return next();
	}
	res.redirect("/film");
}

function hasLv2Clear(req, res, next)
{
	if(req.user && req.user.admin == "owner")
	{
		return next();
	}
	res.redirect("/all");
}

module.exports = router;