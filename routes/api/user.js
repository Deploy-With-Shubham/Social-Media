const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check")

//@routr   api/users
//@desc    Test route
//@access  Public
router.post('/', (req, res) => {
    console.log(req.body.username)
    res.send("users router")
})
module.exports = router;