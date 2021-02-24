const express = require("express");
const router = express.Router();

//@routr   api/posts
//@desc    Test route
//@access  Public
router.get('/', (req, res) => {
    res.send("post router")
})
module.exports = router;
