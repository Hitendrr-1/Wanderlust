const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);

    checkIn.setHours(0,0,0,0);
    checkOut.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    if (checkIn < today) {
     req.flash("error", "Check-in date cannot be in past");
     return res.redirect(`/listings/${id}`);
   }

    if (checkOut <= checkIn) {
      req.flash("error", "Invalid date range");
     return res.redirect(`/listings/${id}`);
   }

    // double booking
    const existingBooking = await Booking.findOne({
      listing: id,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (existingBooking) {
     req.flash("error", "Already booked!");
     return res.redirect(`/listings/${id}`);
    }

    const days = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );

    const totalPrice = days * listing.price;

    const booking = new Booking({
      listing: id,
      user: req.user._id,
      checkIn,
      checkOut,
      totalPrice
    });

    await booking.save();

    req.flash("success", "Booking Confirmed!");
    res.redirect("/bookings");

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};

//  SHOW BOOKINGS
module.exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing");

    res.render("bookings/index.ejs", { bookings });
  } catch (err) {
  console.error(err);
  req.flash("error", "Cannot load bookings");
  res.redirect("/listings");
}
};


// DELETE BOOKING
module.exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking || !booking.user.equals(req.user._id)) {
      req.flash("error", "Not authorized!");
      return res.redirect("/bookings");
    }

    await Booking.findByIdAndDelete(id);

    req.flash("success", "Booking Cancelled");
    res.redirect("/bookings");

  } catch (err) {
    req.flash("error", "Delete failed");
    res.redirect("/bookings");
  }
};

// OWNER BOOKINGS (Host Dashboard)
module.exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "listing",
        match: { owner: req.user._id },
      })
      .populate("user");

    const ownerBookings = bookings.filter(b => b.listing !== null);

    res.render("bookings/owner.ejs", { bookings: ownerBookings });

  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot load owner bookings");
    res.redirect("/listings");
  }
};