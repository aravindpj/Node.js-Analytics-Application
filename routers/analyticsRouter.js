const express = require('express');
const analyticsController = require('../controllers/analyticsController.js');
const authController = require('../controllers/authController.js');
const router = express.Router()

router.get('/data-analytics', authController.protect, analyticsController.dataAnalytics)
router.get('/data-report', authController.protect, analyticsController.report)
router.get('/data-busiestAndquietest', authController.protect, analyticsController.busiestAndQuietest)



module.exports=router