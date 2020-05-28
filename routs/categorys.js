//Category Route
var express = require("express");
var router = express.Router();
var Category = require("../models/category");

//show all categorys (render allMovies.ejs)
router.get("/", function(req, res)
{
	console.log("currently loged in user: " + req.user);
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

//get new category page
router.get("/new", hasLv1Clear, function(req, res)
{
	res.render("catagories/new")
});

//post new category
router.post("/", hasLv1Clear, function(req, res)
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
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.redirect("/all");
		}
	});
});

//show categorys
router.get("/:id", function(req, res)
{
	var id = req.params.id;

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
router.put("/:id", hasLv1Clear, function(req,res)
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
				//get category by id and update using new category object
				Category.findByIdAndUpdate(id, updatedCategory, function(err, upCat)
				{
					if(err)
					{
						console.log(err);
					}
					else
					{
						//redirect to all
						res.redirect("/all");
					}
				});
				
			});
		});
});

//edit catagory
router.get("/:id/edit", hasLv1Clear, function(req, res)
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
router.delete("/:id", hasLv1Clear, function(req, res)
{
	var id = req.params.id;
	//find category by id
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