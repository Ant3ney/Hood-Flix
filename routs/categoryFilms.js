//Category Film model
var express = require("express");
var router = express.Router({mergeParams: true});
var Category = require("../models/category");
var Film = require("../models/film");

router.get("/testroute", function(req, res)
{
	res.send("This is the test film category route " + req.params.id);
});
//make new film
router.get("/new", hasLv1Clear, function(req, res)
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
router.post("/", hasLv1Clear, function(req, res)
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
//show film
router.get("/:filmid", function(req, res)
{
	var id = req.params.id;
	var filmid = req.params.filmid;
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
				console.log("category_id: " + req.params.id + " vs " + "5eca68ea896b4c0017f143dc");
				res.render("catagories/film/show", {film: foundFilm, cetagory: foundCategory});
			});
		}
	});
});
//edit film page
router.get("/:filmid/edit", hasLv1Clear, function(req, res)
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

//move to middeware file in future
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
	
	if(foundFilm.displayComments && foundFilm.displayComments.comment01)
	{
		assembledFilm.displayComments.comment01 = foundFilm.displayComments.comment01;
	}
	if(foundFilm.displayComments && foundFilm.displayComments.comment02)
	{
		assembledFilm.displayComments.comment02 = foundFilm.displayComments.comment02;
	}
	
	return assembledFilm;
}
//film update route
router.put("/:filmid", hasLv1Clear, function(req,res)
{
	var category_id = req.params.id;
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
					res.redirect("/all/" + category_id);
				}
					});
				}
	});
});
//Delete film
router.delete("/:filmid", hasLv1Clear, function(req,res)
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

//middleware
function hasLv1Clear(req, res, next)
{
	if((req.user && (req.user.admin == "true" || req.user.admin == "owner")))
	{
		return next();
	}
	res.redirect("/all");
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