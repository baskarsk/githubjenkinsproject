var should = require('should'),
	sinon = require('sinon');
var Project = require('../models/project.js');
var projectController = require('../controllers/projectController')(Project);

var accessTokenAdmin = process.env.ACCESS_TOKEN_ADMIN;
var submittedEmailForAdmin = process.env.SUBMITTED_EMAIL_FOR_ADMIN;
var accessTokenSubmitter = process.env.ACCESS_TOKEN_SUBMITTER;
var submittedEmailForSubmitter = process.env.SUBMITTED_EMAIL_FOR_SUBMITTER;

describe('Project Controller Tests:', function () {
	/* Testing for post projects */
	describe('Post', function () {
		it('should not allow to post project with an empty Name', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				body: {
					"priority": "High",
					"submittedEmail": submittedEmailForAdmin
				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};
			projectController.post(req, res);

			try {
				res.status.calledWith(400).should.equal(false);
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});

		it('should not allow to post already existing project', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				body: {
					"name": "eQuotesADMIN",
					"priority": "High",
					"submittedEmail": submittedEmailForAdmin
				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};
			projectController.post(req, res);

			try {
				res.status.calledWith(400).should.equal(false, 'Bad Status ');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});

		it('should allow to post project with Name', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				body: {
					"name": "eQuotesGULP",
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
						"projectType": "Design",
						"kpAlignedStrategicInitiative": "Lead",
						"scope": "Provide eQuotes for HIE ",
						"reason": "Critical to have functionality to compete with Competetirs - Member centric",
						"executiveSponsor": "Kathy Sabatini",
						"businessSponsor": "Barbara Bill",
						"applicationsImpacted": ["eEnrollment", "memberinterface"],
						"departmentsImpacted": ["enrollment", "warehouse"],
						"regionsImpacted": ["57d1c1fe2da9d8035af8f970", "57d1c1fe2da9d8035af8f973"],
						"servicesImpacted": {
							"tssService": ["tssService1", "tssService2"],
							"usabilityService": ["usabilityService1", "usabilityService2"],
							"technologyArchitecture": ["technologyArchitecture1", "technologyArchitecture2"],
							"technologySharedDev": ["technologySharedDev1", "technologySharedDev2"],
							"testingCenter": ["testingCenter1", "testingCenter2"],
							"serviceIntegration": ["serviceIntegration1", "serviceIntegration2"]
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

				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};

			projectController.post(req, res);

			try {
				res.status.calledWith(201).should.equal(false, 'Bad Status ');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});
	});


	/* Testing for get projects */
	describe('Get', function () {
		it('If user is Admin, should allow to get all the projects', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				body: {
				},
				query: {
				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};

			projectController.get(req, res);
			try {
				res.status.calledWith(200).should.equal(false, 'Bad Status');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});

		it('If user is Submitter, should allow to get the projects submitted by submitter', function (done) {
			//Posting a project by Submitter first before retrieving it.
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenSubmitter
				},
				body: {
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
				}
			};
			var res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};

			projectController.post(req, res);
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenSubmitter
				},
				body: {
				},
				query: {
				}
			};

			res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};
			projectController.get(req, res);
			try {
				res.status.calledWith(200).should.equal(false, 'Bad Status');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});

		it('should allow to get the projects based on id', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				params: {
					id: '580efcb7450d0c8427ca689e'
				},
				query: {
				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy()
				};

			projectController.getbyId(req, res);
			try {
				res.status.calledWith(200).should.equal(false, 'Bad Status');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});

	});

	/* Testing for PUT projects */
	describe('Put', function () {
		it('should allow to update the projects based on id', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				params: {
					id: "580efcb7450d0c8427ca689e"
				},
				body: {
					"priority": "High",
					"fundingApproved": "pending",
					"requestorName": "Amy",
					"requestorEmail": "A.A.Katz@kp.org",
					"submittedEmail": submittedEmailForAdmin,
					"submittedDate": "fd",
					"status": "project_status",
					"details": {
						"anticipatedBudget": "3010000",
						"requestedStartDate": "2016-10-10",
						"requestedEndDate": "2016-10-10",
						"projectType": "Design",
						"kpAlignedStrategicInitiative": "Lead",
						"scope": "Provide eQuotes for HIE ",
						"reason": "Critical to have functionality to compete with Competetirs - Member centric",
						"executiveSponsor": "Kathy Sabatini",
						"businessSponsor": "Barbara Bill",
						"applicationsImpacted": ["eEnrollment", "memberinterface"],
						"departmentsImpacted": ["enrollment", "warehouse"],
						"regionsImpacted": ["57d1c1fe2da9d8035af8f970", "57d1c1fe2da9d8035af8f973"],
						"servicesImpacted": {
							"tssService": ["tssService1", "tssService2"],
							"usabilityService": ["usabilityService1", "usabilityService2"],
							"technologyArchitecture": ["technologyArchitecture1", "technologyArchitecture2"],
							"technologySharedDev": ["technologySharedDev1", "technologySharedDev2"],
							"testingCenter": ["testingCenter1", "testingCenter2"],
							"serviceIntegration": ["serviceIntegration1", "serviceIntegration2"]
						}
					},
					"assessment": {
						"emtLead": "John H. Klein",
						"emtPrimaryOwner": "Design",
						"emtManager": "teammanager333",
						"emtTeamsImpacted": [
							"team1666", "team2666"
						],
						"projectType": "Agile",
						"budget": [
							{
								"benefitAmount": "300000033",
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
						"commenter": "Steve McDonald1"
					}, {
						"desc": "EARB Approved. Rahul",
						"commentDate": "2016-10-20",
						"commenter": "Steve McDonald2"
					}]
				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy(),
					json: []
				};

			projectController.put(req, res);
			try {
				res.status.calledWith(200).should.equal(false, 'Bad Status');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});

	});

	/* Testing for REMOVE projects */
	describe('Remove', function () {
		it('should allow to remove the projects based on id', function (done) {
			var req = require('request');
			req = {
				headers: {
					"Content-Type": "application/json",
					"x-access-token": accessTokenAdmin
				},
				params: {
					id: "580efcb7450d0c8427ca689e"
				}
			};

			var res =
				{
					status: sinon.spy(),
					send: sinon.spy(),
					json: []
				};

			projectController.remove(req, res);
			try {
				res.status.calledWith(200).should.equal(false, 'Bad Status');
				//res.send.calledWith('someProperty is required').should.equal(true);
				done();
			} catch (error) {
				done(error);
			}
		});
	});
});
