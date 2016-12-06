var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('map');
});


//Renders the new project page where PM can add projects
router.get('/new', function(req, res){
  res.render('new-project');
})

//Gets all projects from the DB
router.get('/projects', function(req, res){
  var featureCollection = {
      "type": "FeatureCollection",
      features: []
  };
  models.Project.findAll().then(function(data){
    // console.log(data[1].uid);
    for (var i = 0; i < data.length; i++) {
      var newGeo = {
          type: "Feature",
          properties: {
            UID: data[i].uid,
            title: data[i].project_title,
            description: data[i].project_description
          },
          geometry: data[i].geometry
      }
      featureCollection.features.push(newGeo);
    }
    res.send(featureCollection);
  });
});

//Saves a new project to the DB
router.post('/new', function(req, res){
  var newProject = req.body;
  var geometry = JSON.parse(newProject.Geometry);
  var coordinates = JSON.parse (geometry.coordinates);
  var parsedGeometry = {
    type: geometry.type,
    coordinates: coordinates
  }
  newProject.Geometry = parsedGeometry;
  var contactInfo = JSON.parse(newProject.Contact_info);
  newProject.Contact_info = contactInfo;

  if (newProject.Fund_St === "Funded") {
    models.Funded.create(newProject).then(function(newFunded){
      models.Detail.create(newProject).then(function(newDetail){
        newFunded.setDetail(newDetail).then(function(){
          res.send({"success": "Yes!"});
        });
      });
    });
  } else {
    models.Unfunded.create(newProject).then(function(newUnfunded){
      models.Detail.create(newProject).then(function(newDetail){
        newUnfunded.setDetail(newDetail).then(function(){
          res.send({"success": "Yes!"});
        });
      });
    });
  }
});

module.exports = router;
