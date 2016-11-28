var _ = require("lodash");
var mw = require("../middleware/index.js");
require("request");
var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

var serviceController = function (service) {

	//Creation of new service	
	var post = function (req, res) {
		logger.info("Entering service post method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				var services = [];
				if (req.body["Services"] !== undefined) {
					services = req.body["Services"];
				} else {
					services.push(req.body);
				}
				service.create(services, function (err, services) {
					if (err) {
						logger.error("Error in posting service" + err);
						res.status(500);
						res.json({ info: "error when posting services", error: err });
					} else {
						logger.info("Exiting Service post method");
						res.status(201);
						res.send(services);
					}
				});
			} else {
				//Need to handle the errors for different cases : Invalid token, invalid user etc.
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Get services. If the group is 'Submitter', get those services submitted by the user. Else, get all services.	
	var get = function (req, res) {
		logger.info("Entering service get method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				service.find(function (err, service) {
					if (err) {
						logger.error("Error in getting service" + err);
						res.status(500);
						res.json({ info: "error during find services", error: err });
					} else {
						logger.info("Exiting service get method");
						res.status(200);
						res.send(service);
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Get service by Id. If the user is 'Submitter' check if the service can be shown as well.	
	var getbyId = function (req, res) {
		logger.info("Entering service getbyid method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				service.findById(req.params.id, function (err, service) {
					if (err) {
						logger.error("Error in getting service" + err);
						res.status(500);
						res.json({ info: "error during find services", error: err });
					}
					if (service) {
						logger.info("Exiting service get method");
						res.status(200);
						res.send(service);
					} else {
						logger.info("Exiting service get method");
						res.status(200);
						res.json({ info: "service not found" });
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Editing the service. If the user is 'Submitter', Assessment section is not allowed to edit.
	var put = function (req, res) {
		logger.info("Entering service put method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				service.findById(req.params.id, function (err, service) {
					if (err) {
						logger.error("Error in getting service" + err);
						res.status(500);
						res.json({ info: "error during find services", error: err });
					}
					if (service) {
						if (req.body.options) {
							service.options = req.body.options;
						}
						_.merge(service, req.body);
						service.save(function (err) {
							if (err) {
								logger.info("Exiting upating service put method");
								res.status(500);
								res.json({ info: "error during find services", error: err });
							} else {
								logger.info("Updated service successfully");
								res.status(200);
								res.send(service);
							}
						});
					} else {
						logger.info("Exiting service get method");
						res.status(200);
						res.json({ info: "service not found" });
					}
				});
			} else {
				res.status(401);
				res.json({ info: "No valid access token" });
			}
		});
	};

	//Removal of service	
	var remove = function (req, res) {
		logger.info("Entering service remove method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				service.findByIdAndRemove(req.params.id, function (err, service) {
					if (err) {
						logger.error("Error in getting service" + err);
						res.status(500);
						res.json({ info: "error during find services", error: err });
					} else {
						if (service) {
							logger.info("Exiting service remove method");
							res.status(200);
							res.json({ info: "service Removed Successfully" });
						} else {
							logger.info("service not found");
							res.status(200);
							res.send(service);
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

module.exports = serviceController;
