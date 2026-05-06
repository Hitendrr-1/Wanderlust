const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const Listing = require("../models/listing.js");

const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../controllers/users.js");

// SIGNUP
router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signupForm));

// LOGIN
router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// LOGOUT
router.get("/logout", userController.logout);

// PROFILE
router.get("/profile", isLoggedIn, async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });

  res.render("users/profile.ejs", {
    currUser: req.user,
    listings
  });
});

// BECOME HOST 
router.get("/become-host", isLoggedIn, (req, res) => {

  // Already host check
  if (req.user.role === "host") {
    req.flash("error", "You are already a host");
    return res.redirect("/listings");
  }
  res.redirect("/listings/new");
});


module.exports = router;  