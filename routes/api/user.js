const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check")
const User = require('./../../models/userModel')

router.post('/',
    [
        check("name", "Name is required").
            not().
            isEmpty(),
        check("email", "please include a valid email").isEmail(),
        check(
            'password',
            'please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({ email })    // user already exist validation
            if (user) {
                return res.status(400).json({ errors: [{ msg: "user already exists" }] })
            }
            const avatar = gravatar.url(email, {
                s: "200",           //size of gravatar
                r: "pg",            //
                d: "mm"             // default gravatar
            })

            user = new User({           // making new instance of User model and giving data from body
                name,
                email,
                avatar,
                password
            })
            // encrypting the password into hash  
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt) // it creates a hash of the password
            await user.save();

            // Jwt authentication

            const payload = {
                id: user.id
            }
            jwt.sign(
                payload,
                config.get("jwtToken"), {
                expiresIn: 36000
            },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error');

        }
    })
module.exports = router;