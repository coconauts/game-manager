var fs = require('fs'),
    utils = require('./utils.js');

var getImageUrl = function(path, file){
   var imagePath = path+utils.removeExtension(file)+".png",
	existImage = fs.existsSync(imagePath);

    if (!existImage){
	imagePath = path+utils.removeExtension(file)+".jpg";
	existImage = fs.existsSync(imagePath);
    }
     if (existImage) return "/image?path="+imagePath;
     else undefined;
}
var processGames = function (f,platform,roms, covers,search ){

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

            files[n] = {
              file: fileNoExtension,
              name: game,
              ext: utils.extension(file)
            };

            //files[j].description = "";
	    var imagePath = getImageUrl(covers,file);
            if (imagePath) files[n].image = imagePath;

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
var ls = function (platform, roms, covers, search){
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

module.exports = {
 routes: function(app){

      app.get("/platform", function(req,res){

          var platform = req.query.p,
    	  search = req.query.s;

          db.get("select * from platform where platform = ? ",[platform] , function (err, row){

    	  var json = ls(platform,row.roms,row.covers, search);
    	  res.json(json);

          });
      });

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
    	db.serialize(function() {
    	  db.run("DELETE FROM platform");
    	  for (var i = 0; i< platforms.length; i++){
    	    var p = platforms[i];
    	    db.run("INSERT INTO platform (platform, roms, covers, info, exec) VALUES (?,?,?,?,?)",
    		      [p.platform,p.roms,p.covers, '', p.exec]);


    	    res.json({ status: "success" , msg: platforms.length+" platforms inserted" });
    	  }
    	});

        });
    },
    processGames : processGames
  }
