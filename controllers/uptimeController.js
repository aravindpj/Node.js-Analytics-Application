const UptimeData = require('../models/uptimedata');
const User = require('../models/userModel'); 
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync'); 
const formatDate = require("../utils/dateFormat");


exports.uptimeData = catchAsync(async function (req, res, next) {
  if (!req.query.date) {
    return next(new AppError("Date query parameter is required.", 400)); 
  }
  const date = new Date(formatDate(req.query.date) || Date.now());

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  console.log("Start Date:", startDate.toLocaleString()); 
  console.log("End Date:", endDate.toLocaleString());

    const result = await UptimeData.aggregate([
        {
            $match: {
                timeStamp: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
         
            $sort: { timeStamp: 1 },
        },
        {
            //group by metadata and filter first time and last time
            $group: {
                _id: "$metaData.data",
                startTime: { $first: "$timeStamp" },
                endTime: { $last: "$timeStamp" }, 
            },
        },
        {
            $project: {
                timeStamp: "$startTime",
                state: "$_id",
                // substract to get how much time you spend 
                duration: { $subtract: ["$endTime", "$startTime"] },
                _id:0
            },
        },
    ]);
    console.log(result)
    if(!result.length){
        return next(new AppError("There is no data found this date",404))
    }
    res.json({status:"success",result});
});

exports.uptimeTotal = catchAsync(async function (req, res, next) {
    const { date } = req.query;
    
    if (!date) {
      return next(new AppError('Please provide a valid date in the payload',400));
    }
    const providedDate = new Date(formatDate(date));
    providedDate.setHours(23, 59, 59, 999)
    const result = await UptimeData.aggregate([
        {
          $match: {
            // 'metaData.deviceId': deviceId,
            timeStamp: {$lt: providedDate },
          },
        },
        {
          $group: {
            _id: "$metaData.data", 
            count: { $sum: 1 } 
          },
        },
        {
          $project: {
            _id: 0,
            state: "$_id", 
            count: 1, 
          },
        },
      ]);

      if(!result.length){
        return next(new AppError("There is no data found please check your input",404))
      }

      const connectedCount = result.find(item => item.state === 'connected')?.count || 0;
      const disconnectedCount = result.find(item => item.state === 'disconnected')?.count || 0;
  
      res.json({
        connectedCount,
        disconnectedCount,
      });
  });
  
