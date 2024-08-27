const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config({path:'./config.env'});

const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    photo:{
        type:String,
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})

UserSchema.pre('save' , async function(next){
    if(this.isModified('password')){
     this.password = await bcrypt.hash(this.password,12);
     this.cpassword = await bcrypt.hash(this.cpassword,12);
    
    }
    next();
})


UserSchema.methods.autogeneratetoken = async function(){
    try{
        let token = jwt.sign({_id: this._id} , "thisistherestomanagementsystemappdesignusingmern");
        // console.log("key->" , process.env.SECRETE_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
        console.log(err);
    }
}

// UserSchema.methods.addOrder = async function(name,price,mobile1,mobile2,address,pincode){
//     try{
//         this.orders = this.orders.concat({name , price,mobile1,mobile2,address,pincode});
//         await this.save();
//         return {name,price,mobile1,mobile2,address,pincode};
//     }catch(err){
//         console.log(err);
//     }
// }
UserSchema.methods.addProfileImage = async function(photo){
    try{
        this.photo = photo;
        await this.save();
        return this;
    }
    catch(err){
        console.log(err);
    }
}
const User = mongoose.model('user',UserSchema);

module.exports = User;