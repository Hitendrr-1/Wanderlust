const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

   image: {
    url: {
      type: String,
      default: "https://via.placeholder.com/400"
    },
    filename: String,
  },

 price: {
  type: Number,
  required: true,
  min: 0
 },

 location: {
  type: String,
  required: true
 },

 country: {
  type: String,
  required: true
 },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: { 
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  
 geometry: {
  type: {
    type: String,
    enum: ["Point"],
    required: true
  },

  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  }
},

// geometry: {
//   type: {
//     type: String,
//     enum: ["Point"]
//   },
//   coordinates: {
//     type: [Number]
//   }
//  },

 category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic Cities", "Castles" , "Amazing Pools", "Camping", "Farms", "Arctic", "Boats"],
    default: "Trending"
  }
});

//  geo index
listingSchema.index({ geometry: "2dsphere" });

// delete reviews when listing deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;