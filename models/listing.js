const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157",
        set: (v) => {
            if (typeof v !== "string") return v;
            return v.trim() === ""
                ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157"
                : v;
        }
    },

    price: {
        type: Number
    },

    location: {
        type: String
    },

    country: {
        type: String
    }
});


//creating model
const Listing = mongoose.model("Listing", listingSchema);

//exporting model schema so that this model can be used in outside
module.exports = Listing;