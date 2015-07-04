   
exports.routes = function(app){

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
      
	  db.serialize(function(){
	    if (!row) db.run("INSERT OR IGNORE INTO stats (platform,name,count) VALUES (?,?,0)",  [platform,name]);   
	    
	    console.log("Adding tag "+tag+ " from game "+name +": "+platform);
	    db.run("UPDATE stats SET "+tag+" = 1 WHERE name = ? and platform = ?",  [name,platform]);
	    
	    res.json({status: "success"});
	  });
	});
    });  
}
