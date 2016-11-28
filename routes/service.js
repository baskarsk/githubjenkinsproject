var Service = require("../models/service.js");

module.exports = function (app) {

	var serviceController = require("../controllers/serviceController")(Service);

	/* Create */
	app.post("/services", serviceController.post);

	/* Read */
	app.get("/services", serviceController.get);

	app.get("/services/:id", serviceController.getbyId);

	/* Update */
	app.put("/services/:id", serviceController.put);

	/* Delete */
	app.delete("/services/:id", serviceController.remove);

};
