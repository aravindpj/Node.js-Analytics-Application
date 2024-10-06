const mongoose = require('mongoose');
const { Schema } = mongoose;
const uptimeDataSchema = new Schema({
   timeStamp:Date,
   metaData:{
     deviceId:String,
     data:{
        type:String,
        enum:["connected","disconnected"]
     },
     timeStamp:Number
   }
});

const Uptimedata = mongoose.model("uptimedata", uptimeDataSchema);

module.exports = Uptimedata;