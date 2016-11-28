//var dbJs = require('./db.js');

var mongoose = require("mongoose");

//Schema for Region
var serviceSchema = mongoose.Schema({
	name: String,
	key: String,
	options: [String]
});

module.exports = mongoose.model("Services", serviceSchema);
