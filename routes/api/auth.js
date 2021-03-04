const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/userModel')
const { check, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const config = require("config");

router.get('/', auth, async (req, res) => {
    try {
        // getting user info. by the user id
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('server error')
    }
});
router.post('/',
    [
        check("email", "please include a valid email").isEmail(),
        check(
            'password',
            'Password is required '
        ).exists()
    ],

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email })    //checking provided email exist in User table
            if (!user) {
                return res.status(400).json({ errors: [{ msg: "invalid credentials" }] })
            }

            // Matching inserted password with old password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'invalid Credentials' }] })
            }

            // Jwt authentication

            const payload = {
                id: user.id
            }
            jwt.sign(
                payload,
                config.get("jwtToken"), {
                expiresIn: 360000
            },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token }).send("Login successfull")
                });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');

        }
    })
module.exports = router;