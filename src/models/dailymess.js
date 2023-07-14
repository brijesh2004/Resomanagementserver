const mongoose = require("mongoose");
const DailyNews =new mongoose.Schema({
    email:{
        type:String,
        require:true
    }
})

const DailyUpdate = mongoose.model('newsdaily', DailyNews);
module.exports = DailyUpdate;