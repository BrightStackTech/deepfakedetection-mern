const User = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const toast = require('react-toastify');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.SENDER_EMAIL}`,
        pass: `${process.env.SENDER_PASSWORD}`
    }
});

exports.register = async (req, res) => {
    let { username, email, password } = req.body;
    console.log("Received registration data:", { username, email, password }); // Log the received data

    // Convert username to lowercase (for non-Google registration)
    username = username.toLowerCase();

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
            toast.error("Email already in use");
        }

        // Set default profile picture for non-Google users
        const defaultProfilePicture = "https://res.cloudinary.com/dvb5mesnd/image/upload/v1741339315/Screenshot_2025-03-07_145028-removebg-preview_mqw8by.png";

        // Create new user with transformed username
        const user = new User({ 
            username, 
            email, 
            password, 
            profilePicture: defaultProfilePicture 
        });
        await user.save();

        // Generate a confirmation token and send confirmation email 
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const url = `${process.env.CLIENT_URL}/confirmation/${token}`;

        await transporter.sendMail({
            to: email,
            subject: 'Confirm your email',
            html: `Click <a href="${url}">here</a> to confirm your email.`
        });

        res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your email first' });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }
            res.status(200).json({ message: 'Login successful' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.confirmEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email confirmed. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.checkEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    // Convert email to lowercase for a case-insensitive check
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error in checkEmail:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    // Convert to lowercase to be case-insensitive
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }
    // Create a reset token that expires in 15 minutes
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>An email has been sent to this mail id to reset the password. Please check inbox (spam folder included).</p>
             <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>`
    });

    res.status(200).json({ message: "Reset email sent" });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  try {
    // Verify token and decode user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }
    // Hash the new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Server error" });
  }
};
