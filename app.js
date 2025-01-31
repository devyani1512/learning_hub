const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require("cors");
app.use(cors());
const cookieParser = require('cookie-parser');
const Admin = require('./models/admin')
const User = require('./models/user'); 
const Card= require('./models/cards')// Define the user model
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
const { body, validationResult } = require('express-validator');
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true,
}));


// Handle User Registration
// app.post('/register', [
//   body('email').isEmail().withMessage('Invalid email format'),
//   body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
//     .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
//     .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
//     .matches(/[0-9]/).withMessage('Password must contain a number')
//     .matches(/[\W]/).withMessage('Password must contain a special character'),
//   body('secret').notEmpty().withMessage('Secret is required')
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.render('register', { errors: errors.array() });
//   }

//   const { email, password, secret } = req.body;
  
//   // Check if the email exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return res.render('register', { errors: [{ msg: 'Email already registered' }] });
//   }

//   // Hash the password and secret
//   const passwordHash = await bcrypt.hash(password, 10);
//   const secretHash = await bcrypt.hash(secret, 10);

//   const newUser = new User({
//     email,
//     password: passwordHash,
//     secret: secretHash,
//   });

//   await newUser.save();
//   res.redirect('/login');
// });

// Handle User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
 const admin = await Admin.findOne({ email });
  if (!(user || admin)) {
    return res.render('login', { error: 'Invalid credentials' });
  }
    if(admin){
     const matchadmin = await bcrypt.compare(password, admin.password);
     if(matchadmin){
      res.render('admin_page');
    } 
    else{
      res.send("invalid crendentials");
    }
    }
    else{
  const matchuser = await bcrypt.compare(password, user.password);
  if (matchuser) {
    req.session.userEmail = user.email;
    return res.redirect('/');
  }
  else {
    return res.render('login', { error: 'Invalid credentials' });
  }
}
});

// Handle Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Display the index (home) page
app.get('/', (req, res) => {
    const userEmail = req.session.userEmail || null; // or get it from your user model/auth logic
    res.render('index', { userEmail: userEmail });
});


// Display Login page
// Route for handling login form submission
// Route for rendering login page
app.get('/login', (req, res) => {
    // You can pass an error message if there is an error (e.g., failed login)
    const error = req.session.error || null;  // or set it based on some logic
    res.render('login', { error: error });

    // Clear the error after passing it to avoid showing it again in the next request
    req.session.error = null;
});
// POST route for login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Assume you have some logic to validate email and password
    const isValid = checkLogin(email, password); // Replace with your actual login logic

    if (!isValid) {
        // Pass the error message back to the view
        req.flash('error', 'Invalid email or password');  // Using flash
        return res.redirect('/login');
    }

    // If login is successful, redirect to the dashboard or homepage
    req.session.userEmail = email;
    res.redirect('/');
});



// Display Registration page
// GET route for registration page
// GET route for the registration page
app.get('/register', (req, res) => {
    // Render register page with an empty errors array initially
    res.render('register', { errors: [] });
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

// POST route for registration with OTP
app.post('/register', [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('secret').notEmpty().withMessage('Please enter a secret'), // Add any other validation you need
], async (req, res) => {
  const errors = validationResult(req);  // Get validation errors
  
  if (!errors.isEmpty()) {
    return res.render('register', { errors: errors.array() });
  }

  const { email, password, secret } = req.body; // Get data from form

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { errors: [{ msg: 'Email already registered' }] });
    }

    // Hash the password and secret
    const passwordHash = await bcrypt.hash(password, 10);
    const secretHash = await bcrypt.hash(secret, 10);

    // Generate OTP
    const otp = generateOtp();

    // Save user to the database without OTP field (otp will be updated later after sending email)
    const newUser = await User.create({
      email,
      password: passwordHash,
      secret: secretHash,
      otp: otp,  // Temporary store OTP here
    });

    // await newUser.save();

    console.log("Generated OTP:", otp); // Optional: For debugging

    // Configure the transporter for nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server
      port: 587, // 587 for TLS, 465 for SSL
      secure: false, // true for SSL
      auth: {
        user: "devyani04sh@gmail.com", // Sender email
        pass: "qqqy oeqq jdbr yyql", // App password (not real email password)
      },
    });

    // Email options
    const mailOptions = {
      from: "devyani04sh@gmail.com", // Sender email
      to: email, // Recipient email
      subject: "Your OTP Code",
      text: `Hello, your OTP code is: ${otp}`, // Message with the OTP
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).send("Error sending OTP email");
      } else {
        console.log("OTP sent:", info.response);
        res.redirect('/verify-otp?email=' + encodeURIComponent(email)); // Pass email for verification
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error during registration");
  }
});



