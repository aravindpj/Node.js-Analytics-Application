const mongoose = require('mongoose');
const { Schema } = mongoose;
const analyticsSchema = new Schema({
   timeStamp:Date,
   metaData:{
     deviceId:String,
     data:{
        type:Number,
        enum:[0,1]
     },
     timeStamp:Number
   }
});

const Analytics = mongoose.model("analytics", analyticsSchema);

module.exports = Analytics;
