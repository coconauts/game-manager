var sqlite3 = require("sqlite3").verbose(),
    fs = require('fs'),
    config = require('./config.json'),  
    database = config.db,
    db = new sqlite3.Database(database);
  
var exists = fs.existsSync(database);
if(!exists) db_init();
else {
  //Settings was added aftwards, so we need to check if it exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?;",['settings'] , function (err, table){
    if (err || !table) db_init();
    else applyEvolutions();
  });
};
  
var db_init = function(){
  console.log("Initializing DB schema");
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS platform (id INTEGER PRIMARY KEY, platform TEXT, roms TEXT, covers TEXT, info TEXT, exec TEXT);");
    db.run("CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY,platform TEXT,name TEXT,favorite NUMERIC, todo NUMERIC, finish NUMERIC, count NUMERIC);");
    db.run("CREATE TABLE IF NOT EXISTS info (id INTEGER PRIMARY KEY, name TEXT,thegamesdbId TEXT,platform TEXT, description TEXT,releaseDate TEXT,developer TEXT,rating TEXT);");
    db.run("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT, user NUMERIC, key TEXT, value TEXT);");
    
    db.run("INSERT INTO settings (key,value) VALUES (?,?)", ["version","0"]);    
    
    applyEvolutions();
  });
};

var applyEvolutions = function(){
  db.get("SELECT * FROM settings WHERE key = 'version'",[] , function (err, setting){
    switch(setting.value) {
      case "0": evolution_1();
      default: console.log("Database is up to date");
    }
  });
};

var evolution_1 = function(){
  console.log("Database is out of date, applying evolution 1 ");
  db.run("ALTER TABLE stats ADD COLUMN 'last_play' INTEGER");
  db.run("UPDATE settings SET value='1' WHERE key='version'")
};

module.exports = db;