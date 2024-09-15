const mongoose = require('mongoose');

require('dotenv').config();

// console.log(process.env.MONGODB_URL)

const connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        dbName: "credit-card"
    }).then(()=>console.log("db connect successfully")).catch((error)=>{
        console.log(error);
        console.error(error.message);
    })
}
module.exports = connect;