  // Import necessary modules and models
  const express = require('express');
  const router = express.Router();
  const userModel = require("./users");
  const postModel = require("./post");
  const passport = require('passport');
  const upload = require("./multer");

  const localStrategy = require("passport-local");



  passport.use(new localStrategy(userModel.authenticate()));

  let isLoggedIn = false;

  //payment
  
  const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_bFdGb5XFFZLTmd',
  key_secret: 'eHgg96ilzGU6K79eacrcQFF9'
});

router.post('/pay', async (req, res) => {
  const { amount } = req.body; // Assuming the amount is sent in the request body

  const options = {
    amount: amount * 100, // Amount in paise (e.g., ₹500 * 100)
    currency: 'INR',
    receipt: 'receipt#1',
    payment_capture: 1
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//payment





















  router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) {
        return next(err);
      }
      isLoggedIn = false; // Set isLoggedIn to false upon logout
      res.redirect('/login'); // Redirect to the login page
    });
  });

  router.get('/login', function(req, res, next) {
    // Render the login page with error message if present
    isLoggedIn = false; // Set isLoggedIn to false when accessing the login page
    res.render('login', { error: req.flash('error') });
  });

  // Route middleware to ensure user is authenticated
  function isLoggedInMiddleware(req, res, next) {
    if (isLoggedIn || req.isAuthenticated()) {
      isLoggedIn = true; // Set isLoggedIn to true if user is authenticated
      return next();
    }
    res.redirect("/login"); // If not authenticated, redirect to the login page
  }

  // Define routes
  router.get('/', function(req, res, next) {
    
      res.render('index');
    
  });

  router.get('/signup', function(req, res, next) {
    
    
    res.render('signup');

  });

  router.get('/mp', isLoggedInMiddleware, async function(req, res, next) {
    const user = await userModel.findOne({ username: req.session.passport.user });

    res.render("mp", { user });

  });

  router.get('/tripbooking', isLoggedInMiddleware, async function(req, res, next) {
    const user = await userModel.findOne({ username: req.session.passport.user });

    res.render("/tripbooking", { user });

  });


  router.get('/exploreindiafront', function(req, res, next) {
    
    
    res.render('exploreindiafront');

  });

  router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  }));




  router.post('/fileupload', isLoggedInMiddleware, upload.single("image"), async function(req, res, next) {
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/");
  });



  router.post('/register', function(req, res) {
    const { email, username, fullname } = req.body;
    const userdata = new userModel({ email, username, fullname });
    userModel.register(userdata, req.body.password)
      .then(function() {
        passport.authenticate("local")(req, res, function() {
          res.redirect('/');
        });
      });
  });





  module.exports = router;
