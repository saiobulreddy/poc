'use strict';
const SupplyChain = require('./SupplyChain');
const History = require("./History");
const Initiation = require("./Initiation");
module.exports.insuranceContract = { SupplyChain, History, Initiation };
module.exports.contracts = [SupplyChain, History, Initiation];
