//SandLone Film Route
var express = require("express");
var router = express.Router();
var Category = require("../models/category");
var Film = require("../models/film");

//show films
router.get("/", function(req, res)
{
	Film.find({}, function(err, foundFilms)
	{
		res.render("film/film", {films: foundFilms});
	});
});
//Standalone addnew film
router.get("/new", function(req, res)
{
	res.render("film/new");
});
//standalone post new film
router.post("/", function(req, res)
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
};
//view film alown
router.get("/:filmid", function(req, res)
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
router.get("/:filmid/edit", function(req, res)
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
router.put("/:filmid", function(req, res)
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
router.delete("/:filmid", function(req, res)
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
router.delete("/:filmid", function(req,res)
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

module.exports = router;