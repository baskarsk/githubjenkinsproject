//------------------------------------------------------------------------------
// node.js MongoDB Backend API Starter example for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
var express = require("express");
// create a new express server
var app = express();

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable("trust proxy");

// body parser
var bodyParser = require("body-parser");
//path
var path = require("path");
// cfenv provides access to your Cloud Foundry environment
var cfenv = require("cfenv");

// get the app environment from Cloud Foundry
// Node server details
var appEnv = cfenv.getAppEnv();
var port = appEnv.port || "8000";
var routeUrl = appEnv.bind || "localhost";
var appName = appEnv.name || "project-api";
var serverdomain = process.env.serverdomain || "mybluemix.net";
var hostName = appName + "." + serverdomain;
var vipAddress = process.env.vipAddress || "project-api-client.mybluemix.net";
var eurekaServer = process.env.eurekaServer || "localhost";
var eurekaPort = process.env.eurekaPort || 80;
var statusUrl = process.env.statusUrl || "http://localhost:8001";

var config = require("./config.json");
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

//eureka 
const Eureka = require("eureka-js-client").Eureka;

// example configuration 
const client = new Eureka({
	instance: {
		app: appName,
		hostName: hostName,
		ipAddr: "127.0.0.1",
		port: {
			"$": process.env.PORT || "8001",
			"@enabled": true,
		},
		vipAddress: vipAddress,
		dataCenterInfo: {
			"@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
			name: "MyOwn",
		},
		statusPageUrl: statusUrl,
	},
	eureka: {
		host: eurekaServer,
		port: eurekaPort,
		servicePath: "/eureka/apps/",
	},
});

client.logger.level("debug");

client.start((error) => {
	logger.info(error || "complete");
});

// Bind mongodb connection
var mongoUrl = appEnv.getServiceURL("kaiser-project-mongodb");
//var mongoService = appEnv.getService('kaiser-project-mongodb');
//console.log('mongoUrl:'+ mongoUrl);
//console.log('mongoService:'+ mongoService);

var mongoose = require("mongoose");
var cors = require("cors");

if (mongoUrl == null) {
	//local development
	mongoose.Promise = global.Promise;
	//mongoose.connect('mongodb://localhost/project');
	//Mocha test 
	if (process.env.ENV == "Test") {
		mongoose.connect("mongodb://localhost/project_test");
	} else {
		mongoose.connect("mongodb://localhost/project");
	}
} else {
	//Bluemix cloud foundry - Compose service connection
	//var mongooseUrl = 'mongodb://' + mongoService.credentials.username + ':' + mongoService.credentials.password + '@' + mongoService.credentials.uri + ':' + mongoService.credentials.port + '/project'

	//URI Incompatibility in Compose mongodb service versions
	//var mongooseUrl = mongoService.credentials.url;
	//mongooseUrl = mongooseUrl.replace('/db', '/project');

	mongoose.Promise = global.Promise;
	//mongoose.connect(mongooseUrl);
	mongoose.connect(mongoUrl, function (err) {
		if (err) {
			logger.info("ERROR connecting to: " + mongoUrl + ". " + err);
		} else {
			logger.info("Succeeded connected ");
		}
	});
}

// enables CORS on preflight requests
app.options("*", cors());
// enables CORS on all other requests
app.use("/", cors());

//JSON body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use(function (req, res, next) {
	if (req.secure || req.headers.host.includes("localhost")) {
		// request was via https, so do no special handling
		next();
	} else {
		// request was via http, so redirect to https
		res.redirect("https://" + req.headers.host + req.url);
	}
});

// For index.html
app.use(express.static(path.join(__dirname, "www")));

//eureka code
app.get("/info", function (req, res) {
	res.status(200).send("Response from security-api microservice at " + getDateTime());
});

//project route
require("./routes/project.js")(app);

//services route
require("./routes/service.js")(app);

//project route
require("./routes/region.js")(app);

//eureka code
app.get("/deregister-eureka", function (req, res) {
	client.stop((error) => {
		if (!error) {
			res.status(200).send("Client successfully deregistered");
		} else {
			res.status(404).send("Oops... some error occured");
		}
	});
});

app.get("/service-instances/:applicationName", function (req, res) {
	res.status(200).send(client.getInstancesByAppId(req.params.applicationName));
});

// start server on the specified port and binding host
app.listen(port, routeUrl, function () {
	logger.info("Gulp server starting on " + routeUrl + ":" + port);
});


function getDateTime() {
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var sec = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;
	var day = date.getDate();
	day = (day < 10 ? "0" : "") + day;
	return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

//export app for supertest 
module.exports = app;
