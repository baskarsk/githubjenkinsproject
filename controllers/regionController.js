var _ = require("lodash");
var mw = require("../middleware/index.js");
require("request");
var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

var regionController = function (region) {

	//Creation of new region
	var post = function (req, res) {
		logger.info("Entering region post method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				var regions = [];
				if (req.body["Regions"] !== undefined) {
					regions = req.body["Regions"];
				} else {
					regions.push(req.body);
				}
				region.create(regions, function (err, regions) {
					if (err) {
						logger.error("Error in posting region" + err);
						res.status(500);
						res.json({ info: "error when posting regions", error: err });
					} else {
						logger.info("Exiting region post method");
						res.status(201);
						res.send(regions);
					}
				});
			} else {
				//Need to handle the errors for different cases : Invalid token, invalid user etc.
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Get regions. If the group is 'Submitter', get those regions submitted by the user. Else, get all regions.	
	var get = function (req, res) {
		logger.info("Entering region get method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				region.find(function (err, region) {
					if (err) {
						logger.error("Error in getting region" + err);
						res.status(500);
						res.json({ info: "error during find regions", error: err });
					} else {
						logger.info("Exiting region get method");
						res.status(200);
						res.send(region);
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Get region by Id. If the user is 'Submitter' check if the region can be shown as well.	
	var getbyId = function (req, res) {
		logger.info("Entering region getbyid method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				region.findById(req.params.id, function (err, region) {
					if (err) {
						logger.error("Error in getting region" + err);
						res.status(500);
						res.json({ info: "error during find regions", error: err });
					}
					if (region) {
						logger.info("Exiting region get method");
						res.status(200);
						res.send(region);
					} else {
						logger.info("Exiting region get method");
						res.status(200);
						res.json({ info: "region not found" });
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Editing the region. If the user is 'Submitter', Assessment section is not allowed to edit.
	var put = function (req, res) {
		logger.info("Entering region put method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				region.findById(req.params.id, function (err, region) {
					if (err) {
						logger.error("Error in getting region" + err);
						res.status(500);
						res.json({ info: "error during find regions", error: err });
					}
					if (region) {
						_.merge(region, req.body);
						region.save(function (err) {
							if (err) {
								logger.info("Exiting upating region put method");
								res.status(500);
								res.json({ info: "error during find regions", error: err });
							} else {
								logger.info("Updated region successfully");
								res.status(200);
								res.send(region);
							}
						});
					} else {
						logger.info("Exiting region get method");
						res.status(200);
						res.json({ info: "region not found" });
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Removal of region	
	var remove = function (req, res) {
		logger.info("Entering region remove method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				region.findByIdAndRemove(req.params.id, function (err, region) {
					if (err) {
						logger.error("Error in getting region" + err);
						res.status(500);
						res.json({ info: "error during find regions", error: err });
					} else {
						if (region) {
							logger.info("Exiting region remove method");
							res.status(200);
							res.json({ info: "region Removed Successfully" });
						} else {
							logger.info("region not found");
							res.status(200);
							res.send(region);
						}
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	return {
		post: post,
		get: get,
		getbyId: getbyId,
		put: put,
		remove: remove
	};
};

module.exports = regionController;
