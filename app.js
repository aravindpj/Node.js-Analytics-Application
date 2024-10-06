const express = require('express');

const path=require('path')

const app = express();


const rateLimit=require('express-rate-limit')
const helmet=require('helmet')
const mongoSantize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')
const cookieParser = require('cookie-parser')

const moragn=require('morgan')

const userRouter=require('./routers/userRouter');
const analyticsRouter=require('./routers/analyticsRouter.js');
const uptimeRouter=require('./routers/uptimeRouter.js');
const AppError = require('./utils/appError');


const globalErrorHandling=require('./controllers/errorController')


app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))


app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())


app.use(mongoSantize())


app.use(xss())


app.use(hpp())


if(process.env.NODE_ENV==='development'){
    app.use(moragn('dev'))
}


const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000
})


app.use('/api',limiter) 



app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString(); 
  next();
});


app.use('/api/ver1/users',userRouter)
app.use('/api/ver1/analytics',analyticsRouter)
app.use('/api/ver1/uptime',uptimeRouter)
app.get("/",(req,res)=>{
  res.send("hello world")
})



//its take every type of req
app.all('*',(req,res,next)=>{
  next(new AppError(`doesn't match this URL ${req.originalUrl} in this server`,404))
})

app.use(globalErrorHandling)

//SERVER  
module.exports=app
