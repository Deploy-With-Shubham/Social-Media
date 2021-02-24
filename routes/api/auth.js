const express = require("express");
const router = express.Router();

//@routr   api/auth
//@desc    Test route
//@access  Public
router.get('/', (req, res) => {
    res.send("auth router")
})
module.exports = router;