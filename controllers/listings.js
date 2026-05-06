const Listing = require("../models/listing");
const axios = require("axios"); 

// Index Route
module.exports.index = async (req, res) => {
  let { search, category } = req.query;

  let query = {};

  // search
  if (search) {
    query.$or = [
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } }
    ];
  }

  // category
  if (category) {
    query.category = category;
  }
  const allListings = await Listing.find(query);
  res.render("listings/index", { allListings, search, category });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};  
 
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  if (!listing){
  req.flash("error", "Listing you requested for does not exist!");
  return res.redirect("/listings");  
}
  res.render("listings/show.ejs", {listing}); 
};

module.exports.createListing = async (req, res) => {
  try {

    //  Image check
    if (!req.file) {
      req.flash("error", "Image upload failed!");
      return res.redirect("/listings/new");
    }

    //  Location API
    const locationQuery = req.body.listing.location.trim();
    const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search",{
    params: {
      // q: `${locationQuery}, India`,
      q: locationQuery,
      format: "json",
      limit: 1
    },
    headers: {
      "User-Agent": "wanderlust-app",
      "Accept-Language": "en"
    }
  }
);

    if (!geoResponse.data || geoResponse.data.length === 0) {
      req.flash("error", "Invalid location!");
      return res.redirect("/listings/new");
    }

   const lat = parseFloat(geoResponse.data[0].lat);
   const lng = parseFloat(geoResponse.data[0].lon);

    //  Image
    let url = req.file.path;
    let filename = req.file.filename;

    //  New listing
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = {
      type: "Point",
      coordinates: [lng, lat]
    };

    await newListing.save();

if (req.user.role !== "host") {
  req.user.role = "host";
  await req.user.save();
}

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);

  } catch (err) {
    console.log("ERROR", err.message); 
    req.flash("error", err.message);
    res.redirect("/listings/new");
  }
};

  module.exports.renderEditForm = async (req, res) => {
   let { id } = req.params;
   const listing = await Listing.findById(id);
   if (!listing){
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
      return res.redirect("/listings");
   }

let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload/", "/upload/h_200,w_250/");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};


  module.exports.updateListing = async (req, res ) => {
     let { id } = req.params;
     let listing = await Listing.findByIdAndUpdate(id, req.body.listing,{
      runValidators: true,
      new: true
     });
     if (typeof req.file !== "undefined"){
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = { url, filename };
     await listing.save(); 
     }
     req.flash("success", "Listing Updated");
     res.redirect(`/listings/${id}`);
   };

   module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings"); 
};
