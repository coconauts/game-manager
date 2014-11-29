var express = require("express"),
    bodyParser = require('body-parser'),
    http = require('http'),
    xml2js = require('xml2js'), //https://github.com/Leonidas-from-XIV/node-xml2js
    fs = require('fs'),
    exec = require('child_process').exec,
    app = express(),
    config = require('./config.json');
        
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

//custom js
var db = require('./db.js');
    utils = require('./utils.js'),
    thegamesdb = require('./thegamesdb.js'),
    google = require('./google.js');
    
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

app.get("/platform", function(req,res){
   
    var platform = req.query.p,
        search = req.query.s;
    
    db.get("select * from platform where platform = ? ",[platform] , function (err, row){
            
        var json = ls(platform,row.roms,row.covers, search);
        res.json(json);
        
    });
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

function ls(platform, roms, covers, search){
    var startTime = Date.now(),
        f = {},
        exists = fs.existsSync(roms);
        
    if(!exists) console.log("Folder "+roms+" doesn't exist in this system");
    else f = fs.readdirSync(roms).sort(); 

    var files = processGames(f,platform,roms,covers,search );
   
    return {
      folder: roms,
      files: files.files,
      count: files.files.length,
      total: files.files.length + files.filtered,
      time: (Date.now() - startTime )
    };
}

app.get("/platforms", function(req,res){
    var startTime = Date.now();

    db.all("SELECT * FROM platform order by platform", function(err, rows) {
        
        res.json({
          platforms: rows,
          count: rows.length,
          time: (Date.now() - startTime ) 
        });
    });
});

app.post('/platforms/save',  function(req,res){
    var platforms = req.body.platforms;
    
    //truncate table
    db.run("DELETE FROM platform");
    for (var i = 0; i< platforms.length; i++){
      var p = platforms[i];
      db.run("INSERT INTO platform (platform, roms, covers, info, exec) VALUES (?,?,?,?,?)", 
                 [p.platform,p.roms,p.covers, '', p.exec]);
        
        
      res.json({ status: "success" , msg: platforms.length+" platforms inserted" });
    }

});

app.get('/tag',  function(req,res){
    var startTime = Date.now(),
        name = req.query.g,
        platform = req.query.p;

    db.get("SELECT * FROM stats WHERE name = ? AND platform = ?", [name,platform], function(err, row) {
        if (!row) row = [];

        res.json({
         favorite:  row.favorite == 1,
         todo: row.todo == 1,
         finish: row.finish == 1,
         count: row.count,
         time: (Date.now() - startTime )
        });
    });
});

app.get('/tag/search',  function(req,res){
    var startTime = Date.now(),
        platform = req.query.p, 
        tag = req.query.t;
        
    console.log("tag/search "+platform+ " "+tag);
    //TODO Join platform and stats to reduce number of queries
    db.get("select * from platform where platform = ? ",[platform] , function (err, row){
        
        var roms = row.roms,
            covers = row.covers;
        
        db.all("SELECT name FROM stats WHERE platform = ? AND "+tag+" = 1", [platform], function(err, rows) {
                      
            console.log("Found "+rows.length+" games in "+platform+" with tag "+tag);
            
            var fileNames = [];
            for (i in rows) fileNames[i] = rows[i].name;
            
            var files = processGames(fileNames,platform,roms,covers);
         
            res.json({
              folder: roms,
              files: files.files,
              count: files.files.length,
              total: files.files.length + files.filtered,
              time: (Date.now() - startTime )
            });
        });
        
    });
});

function processGames(f,platform,roms, covers,search ){

    var nameMap;
    if (platform == "Arcade") {
        console.log("Loading mame json ");
        var json = fs.readFileSync("mame.json", {});
        nameMap = JSON.parse(String(json));
    }
    
    var files = [],
        n = 0,
        filtered = 0;
        
    for (i in f){
        
        var file = f[i],
            fileNoExtension =utils.removeExtension(file),
            game ;
            
        if (nameMap) game = nameMap[fileNoExtension] 
        else game = fileNoExtension;
        
        if (game == undefined){
            //console.log("Game name " +file+ " is empty");
        } else if ( !search || game.toUpperCase().indexOf(search.toUpperCase()) != -1 ){
                   
            var imagePath = covers+utils.removeExtension(file)+".png",
                existImage = fs.existsSync(imagePath);
                
            if (!existImage){
                imagePath = covers+utils.removeExtension(file)+".jpg";
                existImage = fs.existsSync(imagePath);
            }
            
            files[n] = {
              file: fileNoExtension,
              name: game,
              ext: utils.extension(file)
            };

            //files[j].description = "";
            if (existImage) files[n].image = "/image?path="+(imagePath); 
            
            try{
                files[n].type = fs.lstatSync(roms+"/"+file).isDirectory()?"folder":"file";
            } catch (e) {
                console.error("Game "+roms+"/"+file+" no longer exists");
                files[n].type = "unknown";
            }
            n++;
        } else {
            filtered++;
            //console.log("Filtering file "+file +" -> "+game+", filter: "+s);
        }
    }   

    return {files: files, filtered: filtered};
    
}
app.get('/tag/remove',  function(req,res){
    
    var game = req.query.g,
        tag = req.query.t,
        platform = req.query.p;

    console.log("Removing tag "+tag+ " from game "+game +": "+platform);
    db.run("UPDATE stats SET "+tag+" = 0 WHERE name = ? and platform = ?",  [game,platform]);

    res.json({status: "success"});
});

app.get('/tag/save',  function(req,res){
    var name = req.query.g,
        tag = req.query.t,
        platform = req.query.p;
    
    db.get("select * from stats where name LIKE ? AND platform = ?",[name,platform] , function (err, row){   
   
        if (!row) db.run("INSERT OR IGNORE INTO stats (platform,name,count) VALUES (?,?,0)",  [platform,name]);   
        
        console.log("Adding tag "+tag+ " from game "+name +": "+platform);
        db.run("UPDATE stats SET "+tag+" = 1 WHERE name = ? and platform = ?",  [name,platform]);
        
        res.json({status: "success"});
    });
});

app.get('/downloadCover',  function(req,res){
    var file = req.query.f,
        platform = req.query.p,
        name = req.query.g;
        
    sanitizedName = utils.sanitize(name);
     
     db.get("select * from platform where platform = ? ",[platform] , function (err, row){
        var path = row.covers +name + ".png";
        
        thegamesdb.downloadCover(sanitizedName,platform,function(error, url){
            if (error) {
	      console.log("Unable to download cover from thegamesdb " + error);
              downloadFromGoogle();
            } else utils.saveImage(url, path, function(result){
                  res.json(result);
            });
        });
        var downloadFromGoogle = function(){
          google.downloadImage(platform + " "+ name, function(error,url){
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
        platform = req.query.p;
    
    db.get("select * from stats where name LIKE ? AND platform = ?",[name,platform] , function (err, row){   
        if (!row) db.run("INSERT OR IGNORE INTO stats (platform,name,count) VALUES (?,?,1)",  [platform,name]);  
        else db.run("UPDATE stats SET count = ? where platform = ? and name = ?",[row.count-0+1,platform,name]);
     });
    
    command = command +" >> run.log 2>&1";

    console.log("Running "+command);
    
    exec(command, function puts(error, stdout, stderr) { 
      if (error) console.error(error); 
          
      res.json({error: error,
                stdout: stdout,
                stderr: stderr});
    });  
    
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