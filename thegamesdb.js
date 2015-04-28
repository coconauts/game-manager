var http = require('http'),
    xml2js = require('xml2js'); //https://github.com/Leonidas-from-XIV/node-xml2js

// increase pool size
http.globalAgent.maxSockets = 100;

module.exports = {
    search: function (name,platform,res,db){
        var gameDbPlatform = platformToThegamesdb(platform);
        searchGame (name,gameDbPlatform, function(result){
            if (result.status == "error"){
                console.log("Unable to download description: "+result.msg);
                res.json(result);
            } else {

                var game = getExactGame(result.result.Game,name);

                if (game) {
                  var info = toInfo(game,platform);
                  saveAndReturnInfo(info,res,db);
                } else {
                  res.json({status: "error", msg: "Unable to get game "+game});
                }    
            }   
        });
    },
    
    downloadImage: function (name,platform,callback){
      console.log("Downloading cover from thegamesdb " +name);
        var gameDbPlatform = platformToThegamesdb(platform),
            startTime = Date.now();
            
        searchGame (name,gameDbPlatform, function(result){
            if (result.status == "error"){
                var msg = "Unable to download image: "+result.msg;
                callback(msg);
            } else {
		 try{
		    var base = result.result.baseImgUrl,
			game = getExactGame(result.result.Game,name),
			images = game.Images[0],
			image = "";
			
		    console.log("base image "+base);
                        
                    if (images.screenshot)  image = images.screenshot[0].original[0]["_"];
                    else if (images.boxart) image = images.boxart[0]["_"]; //1 should be the front side
                    else image = images.clearlogo[0]["_"];
                    
                    callback(false, base+image);
                   
                } catch (e){
                    var msg = "No images for "+name+" "+JSON.stringify(game);
                    callback(msg);
                }
            }   
        });
    }
}

function toInfo(game,platform){
  
  var info = {
    name: game.GameTitle[0],
    platform: platform,
    thegamesdbId: game.id[0],
  };

  //optional values
  if (game.Overview) info.description =game.Overview[0];
  if (game.ReleaseDate) info.releaseDate = game.ReleaseDate[0];
  if (game.Developer) info.developer = game.Developer[0];
  if (game.Rating) info.rating = game.Rating[0];

  return info;
}
function saveAndReturnInfo(info,res,db){
    console.log("Saving game info "+ info.name+ " "+info.platform);
    
    db.run("INSERT INTO info (name,thegamesdbId,platform,description,releaseDate,developer,rating) VALUES (?,?,?,?,?,?,?)", 
            [info.name,info.thegamesdbId,info.platform,info.description,info.releaseDate,info.developer,info.rating]);
    
    res.json(info);
}

function getExactGame(games,name){
    
    var names = "",
        game = undefined; 

    for (i in games){
        var gameResult = games[i],
            gamedbName = gameResult.GameTitle[0];
            
        if (name.toUpperCase() == gamedbName.toUpperCase() ) game = gameResult ;
        else names += gamedbName +", ";
    }
    
    if (!game)  console.log( "Unable to match game '"+ name +"' in "+names);
    return game;
}
function searchGame (name,platform, callback){
    
    var startTime = Date.now(),
        path = encodeURI("/api/GetGame.php?name="+name+"&platform="+platform),
        uri = 'http://thegamesdb.net'+path, //only needed for logs
        xml = "",
        options = {
            host: 'thegamesdb.net',
            port: 80,
            path: path,
            agent : false
        };
        
    http.get(options, function(resp){
        resp.on('data', function(chunk){
            xml += chunk;
        });
        resp.on('end', function(){
            console.log("Request "+uri+" ended in "+(Date.now() - startTime )+" ms" );
                
            xml2js.parseString(xml, function (err, result) {
                
                if (result.Data.Game == undefined) {
                    var msg = "no games with the name '"+name+"'";
                    callback({status: "error", msg: msg, time:(Date.now() - startTime )});
                } else {
                    callback({status: "success", result: result.Data, time:(Date.now() - startTime )});
                }     
            });
        });
    }).on("error", function(e){
        console.log("Request "+uri+" returned an error: "+e);

        callback({
          status:"error",
          msg: "Request "+uri+" returned an error: "+e,
          time:  (Date.now() - startTime )
        });
    });   
}
    
function platformToThegamesdb(platform){
  switch(platform){
      case "Dos": return "PC";
      case "Windows": return "PC";
      case "ScummVM": return "PC";
      default: return platform;
  }
}