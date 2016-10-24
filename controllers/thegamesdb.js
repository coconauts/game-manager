var http = require('http');
var xml2js = require('xml2js'); //https://github.com/Leonidas-from-XIV/node-xml2js
var utils = require('../helpers/utils.js');
var request = require('superagent');

// increase pool size
http.globalAgent.maxSockets = 100;

var search = function(name, platform, res, db) {
    var gameDbPlatform = platformToThegamesdb(platform);
    searchGame(name, gameDbPlatform, function(result) {
        if (result.status == "error") {
            console.log("Unable to download description: " + result.msg);
            res.json(result);
        } else {

            var game = getExactGame(result.result.Game, name);

            if (game) {
                var info = toInfo(game, platform);
                saveAndReturnInfo(info, res, db);
            } else {
                res.json({
                    status: "error",
                    msg: "Unable to get game " + game
                });
            }
        }
    });
};
module.exports = {
    routes: function(app) {
        app.get('/downloadInfo', function(req, res) {
            var name = req.query.g,
                platform = req.query.p;

            name = utils.sanitize(name);
            search(name, platform, res, db);
        });
    },
    search: search,
    downloadImage: function(name, platform, callback) {
        console.log("Downloading cover from thegamesdb " + name);
        var gameDbPlatform = platformToThegamesdb(platform),
            startTime = Date.now();

        var searchImageCallback = function(result) {
            if (result.status == "error") {
                var msg = "Unable to download image: " + result.msg;
                callback(msg);
            } else {
                try {
                    var base = result.result.baseImgUrl,
                        game = getExactGame(result.result.Game, name),
                        images = game.Images[0],
                        image = "";

                    console.log("base image " + base);

                    if (images.screenshot) image = images.screenshot[0].original[0]._;
                    else if (images.boxart) image = images.boxart[0]._; //1 should be the front side
                    else image = images.clearlogo[0]._;

                    callback(false, base + image);

                } catch (e) {
                    var msg = "No images for " + name + " " + JSON.stringify(game);
                    callback(msg);
                }
            }
        };

        searchGame(name, gameDbPlatform, searchImageCallback);
    }
};

function toInfo(game, platform) {

    var info = {
        name: game.GameTitle[0],
        platform: platform,
        thegamesdbId: game.id[0],
    };

    //optional values
    if (game.Overview) info.description = game.Overview[0];
    if (game.ReleaseDate) info.releaseDate = game.ReleaseDate[0];
    if (game.Developer) info.developer = game.Developer[0];
    if (game.Rating) info.rating = game.Rating[0];

    return info;
}

function saveAndReturnInfo(info, res, db) {
    console.log("Saving game info " + info.name + " " + info.platform);

    db.run("INSERT INTO info (name,thegamesdbId,platform,description,releaseDate,developer,rating) VALUES (?,?,?,?,?,?,?)", [info.name, info.thegamesdbId, info.platform, info.description, info.releaseDate, info.developer, info.rating]);

    res.json(info);
}

function getExactGame(games, name) {

    var names = "";
    var game;

    for (var i=0; i < games.length; i++) {
        var gameResult = games[i],
            gamedbName = gameResult.GameTitle[0];

        if (name.toUpperCase() == gamedbName.toUpperCase()) game = gameResult;
        else names += gamedbName + ", ";
    }

    if (!game) console.log("Unable to match game '" + name + "' in " + names);
    return game;
}

function searchGame(name, platform, callback) {

    var uri = 'http://thegamesdb.net' + encodeURI("/api/GetGame.php?name=" + name + "&platform=" + platform);

    request
      .get( uri )
      .buffer(true)
      .end(function(err, res ){

        if (!res) {
          console.log("Undefined response from thegamesdb ", res);
         callback(err);
        } else {
          xml2js.parseString(res.text, function(err, result) {
              if (result.Data.Game === undefined) {
                  var msg = "no games with the name '" + name + "'";
                  callback({
                      status: "error",
                      msg: msg
                  });
              } else {
                  callback({
                      status: "success",
                      result: result.Data
                  });
              }
          });
        }

      });
}

function platformToThegamesdb(platform) {
    switch (platform) {
        case "Dos":
            return "PC";
        case "Windows":
            return "PC";
        case "ScummVM":
            return "PC";
        default:
            return platform;
    }
}
