var Project = require("../models/project.js");

module.exports = function (app) {

	var projectController = require("../controllers/projectController")(Project);

	/* Create */
	app.post("/projects", projectController.post);

	/* Read */
	app.get("/projects", projectController.get);

	app.get("/projects/:id", projectController.getbyId);

	/* Update */
	app.put("/projects/:id", projectController.put);

	/* Delete */
	app.delete("/projects/:id", projectController.remove);


};
