import { UserModel } from "../models/user.js";
import { RiderModel } from "../models/rider.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { loginRiderValidator, loginUserValidator, registerRiderValidator, registerUserValidator } from "../validators/authVal.js";
import { mailTransporter } from "../utils/mailing.js";
import { emailMessage } from "../utils/mailing.js";
import AccessToken from "twilio/lib/jwt/AccessToken.js";


export const registerUser = async (req, res) => {
    // Validate user information
    const { error, value } = registerUserValidator.validate(req.body);
    if (error) {
        return res.status(422).json(error);
    }
    // Check if user does not exist already
    const user = await UserModel.findOne({
        $or: [
            {username: value.userName},
            { email: value.email }
        ]
    })
    if (user) {
        return res.status(409).json('User already exists ')
    }
    // Hash plaintext password
    const hashedPassword = bcrypt.hashSync(value.password, 10);

    // Create user record in database
    const newUser = await UserModel.create({
        ...value,
        password: hashedPassword
    });
    // Send registration email to user
    await mailTransporter.sendMail({
        from: process.env.GMAIL_USER,
        to: value.email,
        subject: "Welcome to Hearts and PLates",
        html: emailMessage.replace("{{lastName}}", value.lastName)
    })
    // Return response
    res.status(201).json({
        message: 'User registered successfully',
        data: newUser
    })
};




export const loginUser = async (req, res, next) => {
    //Validate user information
    const { error, value } = loginUserValidator.validate(req.body);
    if (error) {
        return res.status(422).json(error)
    }
    //Find matching user record in database
    const user = await UserModel.findOne({
        $or: [
            { userName: value.userName },
            { email: value.email }
        ]
    });
    if (!user) {
        return res.status(409).json("User does not exists");
    }
    //Compare incoming password with saved password
    const correctPassword = bcrypt.compareSync(value.password, user.password);
    if (!correctPassword) {
        return res.status(401).json("Invalid Credentials")
    }
    //Generate access token for the user
    const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
    )
    // Return response
    res.status(200).json({
        message: 'Login successful',
        accessToken,
        user: {
            id: user.id,
            role: user.role
        }
    });
}



export const registerRider = async (req, res) => {
    // Validate user information
    const { error, value } = registerRiderValidator.validate(req.body);
    if (error) {
        return res.status(422).json(error);
    }
    // Check if user does not exist already
    const user = await RiderModel.findOne({
        $or: [
            {username: value.username},
            { email: value.email }
        ]
    })
    if (user) {
        return res.status(409).json('Rider already exists ')
    }
    // Hash plaintext password
    const hashedPassword = bcrypt.hashSync(value.password, 10);

    // Create user record in database
    const newUser = await RiderModel.create({
        ...value,
        password: hashedPassword
    });
    // Send registration email to user
    await mailTransporter.sendMail({
        from: process.env.GMAIL_USER,
        to: value.email,
        subject: "Welcome to Hearts and Plates",
        html: emailMessage.replace("{{name}}", value.name)
    })
    // Return response
    res.status(201).json('Rider registered successfully')
};


export const loginRider = async (req, res, next) => {
    //Validate user information
    const { error, value } = loginRiderValidator.validate(req.body);
    if (error) {
        return res.status(422).json(error)
    }
    //Find matching user record in database
    const user = await RiderModel.findOne({
        $or: [
            { name: value.name },
            { email: value.email }
        ]
    });
    if (!user) {
        return res.status(409).json("Rider does not exists");
    }
    //Compare incoming password with saved password
    const correctPassword = bcrypt.compareSync(value.password, user.password);
    if (!correctPassword) {
        return res.status(401).json("Invalid Credentials")
    }
    //Generate access token for the user
    const accessToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "24h" }
    )
    // Return response
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            role: user.role
        }
    });
}


export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Step 1: Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Step 2: Generate a JWT reset token
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '5m' }
      );
  
      // Step 3: Save token expiry in the database
      user.resetPasswordExpires = Date.now() + 300000; //  5 minutes from now
      await user.save();
  
      // Step 4: Send the reset link via email
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
      const message = `Click the link to reset your password: ${resetLink}`;
      await mailTransporter.sendMail({from: process.env.GMAIL_USER, to: user.email, subject: 'Password Reset Request', text: message });
  
      res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  export const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
  
      // Step 1: Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
      // Step 2: Find the user based on the token's payload (userId)
      const user = await UserModel.findById(decoded.userId);
      if (!user || user.resetPasswordExpires < Date.now()) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
  
      // Step 3: Hash the new password
      user.password = bcrypt.hashSync(newPassword, 10);
  
      // Step 4: Clear reset token fields
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ error: 'Reset token has expired' });
      }
      res.status(500).json({ error: error.message });
    }
  };