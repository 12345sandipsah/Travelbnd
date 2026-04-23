const Listing=require("../models/listing");
const ExpressError=require("../utils/ExpressErr");
const { listingSchema,reviewSchema } = require("../schema.js");
const Review=require("../models/review.js");
module.exports.isLoggedIn=(req,res,next)=>{
  //console.log(req.path,"..",req.originalUrl);
   if(!req.isAuthenticated()){
    //if user is not logged in then save redirectUrl
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","you must be logged in to create listing!");
    return  res.redirect("/login");
  }
  next();
} 

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}


module.exports.isOwner= async (req,res,next)=>{
   let { id } = req.params; 
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing");
    // }
     let listing=await Listing.findById(id);
     if(!listing.owner.equals(res.locals.currUser._id)){
     req.flash("error","You don't have permission to edit!");
      return res.redirect(`/listings/${id}`);

     }
     next();

}



module.exports.isReviewAuthor= async (req,res,next)=>{
   let { id,reviewId } = req.params; 
    // if (!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing");
    // }
     let review=await Review.findById(reviewId);
     if(!review.author.equals(res.locals.currUser._id)){
     req.flash("error","You don't have permission to delete!");
      return res.redirect(`/listings/${id}`);

     }
     next();

}

//this is the validation middleware function for server side validation
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  // console.log(result);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

  

  module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    // console.log(result);
    if (error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };
