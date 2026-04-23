if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");

const ExpressError = require("./utils/ExpressErr.js");
const listingsRoute = require("./routes/listing.route.js");
const reviewsRoute = require("./routes/review.route.js");
const usersRoute = require("./routes/user.route.js");

const app = express();
const session = require("express-session");
const MongoStore = require('connect-mongo').default;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// let mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
let dbUrl=process.env.ATLASDB_URL; 

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Connected TO DB");
  })
  .catch((err) => {
    console.log(err);
  });

const store=MongoStore.create({
  mongoUrl:dbUrl,
 
  touchAfter: 24*60*60,
})


const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, 
    
    
  },
};


store.on("error",(err)=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
})


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //here it is an array not just variables
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser",(async(req,res)=>{
//   let fakeUser=new User({
//     email:"teacher@gmail.com",
//     username:"delta-teacher"
//   });
//   let registeredUser=await User.register(fakeUser,"Passwords123");
//   res.send(registeredUser);
// }))

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", usersRoute);

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
 
let port = process.env.PORT || 4040;

app.listen(port, () => {
  console.log(`Server is listening at ${port}`);
});
