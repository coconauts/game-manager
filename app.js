var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var config = require('./config.json');
var sqlite3 = require("sqlite3").verbose();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

global.db = new sqlite3.Database(config.db);

//custom js
require('./models/db.js').init();

//Additional routes
require('./controllers/tags.js').routes(app);
require('./controllers/stats.js').routes(app);
require('./controllers/platform.js').routes(app);
require('./controllers/thegamesdb.js').routes(app);
require('./controllers/image.js').routes(app);
require('./controllers/emulator.js').routes(app);
require('./controllers/mame.js').routes(app);

app.get('/', function(req, res){
  fs.readFile('./index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});


var port = config.port;
app.listen(port);
console.log("Server started in http://localhost:"+port);
