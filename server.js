const express = require("express")
const connectDB = require("./config/db")

// connect database
connectDB()

const PORT = process.env.PORT || 4000

const app = express()

// Init Middlewares
app.use(express.json({extended: false}))

app.get("/", (req, res)=>{
    res.send("Server running...")
})

app.use("/api/users/", require("./routes/api/users"))
app.use("/api/profile/", require("./routes/api/profile"))
app.use("/api/auth/", require("./routes/api/auth"))
app.use("/api/posts/", require("./routes/api/posts"))

app.listen(PORT, (req, res)=>{
    console.log(`Server runnig at: http://localhost:${PORT}`)
})