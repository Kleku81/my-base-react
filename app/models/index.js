const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.prefixIpv4 = require("./prefixIpv4");
db.prefixIpv6 = require("./prefixIpv6");
db.user = require("./user.model");
db.role = require("./role.model");
db.ipDb = require("./dbPrefix.type.model");


db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
