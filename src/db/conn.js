const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path:'./config.env'});
mongoose.connect(`${process.env.db}`,{
    useNewUrlParser:true
}).then(()=>{
    console.log("connection Successfull");
}).catch((err)=>{
    console.log("no connection");
})
