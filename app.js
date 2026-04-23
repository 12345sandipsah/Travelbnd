const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErr.js");
const { listingSchema } = require("./schema.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(mongo_url);
}

main()
  .then(() => {
    console.log("Connected TO DB");
  })
  .catch((err) => {
    console.log(err);
  });

//root route
app.get("/", (req, res) => {
  res.send("Server running without error");
});

//this is the validation middleware function for server side validation
const validateListing = (req, res, next) => {
  let {error}= listingSchema.validate(req.body);
  // console.log(result);
  if (error) {
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
//index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

//create route(new gives form)
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//create route(submit  form stores data to database)
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    //first way:let {title,description,image,price,location,country}=req.body

    //this is simply checking whether the comming listing is  an object or not if not throw err
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }

    let listing = req.body.listing;
    const newListing = new Listing(listing);

    //this is the first way to validate the serverside validation
    // if(!newListing.title){
    //      throw new ExpressError(400,"title is missing");
    // }
    // if(!newListing.description){
    //      throw new ExpressError(400,"description is missing");
    // }
    // if(!newListing.country){
    //      throw new ExpressError(400,"country name is missing");
    // }
    // if(!newListing.location){
    //      throw new ExpressError(400,"location is missing");
    // }
    // if(!newListing.price){
    //      throw new ExpressError(400,"price is missing");
    // }
    await newListing.save();
    res.redirect("/listings");
  }),
);

//show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
  }),
);

//edit route (get request)
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }),
);

//edit rout(put request)
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing");
    // }
    const listing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    res.redirect(`/listings/${id}`);
  }),
);

//delete route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
  }),
);

// app.get("/testListing", async (req, res) => {

//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         image: "",
//         price: 1200,
//         location: "Calangute Goa",
//         country: "India"
//     });

//     await sampleListing.save();

//     res.send("Successful testing");
// });
// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

let port = 4040;

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
