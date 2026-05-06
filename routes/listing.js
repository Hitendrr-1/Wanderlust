
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing, isHost } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// Index + Create  
router.route("/")
  .get(wrapAsync(listingController.index))
 .post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing));
  
  //New Route 
  router.get("/new", isLoggedIn, listingController.renderNewForm );

  //  Wishlist
  router.get("/wishlist", isLoggedIn, async (req, res) => {
  let listings = await Listing.find({
    wishlist: req.user._id
  });
  res.render("listings/wishlist.ejs", { listings });
});

// Wishlist toggle
router.post("/:id/wishlist", isLoggedIn, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const userId = req.user._id;

  if (listing.wishlist.includes(userId)) {
    listing.wishlist.pull(userId);
    await listing.save();
    return res.json({ status: "removed" });
  } else {
    listing.wishlist.push(userId);
    await listing.save();
    return res.json({ status: "added" });
  }
});

  // show + update +  delete
  router.route("/:id")
  .get(wrapAsync(listingController.showListing ))
  .put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
   wrapAsync (listingController.updateListing))
  .delete(
  isLoggedIn,
  isOwner,
   wrapAsync (listingController.destroyListing));

// Edit Route 
router.get("/:id/edit",
   isLoggedIn,
   isOwner,  
   wrapAsync (listingController.renderEditForm));


module.exports = router; 