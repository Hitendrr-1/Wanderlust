const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const bookingsController = require("../controllers/bookings");
const Booking = require("../models/booking");

// OWNER BOOKINGS (Host Dashboard)
router.get("/owner", isLoggedIn, bookingsController.getOwnerBookings);

// CREATE
router.post("/:id", isLoggedIn, bookingsController.createBooking);

// SHOW
router.get("/", isLoggedIn, bookingsController.getUserBookings);

// DELETE
router.delete("/:id", isLoggedIn, bookingsController.deleteBooking);

module.exports = router;