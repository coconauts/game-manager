var express = require("express"),
    bodyParser = require('body-parser'),
    http = require('http'),
    xml2js = require('xml2js'), //https://github.com/Leonidas-from-XIV/node-xml2js
    fs = require('fs'),
    exec = require('child_process').exec,
    app = express(),
    config = require('./config.json'),
    sqlite3 = require("sqlite3").verbose();
        
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

global.db = new sqlite3.Database(config.db);   

//custom js
var dbUtils = require('./db.js');
    utils = require('./utils.js'),
    thegamesdb = require('./thegamesdb.js'),
    google = require('./google.js'),
    tags = require('./tags.js'),
    stats = require('./stats.js'),
    platform = require('./platform.js');
    
dbUtils.init();

//Additional routes
tags.routes(app);
stats.routes(app);
platform.routes(app);

app.get('/', function(req, res){
  fs.readFile('./index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end(); 
    });
}); 

app.get("/image", function(req,res){
   
    var path = req.query.path,
        img = fs.readFileSync(path);
        
    res.end(img, 'binary');
});

app.get("/mame2json", function(req,res){
  
    console.log("Parsing mame xml");  
    
    var startTime = Date.now(),
        mameXml = fs.readFileSync("mame.xml", {});
    
    xml2js.parseString(mameXml, function (err, result) {
        
        var mame = {};
        mame.total = result.gameList.game.length;
        console.log("Parsing "+mame.total+" games");
        for (i in result.gameList.game) {
            var name = result.gameList.game[i].name[0];
            var description = result.gameList.game[i].description[0];
            mame[name] = description;
        }
       // console.log(object);
        
        fs.writeFile("mame.json", JSON.stringify(mame), function(err) {
            var result = {};
            result.result = err;
            result.total = mame.total;
            res.json(result);
        })
        
    });
});

app.get('/downloadCover',  function(req,res){
    var file = req.query.f,
        platform = req.query.p,
        name = req.query.g;
        
    sanitizedName = utils.sanitize(name);
     
     db.get("select * from platform where platform = ? ",[platform] , function (err, row){
        var path = row.covers +name + ".png";
        
        thegamesdb.downloadImage(sanitizedName,platform,function(error, url){
            if (error) {
	      console.log("Unable to download cover from thegamesdb " + error);
              downloadFromGoogle();
            } else utils.saveImage(url, path, function(result){
                  res.json(result);
            });
        });
        var downloadFromGoogle = function(){
          google.downloadImage(platform + " "+ name + " gameplay", function(error,url){
            if (error) res.json(error);
            else utils.saveImage(url, path, function(result){
                res.json(result);
            });              
          });
        }
     });
});

app.get('/run',  function(req,res){
    
    var command = req.query.c,
        name = req.query.g,
        platform = req.query.p,
	now = new Date().getTime();
    
    db.get("select * from stats where name LIKE ? AND platform = ?",[name,platform] , function (err, row){   
        if (!row) db.run("INSERT OR IGNORE INTO stats (platform,name,count, last_play) VALUES (?,?,1, ?)",  [platform,name, now]);  
        else db.run("UPDATE stats SET count = ? where platform = ? and name = ? and last_play = ?",[row.count-0+1,platform,name, now]);
     });
    
    command = command +" >> run.log 2>&1";

    console.log("Running "+command);
    
    var com = exec(command, function(error, stdout, stderr) { 
      if (error) console.error(error); 
    });
    
    res.json({pid: com.pid});
    
});

app.get('/info',function(req,res){
    var name = req.query.g,
        platform = req.query.p;
        
    name = utils.sanitize(name);
    
    db.get("select * from info where name LIKE ? AND platform = ?",[name,platform] , function (err, row){     
      if (row) res.json(row);
      else res.json({error: "Missing info in database"});
    });
});

app.get('/downloadInfo', function(req,res){
  var name = req.query.g,
      platform = req.query.p;
        
  name = utils.sanitize(name);
  thegamesdb.search(name,platform,res,db);
});

var port = config.port;
app.listen(port);
console.log("Server started in http://localhost:"+port);