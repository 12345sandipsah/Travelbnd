const mongoose = require("mongoose");
const Review = require("./review");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  image: {
    // type: String,
    // default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157",
    // set: (v) => {
    //     if (typeof v !== "string") return v;
    //     return v.trim() === ""
    //         ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157"
    //         : v;
    // }
    url: String,
    filename: String,
  },

  price: {
    type: Number,
  },

  location: {
    type: String,
  },

  country: {
    type: String,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: { 
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

//creating model
const Listing = mongoose.model("Listing", listingSchema);

//exporting model schema so that this model can be used in outside
module.exports = Listing;
