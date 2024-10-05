const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Create a transporter for sending emails using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email service
  auth: {
    user: process.env.EMAIL_USER, // your email from environment variable
    pass: process.env.EMAIL_PASS, // your email password from environment variable
  },
});

// Function to create a user and send an email
exports.createUserAndSendEmail = functions.https.onRequest(async (req, res) => {
  try {
    const {email, password} = req.body; // Get email and password from request body

    // Validate email and password format
    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    // Create a new user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    // Prepare the email content without including the password
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "You are provided access to use Vsoft HRMS",
      html: `
        <p>Your User ID: ${userRecord.uid}</p>
        <p>Your account has been created successfully. Please log in to set your password.</p>
        <p>Thank you!</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).send("User created and email sent successfully");
  } catch (error) {
    console.error("Error creating user or sending email:", error);
    res.status(500).send(`Error creating user or sending email: ${error.message}`);
  }
});
