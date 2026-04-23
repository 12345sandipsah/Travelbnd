const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const {
  isLoggedIn,
  isOwner,
  validateListing,
} = require("../middlewares/middleware.js");
const listingController = require("../controllers/listing.controller.js");
const multer = require("multer");
const { storage } = require("../config/cloudConfig.js");
// const upload = multer({ dest: 'uploads/' })//this is for local storing images and video next one is for cloud
const upload = multer({ storage });

//create route(new gives form)
router.get("/new", isLoggedIn, listingController.renderNewForm);

//edit route (get request)
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);
//router.route
router
  .route("/")
  .get(wrapAsync(listingController.indexController))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );
 

router
  .route("/:id")
  .get(wrapAsync(listingController.renderShowPage))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
