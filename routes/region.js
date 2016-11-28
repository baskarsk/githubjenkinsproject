var Region = require("../models/region.js");

module.exports = function (app) {

	var regionController = require("../controllers/regionController")(Region);

	/* Create */
	app.post("/regions", regionController.post);

	/* Read */
	app.get("/regions", regionController.get);

	app.get("/regions/:id", regionController.getbyId);

	/* Update */
	app.put("/regions/:id", regionController.put);

	/* Delete */
	app.delete("/regions/:id", regionController.remove);

};
