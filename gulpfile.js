var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var gulpmocha = require('gulp-mocha');
var env = require('gulp-env');
var supertest = require('supertest');

gulp.task('default', function () {
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: {
            PORT: 8000
        },
        ignore: ['./node_modules']
    })
        .on('restart', function () {
            console.log('Restarting');
        });
});

gulp.task('test', function () {
    env({
        vars: {
            ENV: 'Test',
            SUBMITTED_EMAIL_FOR_ADMIN: 'santhosh@cognizant.com',
            ACCESS_TOKEN_ADMIN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOlt7Il9pZCI6ImFkbWluMUBnbWFpbC5jb20iLCJncm91cCI6IkFkbWluIn1dLCJleHAiOjE0NzgwNzM2Nzg4MTMsImlhdCI6MTQ3ODA3MDA3OH0.G4pD53vgxVGnYwPFA2zAHdU9GwxYYslC1v7Dsf6qOwk',
            SUBMITTED_EMAIL_FOR_SUBMITTER: 'janaki@cognizant.com',
            ACCESS_TOKEN_SUBMITTER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOlt7Il9pZCI6ImphbmFraUBjb2duaXphbnQuY29tIiwiZ3JvdXAiOiJTdWJtaXR0ZXIifV0sImV4cCI6MTQ3ODA3MzgxNTE1OSwiaWF0IjoxNDc4MDcwMjE1fQ.JAJoGxArFPq87qjitY4AdWNM8-irCi0lJFIWf1aLnO8',
        }
    });
    gulp.src('tests/*.js', { read: false })
        .pipe(gulpmocha({ 'reporter': 'nyan' }))

});

gulp.task('db', function () {
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/project');

    var db = {
        connection: mongoose.connection
    };

    require('./models/region');
    require('./models/service');

    var scenario = require('gulp-mongoose-scenario');
    gulp.src('models/scenarios/**/*.json')
        .pipe(scenario({ connection: db.connection, nuke: true }))
        .on('end', function () {
            db.connection.close();
        });
});
