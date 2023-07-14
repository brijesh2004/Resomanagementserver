const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/RestoManagement",{
    useNewUrlParser:true
}).then(()=>{
    console.log("connection Successfull");
}).catch((err)=>{
    console.log("no connection");
})