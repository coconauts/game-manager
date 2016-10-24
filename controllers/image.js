var fs = require('fs');
var request = require('superagent');
var utils = require('../helpers/utils.js');
var thegamesdb = require('../controllers/thegamesdb.js');

var secureImageSearch = function(q, hash, callback){

  var extraArgs = "&l=wt-wt&o=json&vqd="+hash+"&f=";
  var url = "https://duckduckgo.com/i.js?&q=" + q+ extraArgs;

  console.log("Searching "+url);

   request
     .get( url )
     .buffer(true)
     .end(function(err, res ){
        if (err || !res) {
          console.error("Error response from DDG "+ err);
         callback(err);
        } else {
          try{
            //log.info("DDG image response" + JSON.stringify(res) ) ;
            var json = JSON.parse(res.text);
            if (json.results){
              callback(undefined, json.results[0].image);
            } else {
              callback("Unable to get images from DDG: no results");
            }
        } catch (e){
          var msg = "Unable to get images from DDG: "+e;
          console.error(msg, e);
          callback(msg);
        }
      }
  });
};


var downloadImage = function(name, callback) {

    //https://ajax.googleapis.com/ajax/services/search/images?safe=off&v=1.0&rsz=8&q=
    var startTime = Date.now();
    var url = "https://duckduckgo.com/i.js?o=json&q=" + encodeURI(name);

    console.log("Searching " + url);

    request
        .get("https://duckduckgo.com/?q="+name+"&t=vivaldi&iax=1&ia=images")
        .end(function(err, res ){
          var body = res.text;
          //We need to filter the key on the code `vqd='327358238202064368347621428791274365820';`
          var hash = body.substr(body.indexOf('vqd=')+5).split("'")[0];

          secureImageSearch(name, hash, callback);
      });

};

module.exports = {
    routes: function(app) {

        app.get("/image", function(req, res) {

            var path = req.query.path;
            var img = fs.readFileSync(path);

            res.end(img, 'binary');
        });

        app.get('/downloadCover', function(req, res) {
            var file = req.query.f,
                platform = req.query.p,
                name = req.query.g;

            sanitizedName = utils.sanitize(name);

            db.get("select * from platform where platform = ? ", [platform], function(err, row) {
                var path = row.covers + name + ".png";

                thegamesdb.downloadImage(sanitizedName, platform, function(error, url) {
                    if (error) {
                        console.log("Unable to download cover from thegamesdb " + error);
                        downloadImage(platform + " " + name + " gameplay", function(error, url) {
                            if (error) res.json(error);
                            else utils.saveImage(url, path, function(url) {
                                res.json(url);
                            });
                        });
                    } else utils.saveImage(url, path, function(url) {
                        res.json(url);
                    });
                });
            });
        });
    },

};
