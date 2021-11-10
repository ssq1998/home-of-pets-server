const mongoose = require('mongoose')
// const mongoUrl = 'mongodb://localhost:27017/login'

module.exports = app => {
    mongoose.connect('mongodb://localhost:27017/homeofpetsdb',{ useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:false},()=>{
    console.log('mongodb connect')
    })
}