const express = require('express');
const uptimeController = require('../controllers/uptimeController.js');
const authController = require('../controllers/authController.js');
const router = express.Router()

router.get('/data-uptimeData', authController.protect, uptimeController.uptimeData)
router.get('/data-totalUptimeData', authController.protect, uptimeController.uptimeTotal)



module.exports=router