const express = require("express");
require("dotenv").config({ override: true });
const CORS = require("cors");
const { default: mongoose } = require("mongoose");
const app = express();

const PORT = 8000 || process.env.PORT;

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("DB connected")
}).catch((err)=>{console.log("DB connection failed")})


app.use(CORS({
    origin : "http://localhost:5173",
    credentials : true
}))

app.listen(PORT , ()=>{console.log(`Server started on port ${PORT}`)});