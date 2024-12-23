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
const updateOrder = require('../src/models/ordersschema');
const authenticate = require("./middleware/authenticate");
dotenv.config();
const port = process.env.PORT || 6000;




const app = express();
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: false }));
require("../src/db/conn");
app.use(express.json());
app.use(cookieParser());
//  const apiPath = path.join(__dirname,".././api");
app.use(
    cors({
      credentials:true,
      origin:`${process.env.FRONTEND}`||'*',
      methods:['GET','POST','DELETE'],
      allowedHeaders: ["Content-Type", "Authorization" , 'x-access-token']
    })
  )

app.get("/",(req,res)=>{
    return res.send("hello World");
})

app.get('/breakfast',(req,res)=>{
    return res.send(breakfast);
})
app.get('/lunch',(req,res)=>{
    return res.send(lunch);
})
app.get('/dinner',(req,res)=>{
   return res.send(dinner);
})

app.get("/navbar",authenticate , async (req,res)=>{
   return res.send(req.rootUser);
}) 

app.post("/register" , async (req,res)=>{
  try{
  const {name,email ,password,cpassword} = req.body;
  if(!name || !email || !password || !cpassword){
    return res.status(401).json({err:"please fill all the filled"});
  }
     const userexist =await User.findOne({email:email});
     if(userexist){
      return res.status(422).json({err:"Already Registered"});
     }
     else if(password!==cpassword){
     return res.status(421).json({err:"password are not matching"});
     }
     else{
      const newUser = new User({name,email,password , cpassword});
      await newUser.save();
      const token = await newUser.autogeneratetoken();
     // cookie store  
     res.cookie("jwttoken", token, {
       expires: new Date(Date.now() + 25892000000),
       httpOnly: true,
       sameSite:'none', 
       secure:true
     });
      return res.status(201).send({mess:"User Register Successfully" , token:token});
     }
}
catch(err){
  return res.status(401).json({err:"Error occured"});
}
})

app.post('/login' , async (req,res)=>{
  try{
    const {email , password} = req.body;
    if(!email || !password){
     return res.status(422).json({err:"please fill the field"});
    }
    const userExist = await User.findOne({email});
    if(userExist){
     const isMatch = await bcrypt.compare(password , userExist.password);
     const token = await userExist.autogeneratetoken();
     // cookie store  
     res.cookie("jwttoken", token, {
       expires: new Date(Date.now() + 25892000000),
       httpOnly: true,
       sameSite:'none', 
       secure:true
     });

     if(isMatch){
     return res.status(200).json({mess:"Login successfully" , token:token});
     }
     else{
     return res.status(401).json({err:"wrong details"});
     }
    }
    else{
      return res.status(401).json({err:"wrong details"});
    }
  }
  catch(err){
    return res.status(401).json({err:"Wrong details"})
  }

})



app.post("/getnewsdaily" , async(req, res)=>{
  try{
  const {email} = req.body;
  if(!email){
   return res.status(401).json({err:"Please Enter the Email"});
  }
  else{
    const findEmail = await DailyUpdate.findOne({email:email});
    if(findEmail){
      return res.status(402).json({err:"Already get News"});
    }
    const newEmailAdded = new DailyUpdate({email});
    await newEmailAdded.save();
   return res.status(201).send({mess:"thanks for subscribing "});
  }
}
catch(err){
  return res.status(401).json({err:"Please Enter the Email"});
}
})



app.post("/order" , authenticate ,async (req , res)=>{
  try{
    const {name , table , cart} = req.body;
    const orderedBy= req.userID;
    const newOrder = new updateOrder({
      name , 
      table,
      orderedBy,
      cart
    })
    await newOrder.save();
   return res.status(201).json({mess:"Ordered!"})
  }
  catch(err){
    return res.status(400).json({err:"Error Occured"});
  }
})


app.get('/logout', async (req, res) => {
  try{
    res.cookie("jwttoken", '', {
      expires: 0,
      httpOnly: true,
      sameSite:'none', 
      secure:true
    });
    return res.status(200).json({mess:"user logout"});
  }
  catch(err){
   return res.status(401).json({err:"Cookies not Clear"});
  }
 
})
app.get("/profiledata",authenticate , async (req,res)=>{
   return res.send(req.rootUser);
}) 

app.post("/profilephoto" , authenticate , async (req,res) =>{
  try{
    const {photo} = req.body;
    if(!photo){
     return res.status(401).json({err:"Error on photo"});
    }
    else{
      const UserFind = await User.findOne({_id:req.userID});
      await UserFind.addProfileImage(photo);
      await UserFind.save();
      return res.status(201).json({mess:"profile uplaoded successfully"})
    }
  }
  catch(err){
   return res.status(401).json({err:"Error"});
  }
})

app.get("/gettheorder" ,authenticate ,async (req,res)=>{
  try{
    const id = req.userID;
    const data = await updateOrder.find({orderedBy:id});
   return res.status(200).json({mess:data});
  }
  catch(err){
    return res.status(400).json({err:"Error"});
  }
});

app.listen(port,()=>{
    console.log(`Server is listening on the port number ${port}`);
})