const mongoose = require("mongoose");

const OrdersSchema = new mongoose.Schema({
    name1:{
      type:String,
      required:true
    },
    name:{
        type:String ,
        required:true
       },
       price:{
        type:Number,
        required:true
       },
       mobile1:{
        type:Number,
        required:true
       },
       mobile2:{
        type:Number,
        required:true
       },
       address:{
        type:String,
        required:true
       },
       pincode:{
        type:Number,
        required:true
       },
       date:{
        type:Date,
        default:new Date()
       }
})


const updateOrder = mongoose.model('ordersschema' , OrdersSchema);
module.exports = updateOrder;