const jwt = require("jsonwebtoken");
const User = require("../models/schema");
const dotenv = require("dotenv");
dotenv.config({path:'./config.env'});

const authenticate = async (req,res,next) => {
    try{
    const token = req.cookies.jwttoken;
    const verifyToken = jwt.verify(token,process.env.SECRETE_KEY);
    const rootUser = await User.findOne({_id:verifyToken._id , "tokens.token":token});
    if(!rootUser){
        throw new Error("User Not Found");
    }
    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next();
    
}
catch(err){
    res.status(401).send("Unauthorized : No token Provided");
    console.log(err);
}
}

module.exports = authenticate;