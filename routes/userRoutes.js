const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');


router.post('/signup', async (req, res) => {
    try {
        const data = req.body // Assuming the request body contains the user data

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({ response: response, token: token });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Login Route
router.post('/login', async (req, res) => {
    try {
        // Extract username and password from request body
        const { aadharCardNumber, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Aadhar Card Number or password' });
        }

        // generate Token 
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({ token })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user.userData;
        console.log("User Data: ", userData);

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})




router.put('/profile/password', async (req, res) => {
    try {
        const userId = req.user.userData.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new password from req body

    // Find the user by user id
        const user = User.findById(userId);

    // If  password does not match, return error
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid Aadhar Card Number or password' });
        }
    // Update the user password
        user.password = newPassword;
        user.save();

        console.log('Password updated');
        res.status(200).json({message: 'Password updated'});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})




module.exports = router;