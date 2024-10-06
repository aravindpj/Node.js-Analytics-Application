const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const mongoose = require("mongoose");
const fs = require("fs/promises");
const UptimeData = require("./models/uptimedata");
const Analytics = require("./models/analytics");

const db = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(db, {
    useNewUrlParser: true,
  })
  .then(() =>
    console.log(
      `DATABASE CONNECTED. PLEASE WAIT A MOMENT WHILE THE DATA IS BEING UPLOADED`
    )
  );

const deviceId = "device123";
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const upload = async () => {
  try {
    let analyticRecord = JSON.parse(await fs.readFile("./analyticsData.json"));
    let uptimeRecord = JSON.parse(await fs.readFile("./uptimeData.json"));

    await Analytics.create(analyticRecord);
    await UptimeData.create(uptimeRecord);
    console.log("DATA ADDED TO DB");
  } catch (error) {
    console.log("ERROR WHILE UPLOADING");
  }
};
const writFile = async (path, data) =>
  await fs.writeFile(path, JSON.stringify(data, null, 2));

async function generateUptimeData(durationInDays) {
  let uptimeData = [];
  let analyticsData = [];
  let currentTime = Date.now();
  let previousState = null;
  let previousAnalyticValue = null;
  for (let day = 0; day < durationInDays; day++) {
    for (let hour = 0; hour < 12; hour++) {
      const numTriggers = getRandomInt(5, 10);

      for (let i = 0; i < numTriggers; i++) {
        const currentState =
          getRandomInt(0, 1) === 0 ? "disconnected" : "connected";
        const analyticValue = getRandomInt(0, 1);

        if (currentState === previousState) continue;
        
        if (analyticValue === previousAnalyticValue) continue;
        const uptimeRecord = {
          timeStamp: new Date(currentTime),
          metaData: {
            deviceId,
            data: currentState,
            timeStamp: currentTime,
          },
        };
        const analyticRecord = {
          timeStamp: new Date(currentTime),
          metaData: {
            deviceId,
            data: analyticValue,
            timeStamp: currentTime,
          },
        };

        analyticsData.push(analyticRecord);
        uptimeData.push(uptimeRecord);
        previousState = currentState;
        previousAnalyticValue = analyticValue;
        currentTime += 60000;
      }
      // skip to next hour
      currentTime += 3600000; // 1 hour in milliseconds
    }

    currentTime += (24 - 1) * 60 * 60 * 1000;
  }

  await writFile("./uptimeData.json", uptimeData);
  await writFile("./analyticsData.json", analyticsData);
  await upload();
}

generateUptimeData(60);