// Route for OTP verification
// Route for OTP verification
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;  

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("verify-otp", { email, error: "User not found" });
    }

    if (user.otp && user.otp.toString() === otp) {
      user.otpVerified = true;
      user.otp = null; // Clear OTP after verification
      await user.save();
      res.send("OTP verified successfully! You can now log in.");
    } else {
      res.render("verify-otp", { email, error: "Invalid OTP. Try again." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error verifying OTP");
  }
});


// Route for OTP verification page (GET request)
app.get('/verify-otp', (req, res) => {
  res.render('verify-otp', { email: req.query.email, error: null }); // Pass email to view
});

app.get('/toknow',async (req,res)=>{
   const users = await User.find();
   res.json(users);
});
app.get("/todelete", async (req, res) => {
    try {
      // Specify the email to delete
      const emailToDelete = "23103252@mail.jiit.ac.in";
  
      // Find and delete the user by email
      const deletedUser = await User.findOneAndDelete({ email: emailToDelete });
  
      if (deletedUser) {
        res.send("User deleted successfully");
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Internal server error");
    }
  });
  app.get("/add_admin", async(req,res)=>{
    const email = "devyanisharmaa1@gmail.com";
    const password="beagle";
    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      email,
      password: passwordHash,
    });
    res.send("admin created");
  });
  app.get("/getadmins", async(req,res)=>{
    const admins = await Admin.find();
   res.json(admins);
  });
  app.get("/deleteadmin", async (req, res) => {
    try {
      // Specify the email to delete
      const emailToDelete = "devyanisharmaa1@gmail.com";
  
      // Find and delete the user by email
      const deletedUser = await Admin.findOneAndDelete({ email: emailToDelete });
  
      if (deletedUser) {
        res.send("User deleted successfully");
      } else {
        res.status(404).send("Admin not found");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Internal server error");
    }
  });
  app.get("/kk",(req,res)=>{
res.render("admin_page");
  });
    // Add New Card
// app.get('/add_link', (req, res) => {
//   res.render('add_card');
// });

app.get('/add_link', async (req, res) => {
  const { image, subject, description, sem, added_by } = req.body;
  try {
    const newCard = new Card({ image, subject, description, sem, added_by });
    await newCard.save();
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error adding card');
  }
});

// Edit Card
app.get('/edit_link', async(req, res) => {
  try {
    const cards = await Card.find({});
    res.render('edit_link', { cards });
  } catch (err) {
    res.status(500).send('Error fetching cards');
  }
  
});

app.post('/edit_link/:id',async (req, res) => {
  const { image, subject, description, sem } = req.body;
  try {
    await Card.findByIdAndUpdate(req.params.id, { image, subject, description, sem });
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error updating card');
  }
});

// Delete Card
app.get('/delete_link',(req, res) => {
  Card.find({}, (err, cards) => {
    if (err) {
      res.status(500).send('Error fetching cards');
    } else {
      res.render('delete_card', { cards });
    }
  });
});

app.post('/delete_link/:id', async (req, res) => {
  try {
    await Card.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error deleting card');
  }
});
app.listen(3000);
