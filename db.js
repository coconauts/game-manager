 
//Creates directly the database using the latest version, there's no need to apply evolutions
var create = function(){
  console.log("Initializing DB schema");
  db.serialize(function() { //serialize will run execute a query at a time
    db.run("CREATE TABLE IF NOT EXISTS platform (id INTEGER PRIMARY KEY, platform TEXT, roms TEXT, covers TEXT, info TEXT, exec TEXT);");
    db.run("CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY,platform TEXT,name TEXT,favorite NUMERIC, todo NUMERIC, finish NUMERIC, count NUMERIC, last_play INTEGER);");
    db.run("CREATE TABLE IF NOT EXISTS info (id INTEGER PRIMARY KEY, name TEXT,thegamesdbId TEXT,platform TEXT, description TEXT,releaseDate TEXT,developer TEXT,rating TEXT);");
    db.run("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, user NUMERIC, key TEXT, value TEXT);");
    db.run("INSERT INTO settings (key,value) VALUES (?,?)", ["version","1"]);    //Set the latest version 
  });
};

//Apply changes to database if it gets out of date
var applyEvolutions = function(){
  db.get("SELECT * FROM settings WHERE key = 'version'",[] , function (err, setting){
    if (err) console.error(err);
    switch(setting.value) {
      case "0": evolution_1();
      default: console.log("Database is up to date");
    }
  });
};

var evolution_1 = function(){
  console.log("Database is out of date, applying evolution 1 ");
  db.serialize(function() {
    db.run("ALTER TABLE stats ADD COLUMN 'last_play' INTEGER");
    db.run("UPDATE settings SET value='1' WHERE key='version'")
  });
};

var db_init = function(){
  //Check if exists
  db.get("SELECT * FROM sqlite_master WHERE name ='settings' and type='table';",function(err, table){
    if (err) console.error(err); 
    //console.log("exists " + table);
    if(table === undefined) create();
    else applyEvolutions();
  });
}

module.exports = {   
  init: db_init
}