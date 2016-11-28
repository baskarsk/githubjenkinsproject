

# Project Intake API

* Backend REST API for Intake Project.

* Exposes the following REST Endpoints 

### Projects endpoint

```
POST   /projects
```
```
GET    /projects 
```
```
GET    /projects/id
```
```
PUT    /projects/id
```
```
DELETE /projects
```

### Services endpoint

```
POST   /services
```
```
GET    /services 
```
```
GET    /services/id
```
```
PUT    /services/id
```
```
DELETE /services
```

### Regions endpoint

```
POST   /regions
```
```
GET    /regions 
```
```
GET    /regions/id
```
```
PUT    /regions/id
```
```
DELETE /regions
```

## Configure Regions and Services

Region and ADS Impacted Service options are dynamically created in the client project form. These options are saved in
the database and served through the API.

* If initializing a local database, ensure that MongoDB is running and available at localhost, then Regions and ADS
Impacted Service options can be inserted with the following gulp task:

```
gulp db
```

WARNING: Running this command will delete all Regions and ADS Impacted Services from the database.

* Alternatively create Regions or ADS Impacted Service options using the API POST requests. The POST request body can either
contain a single object or array of objects. The default options are configured in the JSON files under the /data folder
and can be copied and used as the request body.

* To modify or delete Regions or ADS Impacted Service options, issue requests to the /regions or /services API endpoints.

WARNING: Removing or changing the name of an ADS Impacted Service option will cause existing projects to lose data.
The option names are saved instead of a unique identifier. If the option name changes, the project record no longer has a
reference to the ADS Impacted Service option. The selected options will be replaced once the project is updated, therefore
losing any reference to the previously selected values.

## Running it locally 

* clone repository locally 

```
git clone "repo"
```

* install modules

```
npm install 
```

* Install Development dependencies modules and save for environment 

```
npm install supertest gulp-env --save-dev
```

* running application

```
gulp
```

* testing application

```
gulp test 
```
  
##Adding the Compose for MongoDB Service in Bluemix

* Follow instructions in https://new-console.ng.bluemix.net/catalog/services/mongodb-by-compose

* Add the MongoDB Service by Compose in your Bluemix console.

## Deployment

### Manifest.yml file changes for Kaiser 
  domain: bmxnp.appl.kp.org
  platform: Bluemix
  organization: Kaiser
  authdomain: cs.msds.kp.org
  serverdomain: bmxnp.appl.kp.org
  vipAddress: project-api-client
  eurekaServer: eureka.bmxnp.appl.kp.org
  eurekaPort: 80
  statusUrl: https://project-api.bmxnp.appl.kp.org/info
  producerbaseUrl: https://search-api-producer.mybluemix.net


### Steps to Deploy 

* set endpoint and login

```
bluemix api https://api.ng.bluemix.net
```

* login

```
  bluemix login -u "your userid"
```

* set orgs and spaces

```
  cf target -o "your organization"

  cf target -s "your space"
```

* deploying application.

  Modify the manifest.yml with the name you used for MongoDB Service

```
  cf push
```
* Note that if you haven't added the service the bind may not happen and you may need to restage

```
  cf restage
```


###  Verifying logs 

* Bluemix console may not show all logs during application startup. 

* Use the cf logs command from command line to verify logs 

```
  cf logs "project name" 
```
