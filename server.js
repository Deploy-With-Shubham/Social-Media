const express = require("express")
const app = express()
const connctDB = require("./config/db")

// Connect Database

connctDB();

//init middleware
app.use(express.json({ extended: true }))

// defined routes
app.use('/api/users', require("./routes/api/user"))
app.use('/api/auth', require("./routes/api/auth"))
app.use('/api/profile', require("./routes/api/profile"))
app.use('/api/post', require("./routes/api/post"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running at Port", + PORT))