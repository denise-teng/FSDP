const { User } = require('../models/user');
const Token = require('../models/token');
const sendEmail = require('../utils/sendEmail');
const Joi = require('joi');
const crypto = require('crypto');
const express = require('express');
const router = express.Router(); // Fixed: Needed parentheses to instantiate Router

router.post("/", async (req, res) => {
    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body); // Fixed: Destructuring syntax
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("User with given email doesn't exist"); // Fixed error message

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex'),
            }).save();
        }

        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`; // Fixed: Used backticks (`) instead of single quotes

        await sendEmail(user.email, "Password Reset", link);

        res.send("Password reset link sent to your email account."); // Improved message
    } catch (error) {
        console.error("Error in password reset:", error); // Better error logging
        res.status(500).send("An error occurred while processing your request"); // Proper status code
    }
});

module.exports = router;