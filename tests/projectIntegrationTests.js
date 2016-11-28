var should = require('should'),
	request = require('supertest'),
	app = require('../app.js'),
	mongoose = require('mongoose'),
	Projects = mongoose.model('Projects'),
	agent = request.agent(app);

var projectId;
var accessTokenAdmin = process.env.ACCESS_TOKEN_ADMIN;
var submittedEmailForAdmin = process.env.SUBMITTED_EMAIL_FOR_ADMIN;
var accessTokenSubmitter = process.env.ACCESS_TOKEN_SUBMITTER;
var submittedEmailForSubmitter = process.env.SUBMITTED_EMAIL_FOR_SUBMITTER;

describe('Projects Crud Test', function () {
	it('Should allow a Project to be posted and return _id', function (done) {
		var projectsPost = {
			"x-access-token": accessTokenAdmin,
			"name": "eQuotes GULP",
			"priority": "High",
			"fundingApproved": "pending",
			"requestorName": "Amy",
			"requestorEmail": "A.A.Katz@kp.org",
			"submittedEmail": submittedEmailForAdmin,
			"submittedDate": "2016-10-09",
			"status": "project_status",
			"details": {
				"anticipatedBudget": "3010000",
				"requestedStartDate": "2016-10-10",
				"requestedEndDate": "2016-10-10",
				"projectType": ["Design", "Development"],
				"kpAlignedStrategicInitiative": "Lead",
				"scope": "Provide eQuotes for HIE ",
				"reason": "Critical to have functionality to compete with Competetirs - Member centric",
				"executiveSponsor": "Kathy Sabatini",
				"businessSponsor": "Barbara Bill",
				"applicationsImpacted": ["eEnrollment", "memberinterface"],
				"departmentsImpacted": ["enrollment", "warehouse"],
				"regionsImpacted": ["57d1c1fe2da9d8035af8f970", "57d1c1fe2da9d8035af8f973"],
				"servicesImpacted": {

					"applicationDevelopment": ["AppDev1", "AppDev2"],
					"technologyArchitecture": ["TechArch1", "TechArch2"],
					"usabilityCenter": ["UsabCenter1", "UsabCenter2"],
					"testingQualityManagement": ["TestQM1", "TestQM2"],
					"serviceManagement": ["SM1", "SM2"]
				}
			},
			"assessment": {
				"emtLead": "John H. Klein",
				"emtPrimaryOwner": "Design",
				"emtManager": "teammanager",
				"emtTeamsImpacted": [
					"team1", "team2"
				],
				"projectType": "Agile",
				"budget": [
					{
						"benefitAmount": "3000000",
						"benefitDescription": "Legacy cost savings"
					}, {
						"benefitAmount": "780000",
						"benefitDescription": "Print savings"
					}, {
						"benefitAmount": "9200000",
						"benefitDescription": "Removing HP Support for DST Support"
					}
				]
			},
			"comments": [{
				"desc": "Needs to be reviewed by EA",
				"commentDate": "2016-10-18",
				"commenter": "Steve McDonald"
			}, {
				"desc": "EARB Approved. Rahul",
				"commentDate": "2016-10-20",
				"commenter": "Steve McDonald"
			}]
		};

		agent.post('/projects')
			.send(projectsPost)
			.set(projectsPost)
			.expect(201)
			.expect('Content-Type', /json/)
			.end(function (err, results) {
				if (results != null) {// && results.length >0){
					console.log("Result is \n\n\n" + JSON.stringify(results));
					projectId = results.body._id;
					if (results.body != null && results.body.name != null) {
						results.body.name.should.equal('eQuotes GULP');
						results.body.should.have.property('_id');
					}
				}
				if (err) {
					done(err);
				} else {
					done();
				}
			});

	});

	it('Should allow to get all Projects if the user is Admin', function (done) {
		var projectsPost = {
			"x-access-token": accessTokenAdmin
		};

		agent.get('/projects')
			.send(projectsPost)
			.set(projectsPost)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err, results) {
				if (results != null) {
					console.log("Result is \n\n\n" + JSON.stringify(results));
				}
				if (err) {
					done(err);
				} else {
					done();
				}
			});

	});

	it('Should allow to get the Project based on the id', function (done) {
		var id = "";
		if (projectId != 'undefined') {
			id = projectId
		} else {
			id = '';
		}
		var projectsPost = {
			"Content-Type": "application/json",
			"x-access-token": accessTokenAdmin
		};
		agent.get('/projects/' + id)
			.send(projectsPost)
			.set(projectsPost)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err, results) {
				if (results != null) {
					console.log("Result is \n\n\n" + JSON.stringify(results));
				}
				if (err) {
					done(err);
				} else {
					done();
				}
			});

	});

	it('Should allow a Project to be updated and return _id', function (done) {
		var id = "";
		if (projectId != 'undefined') {
			id = projectId
		} else {
			id = '';
		}
		var projectsPost = {
			"x-access-token": accessTokenAdmin,
			"priority": "High_Updated",
			"fundingApproved": "pending_Updated",
			"requestorName": "Amy_Updated",
			"requestorEmail": "A.A.Katz@kp.org",
			"submittedEmail": submittedEmailForAdmin,
			"submittedDate": "2016-10-09",
			"status": "project_status_Updated",
			"details": {
				"anticipatedBudget": "3010000_Updated",
				"requestedStartDate": "2016-10-10_Updated",
				"requestedEndDate": "2016-10-10_Updated",
				"projectType": ["Design_Updated", "Development_Updated"],
				"kpAlignedStrategicInitiative": "Lead_Updated",
				"scope": "Provide eQuotes for HIE _Updated",
				"reason": "Critical to have functionality to compete with Competetirs - Member centric_Updated",
				"executiveSponsor": "Kathy Sabatini_Updated",
				"businessSponsor": "Barbara Bill_Updated",
				"applicationsImpacted": ["eEnrollment_Updated", "memberinterface_Updated"],
				"departmentsImpacted": ["enrollment_Updated", "warehouse_Updated"],
				"regionsImpacted": ["57d1c1fe2da9d8035af8f970_Updated", "57d1c1fe2da9d8035af8f973_Updated"],
				"servicesImpacted": {

					"applicationDevelopment": ["AppDev1_Updated", "AppDev2_Updated"],
					"technologyArchitecture": ["TechArch1_Updated", "TechArch2_Updated"],
					"usabilityCenter": ["UsabCenter1_Updated", "UsabCenter2_Updated"],
					"testingQualityManagement": ["TestQM1_Updated", "TestQM2_Updated"],
					"serviceManagement": ["SM1_Updated", "SM2_Updated"]
				}
			},
			"assessment": {
				"emtLead": "John H. Klein_Updated",
				"emtPrimaryOwner": "Design_Updated",
				"emtManager": "teammanager_Updated",
				"emtTeamsImpacted": [
					"team1_Updated", "team2_Updated"
				],
				"projectType": "Agile_Updated",
				"budget": [
					{
						"benefitAmount": "3000000_Updated",
						"benefitDescription": "Legacy cost savings_Updated"
					}, {
						"benefitAmount": "780000_Updated",
						"benefitDescription": "Print savings_Updated"
					}, {
						"benefitAmount": "9200000_Updated",
						"benefitDescription": "Removing HP Support for DST Support_Updated"
					}
				]
			},
			"comments": [{
				"desc": "Needs to be reviewed by EA_Updated",
				"commentDate": "2016-10-18_Updated",
				"commenter": "Steve McDonald_Updated"
			}, {
				"desc": "EARB Approved. Rahul_Updated",
				"commentDate": "2016-10-20_Updated",
				"commenter": "Steve McDonald_Updated"
			}]
		};

		agent.put('/projects/' + id)
			.send(projectsPost)
			.set(projectsPost)
			.expect(201)
			.expect('Content-Type', /json/)
			.end(function (err, results) {
				if (results != null) {
					console.log("Result is \n\n\n" + JSON.stringify(results));
				}
				if (err) {
					done(err);
				} else {
					done();
				}
			});
	});

	it('should allow to remove the projects based on id', function (done) {
		var id = "";
		if (projectId != 'undefined') {
			id = projectId
		} else {
			id = '';
		}
		var projectsPost = {
			"x-access-token": accessTokenAdmin
		};

		agent.delete('/projects/' + id)
			.send(projectsPost)
			.set(projectsPost)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function (err, results) {
				if (results != null) {
					console.log("Result is \n\n\n" + JSON.stringify(results));
				}
				if (err) {
					done(err);
				} else {
					done();
				}
			});

	});

	it('Should allow to get those Projects submitted by the user alone, if the user is Submitter', function (done) {
		//Posting a project by Submitter first before retrieving it.
		var projectsPost = {
			"x-access-token": accessTokenSubmitter,
			"name": "eQuotes GULP SUB",
			"priority": "High",
			"fundingApproved": "pending",
			"requestorName": "Amy",
			"requestorEmail": "A.A.Katz@kp.org",
			"submittedEmail": submittedEmailForSubmitter,
			"submittedDate": "2016-10-09",
			"status": "project_status",
			"details": {
				"anticipatedBudget": "3010000",
				"requestedStartDate": "2016-10-10",
				"requestedEndDate": "2016-10-10",
				"projectType": ["Design", "Development"],
				"kpAlignedStrategicInitiative": "Lead",
				"scope": "Provide eQuotes for HIE ",
				"reason": "Critical to have functionality to compete with Competetirs - Member centric",
				"executiveSponsor": "Kathy Sabatini",
				"businessSponsor": "Barbara Bill",
				"applicationsImpacted": ["eEnrollment", "memberinterface"],
				"departmentsImpacted": ["enrollment", "warehouse"],
				"regionsImpacted": ["57d1c1fe2da9d8035af8f970", "57d1c1fe2da9d8035af8f973"],
				"servicesImpacted": {

					"applicationDevelopment": ["AppDev1", "AppDev2"],
					"technologyArchitecture": ["TechArch1", "TechArch2"],
					"usabilityCenter": ["UsabCenter1", "UsabCenter2"],
					"testingQualityManagement": ["TestQM1", "TestQM2"],
					"serviceManagement": ["SM1", "SM2"]
				}
			},
			"assessment": {
				"emtLead": "John H. Klein",
				"emtPrimaryOwner": "Design",
				"emtManager": "teammanager",
				"emtTeamsImpacted": [
					"team1", "team2"
				],
				"projectType": "Agile",
				"budget": [
					{
						"benefitAmount": "3000000",
						"benefitDescription": "Legacy cost savings"
					}, {
						"benefitAmount": "780000",
						"benefitDescription": "Print savings"
					}, {
						"benefitAmount": "9200000",
						"benefitDescription": "Removing HP Support for DST Support"
					}
				]
			},
			"comments": [{
				"desc": "Needs to be reviewed by EA",
				"commentDate": "2016-10-18",
				"commenter": "Steve McDonald"
			}, {
				"desc": "EARB Approved. Rahul",
				"commentDate": "2016-10-20",
				"commenter": "Steve McDonald"
			}]
		};

		agent.post('/projects')
			.send(projectsPost)
			.set(projectsPost)
			.expect(201)
			.expect('Content-Type', /json/)
			.end(function (err, results) {
				if (results != null) {// && results.length >0){
					console.log("Result is \n\n\n" + JSON.stringify(results));
					projectsPost = {
						"x-access-token": accessTokenSubmitter
					};
					agent.get('/projects')
						.send(projectsPost)
						.set(projectsPost)
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function (err, results) {
							if (results != null) {
								console.log("Result is \n\n\n" + JSON.stringify(results));
								Projects.remove().exec();
							}
							if (err) {
								done(err);
							} else {
								done();
							}
						});
				}
			});
	});

    /*   afterEach(function(done){
        Projects.remove().exec();
        done();
    });  */
});
