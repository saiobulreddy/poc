// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://username:password@123@cluster0.0npy6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   if (!err) console.log("Connected to DataBase Successfully.");
//   else console.log(err.message || "Error while Connecting to DataBase.");
// client.close();
// });

// const {Sequelize} = require("sequelize");
// const sequelize = new Sequelize("sqlite::memory:");
// const Trades = require('./models/trades');

// return sequelize.authenticate()
//     .then(result => {
//         console.log(`SQLite successfully connected!`);
//         return Trades.sync();
//     })
//     .then(result => {
//         console.log(`Trades table created`);
//         return result;
//     })
//     .catch(error => {
//         console.error('Unable to connect to SQLite database:', error);
//     })

const mongoose = require('mongoose');
const uri = "mongodb+srv://username:password@123@cluster0.0npy6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (!err) console.log("Connected to DataBase Successfully.");
  else console.log(err.message || "Error while Connecting to DataBase.");
})

