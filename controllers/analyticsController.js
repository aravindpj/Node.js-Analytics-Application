const Analytics = require("../models/analytics");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const formatDate = require("../utils/dateFormat");

exports.dataAnalytics = catchAsync(async function (req, res, next) {
  const date = new Date(formatDate(req.query.date) || Date.now());

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  console.log("Start Date:", startDate.toLocaleString()); 
  console.log("End Date:", endDate.toLocaleString());
  const result = await Analytics.aggregate([
    {
      $match: {
        timeStamp: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $hour: "$timeStamp" },
        totalDataCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  if (!result.length) {
    return next(new AppError("There is no data found this date", 404));
  }
  const dayByHour = Array(24).fill(0);
  result.forEach((hourData) => {
    dayByHour[hourData._id] = hourData.totalDataCount;
  });
  const totalCount = dayByHour.reduce((acc, count) => acc + count, 0);
  console.log(totalCount);
  const avgPerHour = totalCount / 24;
  const busiestHour = dayByHour.indexOf(Math.max(...dayByHour));

  res.json({
    status: "success",
    result: {
      dayByHour,
      net: totalCount,
      avg: +avgPerHour.toFixed(2),
      busiestHour,
    },
  });
});

exports.report = catchAsync(async function (req, res, next) {
  if (!req.query.date) {
    return next(new AppError("Date query parameter is required.", 400)); 
  }

  const startDate = new Date(formatDate(req.query.date));
  startDate.setHours(23, 59, 59, 999);

  const result = await Analytics.aggregate([
    {
      $match: {
        timeStamp: {
          $lte: startDate,
        },
      },
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$timeStamp" },
          month: { $month: "$timeStamp" },
          year: { $year: "$timeStamp" },
        },
        totalData: { $sum: 1 },
        totalOnes: {
          $sum: {
            $cond: [{ $eq: ["$metaData.data", 1] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        date: "$_id",
        totalData: 1,

        // divide totalOnes and totalData to get avg
        avgData: {
          $cond: [
            { $ne: ["$totalData", 0] },
            { $round: [{ $divide: ["$totalOnes", "$totalData"] }, 2] },
            0,
          ],
        },
        _id: 0,
      },
    },
    {
      $sort: { "date.year": 1, "date.month": 1, "date.day": 1 },
    },
  ]);

  res.json({ status: "success", result });
});

exports.busiestAndQuietest = catchAsync(async function (req, res, next) {
  const { date } = req.query;

  if (!date) {
    return next(
      new AppError("Please provide a valid date in the payload", 400)
    );
  }

  const providedDate = new Date(formatDate(date));
  providedDate.setHours(23, 59, 59, 999)
  const result = await Analytics.aggregate([
    {
      $match: {
        timeStamp: { $lt: providedDate },
      },
    },
    {
      $project: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$timeStamp" } },
        data: "$metaData.data",
      },
    },
    {
      $group: {
        _id: "$day",
        totalData: { $sum: "$data" },
      },
    },
    {
      $sort: { totalData: -1 },
    },
    {
      $facet: {
        busiestDays: [{ $limit: 3 }],
        allSortedDays: [{ $sort: { totalData: 1 } }],
      },
    },
    {
      $project: {
        busiestDays: 1,
        quietestDays: { $slice: ["$allSortedDays", 3] },
      },
    },
  ]);

  if (!result || result.length === 0) {
    return next(new AppError("No data found", 404));
  }

  const { busiestDays, quietestDays } = result[0];

  res.status(200).json({
    status: "success",
    result: {
      busiestDays,
      quietestDays,
    },
  });
});
