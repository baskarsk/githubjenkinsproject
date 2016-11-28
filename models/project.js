//var dbJs = require('./db.js');

var mongoose = require("mongoose");

//Schema for Project
var projectSchema = mongoose.Schema({
	projectId: String,
	name: String,
	normalizedName: String,
	priority: String,
	fundingApproved: String,
	requestorName: String,
	normalizedRequestorName: String,
	requestorEmail: String,
	normalizedRequestorEmail: String,
	submittedEmail: String,     //or NUID    
	submittedDate: Date,  //project submitted date(creation timestamp)
	status: String,
	defaultSort: String,
	lastUpdatedDate: Date, //project last updated date
	lastUpdatedPerson: String, //person who last updated project
	details: {
		createdDate: Date, //created date
		updatedDate: Date, //updated date
		anticipatedBudget: String,
		requestedStartDate: String,
		requestedEndDate: String,
		projectTypes: [String],
		kpAlignedStrategicInitiative: String,
		scope: String,
		reason: String,
		executiveSponsor: String,
		businessSponsor: String,
		applicationsImpacted: [String],
		departmentsImpacted: [String],
		regionsImpacted: [String],
		servicesImpacted: {
			applicationDevelopment: [String],
			technologyArchitecture: [String],
			usabilityCenter: [String],
			testingQualityManagement: [String],
			serviceManagement: [String],
		}
	},
	assessment: {
		createdDate: Date, //created date
		updatedDate: Date, //updated date
		emtLead: String,
		emtPrimaryOwner: String,
		emtManager: String,
		emtTeamsImpacted: [String],
		projectType: String,
		budget: [
			{
				benefitAmount: String,
				benefitDescription: String
			}
		]
	},
	comments: [
		{
			createdDate: Date, //created date
			updatedDate: Date, //updated date
			desc: String,
			commentDate: Date,
			commenter: String
		}
	]
});

projectSchema.index({ "$**": "text" }); //For generic text search
module.exports = mongoose.model("Projects", projectSchema);
