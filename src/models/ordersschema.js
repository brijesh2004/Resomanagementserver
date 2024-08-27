const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
   name:{
    type:String,
    required:[true , 'please Provide the Name']
   },
   table:{
    type:String,
    required:[true,'Please Provide the Table Id']
   },
   orderedBy:{
    type:String,
    required:true,
   },
   orderedAt:{
    type:Date,
    default:Date.now
   },
   cart:[{
     name:{
      type:String,
      required:true
     },
     price:{
      type:String,
      required:true
     },
     numberOf:{
      type:Number,
      required:true
     },
     id:{
      type:String,
      required:true,
     },
     image:{
      type:String,
      required:true
     }
   }]
})


const updateOrder = mongoose.model('ordersschema' , OrdersSchema);
module.exports = updateOrder;