const express = require("express");
const dotenv = require("dotenv");
const breakfast = require("../api/breakfast");
const lunch = require("../api/lunch");
const dinner = require("../api/dinner");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const User = require("../src/models/schema");
const DailyUpdate = require("../src/models/dailymess");
const authenticate = require("./middleware/authenticate");
dotenv.config({path:'./config.env'});
const port = process.env.PORT || 6000;


const app = express();
require("../src/db/conn");
app.use(express.json());
app.use(cookieParser());
//  const apiPath = path.join(__dirname,".././api");
//  console.log(apiPath);
app.use(
    cors({
      credentials:true,
      origin:['https://restoclient.onrender.com'],
      methods:['GET','POST','DELETE'],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  )

app.get("/",(req,res)=>{
    res.send("hello World");
})

app.get('/breakfast',(req,res)=>{
  res.header('Access-Control-Allow-Origin', `https://restoclient.onrender.com`);
    res.send(breakfast);
})
app.get('/lunch',(req,res)=>{
  res.header('Access-Control-Allow-Origin', `https://restoclient.onrender.com`);
    res.send(lunch);
})
app.get('/dinner',(req,res)=>{
  res.header('Access-Control-Allow-Origin', `https://restoclient.onrender.com`);
    res.send(dinner);
})

app.get("/navbar",authenticate , async (req,res)=>{
  res.header('Access-Control-Allow-Origin', `https://restoclient.onrender.com`);
   res.send(req.rootUser);
}) 

app.post("/register" , async (req,res)=>{
  res.header('Access-Control-Allow-Origin', `https://restoclient.onrender.com`);
  try{
  const {name,email ,password,cpassword} = req.body;
  console.log(name,email ,password,cpassword);
  if(!name || !email || !password || !cpassword){
    res.status(401).json({err:"please fill all the filled"});
  }
     const userexist =await User.findOne({email:email});
     if(userexist){
      res.status(422).json({err:"Already Registered"});
     }
     else if(password!==cpassword){
      res.status(421).json({err:"password are not matching"});
     }
     else{
      const newUser = await new User({name,email,password , cpassword});
      await newUser.save();
      res.status(201).send({mess:"User Register Successfully"});
     }
}
catch(err){
  res.status(401).json({err:"Error occured"});
}
})

app.post('/login' , async (req,res)=>{
  res.header('Access-Control-Allow-Origin', `https://restoclient.onrender.com`);
  try{
    const {email , password} = req.body;
    console.log(email , password);
    if(!email || !password){
      res.status(422).json({err:"please fill the field"});
    }
    const userExist = await User.findOne({email});
    console.log("use", userExist);
    if(userExist){
     const isMatch = await bcrypt.compare(password , userExist.password);
     console.log(isMatch);
     const token = await userExist.autogeneratetoken();
     console.log(token);
     // cookie store  
     res.cookie("jwttoken", token, {
       expires: new Date(Date.now() + 25892000000),
       httpOnly: true,
       sameSite:'none', 
       secure:true
     });

     if(isMatch){
      res.status(200).json({mess:"Login successfully"});
     }
     else{
      res.status(401).json({err:"wrong details"});
     }
    }
    else{
      res.status(401).json({err:"wrong details"});
    }
  }
  catch(err){
    res.status(401).json({err:"Wrong details"})
  }

})

app.post("/getnewsdaily" , async(req, res)=>{
  try{
  const {email} = req.body;
  if(!email){
    res.status(401).json({err:"Please Enter the Email"});
  }
  else{
    const findEmail = await DailyUpdate.findOne({email:email});
    if(findEmail){
      res.status(402).json({err:"Already get News"});
    }
    const newEmailAdded = new DailyUpdate({email});
    await newEmailAdded.save();
    res.status(201).send({mess:"thanks for subscribing "});
  }
}
catch(err){
  res.status(401).json({err:"Please Enter the Email"});
}

})
app.listen(port,()=>{
    console.log(`Server is listening on the port number ${port}`);
})