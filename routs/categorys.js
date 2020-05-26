var express = require("express");
var router = express.Router();
var Category = require("../models/category");

router.get("/testroute", function(req, res)
{
	res.send("This is the testroute route");
});

router.get("/", function(req, res)
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
router.get("/new", function(req, res)
{
	res.render("catagories/new")
});
router.post("/", function(req, res)
{
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
	var category =
	{
		name: req.body.name,
		description: req.body.description,
		featured: featuredString,
		featureUrl: req.body.featuredUrl
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
router.get("/:id", function(req, res)
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

//update category
router.put("/:id", function(req,res)
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
//edit catagory
router.get("/:id/edit", function(req, res)
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
router.delete("/:id", function(req, res)
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

module.exports = router;