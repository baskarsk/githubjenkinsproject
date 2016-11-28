var _ = require("lodash");
var mw = require("../middleware/index.js");
var request = require("request");
var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

var projectController = function (Project) {

	//Creation of new project	
	var post = function (req, res) {
		logger.info("Entering project post method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				var newProject = new Project(req.body);
				if (!req.body.name) {
					logger.warn("Name of the project is empty");
					res.status(400);
					res.send("Name is required");
				} else {
					//Project id should start with 'ADS' and then start automatic numbering from 1000. Example: 'ADS1000'. 
					Project.find({}).sort({ projectId: -1 }).limit(1).exec(function (err, maxResult) {
						if (err) { return err; }
						//Getting maximum value of existing project id fields. Then incrementing it, adding it to new project id field.
						if (maxResult.length > 0) {
							var maxId = ((maxResult[0].projectId).split(config.ADS)).slice(1);
							newProject.projectId = config.ADS + (parseInt(maxId) + 1);
						} else {
							newProject.projectId = config.ADS + (parseInt(config.ID_START));
						}
						logger.info("The new Project Id is " + newProject.projectId);

						var currentTimeStamp = new Date();
						//creation time stamp is added to submittedDate field
						newProject.submittedDate = currentTimeStamp;
						//lastUpdatedDate field is set
						newProject.lastUpdatedDate = currentTimeStamp;
						//lastUpdatedPerson field is set
						//var nuid = JSON.parse(JSON.stringify(response)).iss[0]._id;
						var nuid = JSON.parse(JSON.stringify(response)).iss._id;
						newProject.lastUpdatedPerson = nuid;
						//createdDate & updatedDate fields are set for comments, assessment, details section
						newProject.comments = [];

						if (req.body.comments && (req.body.comments.length != 0)) {
							newProject.comments = req.body.comments;
						}

						//add project created status event comment
						newProject.comments.push({
							createdDate: currentTimeStamp,
							updatedDate: currentTimeStamp,
							desc: config.COMMENT_DESC,
							commenter: newProject.lastUpdatedPerson,
							commentDate: currentTimeStamp
						});


						if (req.body.assessment) {
							newProject.assessment.createdDate = currentTimeStamp;
							newProject.assessment.updatedDate = currentTimeStamp;
						}
						if (req.body.details) {
							newProject.details.createdDate = currentTimeStamp;
							newProject.details.updatedDate = currentTimeStamp;
						}

						//add normalized fields to be used for case-insensitive sorting
						newProject.normalizedName = newProject.name.toLowerCase();
						newProject.normalizedRequestorName = newProject.requestorName.toLowerCase();
						newProject.normalizedRequestorEmail = newProject.requestorEmail.toLowerCase();

						//If the status is 'New', set defaultSort value which will be used later for sorting in get method.
						switch (req.body.status) {
							case config.PROJ_STATUSES.NEW:
								newProject.defaultSort = "A";
								break;
							case config.PROJ_STATUSES.UNDER_EMT_REVIEW:
								newProject.defaultSort = "B";
								break;
							case config.PROJ_STATUSES.UNDER_VP_ADS_REVIEW:
								newProject.defaultSort = "C";
								break;
							case config.PROJ_STATUSES.APPROVED:
								newProject.defaultSort = "D";
								break;
							case config.PROJ_STATUSES.DEFERRED:
								newProject.defaultSort = "E";
								break;
							default:
								newProject.defaultSort = "A";
								break;
						}

						newProject.save(function (err) {
							if (err) {
								logger.error("Error in posting project" + err);
								res.status(500);
								res.send("" + err);
							} else {
								res.status(201);
								res.send(newProject);
								logger.info("Exiting project post method");
								//puwh message to upsert elastic search db 
								pushMessage(newProject);
							}
						});
					});
				}
			} else {
				res.status(401);
				res.send("No access token");
				logger.warn("No access token");
			}
		});
	};

	//Get Projects. If the group is 'Submitter', get those projects submitted by the user. Else, get all projects.	
	var get = function (req, res) {
		logger.info("Entering project get method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				var recvdVal = JSON.stringify(response);
				var email = JSON.parse(recvdVal).iss._id;
				var group = JSON.parse(recvdVal).iss.group;
				var query = {};
				if (req.query.name) {
					query.name = req.query.name;
				}
				//Added for filtering based on status
				if (req.query.status) {
					query.status = req.query.status;
				}

				//Added for sorting based on the client input(eg:`/projects?sort=intakeDate` or `/projects?sort=-intakeDate`) 				
				var sortObject = {};
				if (req.query.sort) {
					var stype = req.query.sort;
					logger.info("Sorting command is " + stype);
					var sdir;
					if (stype.lastIndexOf("-", 0) === 0) {
						logger.info("Descending Sort");
						stype = stype.replace("-", "");
						logger.info("Sorting command updated" + stype);
						sdir = -1;
					} else {
						logger.info("Ascending Sort");
						sdir = 1;
					}
					sortObject[stype] = sdir;
				} else {
					//Default sorting with status as 'New' on top
					logger.info("Going for default sort");
					sortObject[config.DEFAULT_SORT] = 1;
					sortObject["submittedDate"] = -1;
				}

				var queryStringFromClient = req.query.q;
				logger.info("QueryStringFromClient is " + queryStringFromClient);
				if (queryStringFromClient) {
					logger.info("QueryStringFromClient is not empty");
					query["$text"] = { $search: queryStringFromClient };
				}
				//If user is Submitter or No role
				if (group === config.SUBMITTER || group === "") {
					query.submittedEmail = email;
				}

				Project.find(query).sort(sortObject).exec(function (err, projects) {
					if (err) {
						logger.error("Error in getting project" + err);
						res.status(500);
						res.send(err);
					} else {
						var returnProjects = [];
						if (projects != null && projects.length > 0) {
							projects.forEach(function (element) {
								var newProject = element.toJSON();
								newProject.links = {};
								newProject.links.self = config.HTTP_PATH + req.headers.host + config.PROJECTS_PATH + newProject._id;
								returnProjects.push(newProject);
							});
							res.status(200);
							res.json(returnProjects);
							logger.info("Exiting project get method");
						} else {
							res.status(404);
							res.send("Projects not found");
							logger.warn("Projects not found");
						}
					}
				});
			} else {
				res.status(401);
				res.send("No valid access token");
				logger.warn("No valid access token");
			}
		});
	};

	//Get project by Id. If the user is 'Submitter' check if the project can be shown as well.	
	var getbyId = function (req, res) {
		logger.info("Entering project getbyId method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				var recvdVal = JSON.stringify(response);
				var email = JSON.parse(recvdVal).iss._id;
				var group = JSON.parse(recvdVal).iss.group;
				Project.findById(req.params.id, function (err, project) {
					if (err) {
						logger.warn("Project not found");
						res.status(404);
						res.send("Project not found");
						return;
					}
					if (project) {
						var returnProject = project.toJSON();
						var newLink;
						//If user is Submitter or No role
						if (group === config.SUBMITTER || group === "") {
							if (returnProject.submittedEmail === email) {
								returnProject.links = {};
								newLink = config.HTTP_PATH + req.headers.host + "/projects?name=" + returnProject.name;
								returnProject.links.FilterByThisName = newLink.replace(" ", "%20");
								res.status(200);
								res.json(returnProject);
								logger.info("Exiting project getbyId method");
							} else {
								res.status(404);
								res.send("No access to view this project");
								logger.warn("No access to view this project");
							}
						} else {
							returnProject.links = {};
							newLink = config.HTTP_PATH + req.headers.host + "/projects?name=" + returnProject.name;
							returnProject.links.FilterByThisName = newLink.replace(" ", "%20");
							res.status(200);
							res.json(returnProject);
							logger.info("Exiting project getbyId method");
						}
					} else {
						res.status(404);
						res.send("Project not found");
						logger.warn("Project not found");
						return;
					}
				});
			} else {
				res.status(401);
				res.send("No access token");
				logger.warn("No access token");
				return;
			}
		});
	};

	//Editing the project. If the user is 'Submitter', Assessment section is not allowed to edit.
	var put = function (req, res) {
		logger.info("Entering project put method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				Project.findById(req.params.id, function (err, project) {
					if (err || !project) {
						logger.warn("Project not found");
						res.status(500);
						res.send("Project not found");
					} else if (project) {
						var recvdVal = JSON.stringify(response);
						var group = JSON.parse(recvdVal).iss.group;

						var currentTimeStamp = new Date();
						//lastUpdatedDate field is set
						project.lastUpdatedDate = currentTimeStamp;
						//lastUpdatedPerson field is set
						var nuid = JSON.parse(recvdVal).iss._id;
						project.lastUpdatedPerson = nuid;
						// overriding nested attributes to fix failed array merges						
						if (req.body.details) {
							project.details = req.body.details;
							//updatedDate field set for details section
							project.details.updatedDate = currentTimeStamp;
						}
						project.assessment = req.body.assessment;
						if (group != "" && group != config.SUBMITTER) {
							project.assessment.updatedDate = currentTimeStamp;
						}

						if (req.body.comments && (req.body.comments.length != 0)) {
							project.comments = req.body.comments;
						}

						logger.info("The current status is " + project.status);
						logger.info("The new status is " + req.body.status);
						if (req.body.status != project.status) {
							logger.info("Going to set status changed description");
							project.comments.push({
								createdDate: currentTimeStamp,
								updatedDate: currentTimeStamp,
								desc: config.STATUS_DESC1 + project.status + config.STATUS_DESC2 + req.body.status,
								commenter: project.lastUpdatedPerson,
								commentDate: currentTimeStamp
							});
						}

						//If the status is 'New', set defaultSort value which will be used later for sorting in get method.
						switch (req.body.status) {
							case config.PROJ_STATUSES.NEW:
								project.defaultSort = "A";
								break;
							case config.PROJ_STATUSES.UNDER_EMT_REVIEW:
								project.defaultSort = "B";
								break;
							case config.PROJ_STATUSES.UNDER_VP_ADS_REVIEW:
								project.defaultSort = "C";
								break;
							case config.PROJ_STATUSES.APPROVED:
								project.defaultSort = "D";
								break;
							case config.PROJ_STATUSES.DEFERRED:
								project.defaultSort = "E";
								break;
							default:
								project.defaultSort = "A";
								break;
						}

						//update normalized fields for case-insensitive sorting
						req.body.normalizedName = req.body.name.toLowerCase();
						req.body.normalizedRequestorName = req.body.requestorName.toLowerCase();
						req.body.normalizedRequestorEmail = req.body.requestorEmail.toLowerCase();

						_.merge(project, req.body);
						project.save(function (err) {
							if (err) {
								res.status(500);
								res.send(err);
							} else {
								//puwh message to upsert elastic search db 
								pushMessage(project);

								res.status(201);
								res.json(project);
								logger.info("Exiting project put method");
							}
						});
					}
				});
			} else {
				res.status(401);
				res.send("No access token");
				logger.warn("No access token");
			}
		});
	};

	//Removal of project	
	var remove = function (req, res) {
		logger.info("Entering project remove method");
		mw.verifyToken(req, function (request, response) {
			if (response) {
				Project.findByIdAndRemove(req.params.id, function (err, proj) {
					if (err) {
						logger.warn("Project not found");
						res.status(404);
						res.send("Project not found");
					} else {
						if (proj) {
							res.status(200);
							res.json({ info: "Project Removed Successfully" });
							logger.info("Exiting project remove method");
						} else {
							res.status(404);
							res.send("Project not found");
							logger.warn("Project not found");
						}
					}
				});
			} else {
				res.status(401);
				res.send("No access token");
				logger.warn("No access token");
			}
		});
	};

	var pushMessage = function (message) {

		var producerbaseUrl = process.env.producerbaseUrl || "https://search-api-producer.mybluemix.net";
		var endPoint = producerbaseUrl + '/pushProjects/';
		logger.info('endPoint:' + endPoint);
		try {
			request({
				url: endPoint,
				method: "POST",
				headers: {
					"x-access-token": ""
				},
				json: message
			}, function (error, response, body) {	
				logger.info('error: ' + error);
				logger.info('response: ' + response);
				logger.info('body: ' + body);
				if (!error && response.statusCode == 200) {
					logger.info('Message sent' + message);
				} else {
					logger.info('Error sending message' + error);
				}
			});
		}
		catch (err) {
			logger.info('Error sending message' + err);
		}
	};

	return {
		post: post,
		get: get,
		getbyId: getbyId,
		put: put,
		remove: remove
	};
};

module.exports = projectController;
