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
//  console.log(apiPath);
app.use(
    cors({
      credentials:true,
      origin:[`${process.env.FRONTEND}`],
      methods:['GET','POST','DELETE'],
      allowedHeaders: ["Content-Type", "Authorization"]
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
  // console.log(name,email ,password,cpassword);
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
      const newUser = await new User({name,email,password , cpassword});
      await newUser.save();
      return res.status(201).send({mess:"User Register Successfully"});
     }
}
catch(err){
  return res.status(401).json({err:"Error occured"});
}
})

app.post('/login' , async (req,res)=>{
  try{
    const {email , password} = req.body;
    // console.log(email , password);
    if(!email || !password){
     return res.status(422).json({err:"please fill the field"});
    }
    const userExist = await User.findOne({email});
    // console.log("use", userExist);
    if(userExist){
     const isMatch = await bcrypt.compare(password , userExist.password);
    //  console.log(isMatch);
     const token = await userExist.autogeneratetoken();
    //  console.log(token);
     // cookie store  
     res.cookie("jwttoken", token, {
       expires: new Date(Date.now() + 25892000000),
       httpOnly: true,
       sameSite:'none', 
       secure:true
     });

     if(isMatch){
     return res.status(200).json({mess:"Login successfully"});
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

app.post("/ordernow" ,authenticate ,async (req,res)=>{
  try{
    const {name , price,mobile1,mobile2,address , pincode} = req.body;
    // console.log(name , price ,mobile1 , mobile2,address , pincode);
    if(!name || !price || !mobile1 ||!mobile2||!address||!pincode){
      res.status(401).json({err:"Please fill the the field"});
    }
    else{
      const UserFind = await User.findOne({_id:req.userID});
      if(!UserFind){
        return res.status(402).json({err:"Please Login First"});
      }
      else{
        const Userorder = await UserFind.addOrder(name,price ,mobile1,mobile2,address,pincode);
        await UserFind.save();
        const name1 = UserFind.name;
         const order =await new updateOrder({name1 , name , price ,mobile1,mobile2,address,pincode });
         await order.save(0);
       return res.status(201).json({mess:"Order Booked Successfully"});
      }
    }

  }
  catch(err){
    return res.status.json({err:"error occured"});
  }
 

})


app.get('/logout', async (req, res) => {
  try{
    console.log("hello my logout page");
    res.cookie("jwttoken", '', {
      expires: 0,
      httpOnly: true,
      sameSite:'none', 
      secure:true
    });
    console.log("Hello");
    return res.status(200).json({mess:"user logout"});
  }
  catch(err){
    console.log("Hello1" , err);
   return res.status(401).json({err:"Cookies not Clear"});
  }
 
})
app.get("/profiledata",authenticate , async (req,res)=>{
   return res.send(req.rootUser);
}) 

app.post("/profilephoto" , authenticate , async (req,res) =>{
  try{
    const {photo} = req.body;
    // console.log(photo);
    if(!photo){
      console.log("error");
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
    //  console.log(err);
     console.log("error on catch");
   return res.status(401).json({err:"Error"});
  }
})

app.get("/gettheorder" ,async (req,res)=>{
 const data = await updateOrder.find({});
return res.send(data);
});

app.listen(port,()=>{
    console.log(`Server is listening on the port number ${port}`);
})