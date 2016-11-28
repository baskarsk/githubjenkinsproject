//var dbJs = require('./db.js');

var mongoose = require("mongoose");

//Schema for Region
var regionSchema = mongoose.Schema({
	name: String
});

module.exports = mongoose.model("Regions", regionSchema);
