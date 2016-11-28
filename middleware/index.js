/**
 * http://usejsdoc.org/
 */

var moment = require("moment");
var jwt = require("jsonwebtoken");
//var user = require('../models/user.js');

//var jwtSecret = process.env.secretKey; // this has to be in process environment var
var config = require("../config.json");
var jwtSecret = config.JWT_SECRET;
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

exports.verifyToken = function (req, callback) {
	logger.info("Entering verifyToken method");
	var token = req.headers[config.REQ_HEADER_TOKEN];
	if (typeof (token) === "undefined") {
		logger.warn("Type of token is undefined.");
		return callback(null);
	}
	jwt.verify(token, jwtSecret, function (err, decoded) {
		if (err) {
			logger.warn("Token cannot be verified.");
			err.custom = "can-not-verify-token";
			return callback(err);
		}

		if (decoded.exp < moment().valueOf()) {
			logger.warn("Token is expired.");
			return callback(null, err);
		}
		logger.info("Exiting verifyToken method");
		return callback(null, decoded);
	});
}; 
