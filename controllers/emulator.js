var utils = require('../helpers/utils.js');
var exec = require('child_process').exec;

module.exports = {
    routes: function(app) {

        app.get('/run', function(req, res) {

            var command = req.query.c,
                name = req.query.g,
                platform = req.query.p,
                now = new Date().getTime();

            db.get("select * from stats where name LIKE ? AND platform = ?", [name, platform], function(err, row) {
                if (!row) db.run("INSERT OR IGNORE INTO stats (platform,name,count, last_play) VALUES (?,?,1, ?)", [platform, name, now]);
                else db.run("UPDATE stats SET count = ? where platform = ? and name = ? and last_play = ?", [row.count - 0 + 1, platform, name, now]);
            });

            command = command + " >> run.log 2>&1";

            console.log("Running " + command);

            var com = exec(command, function(error, stdout, stderr) {
                if (error) console.error(error);
            });

            res.json({
                pid: com.pid
            });

        });

        app.get('/info', function(req, res) {
            var name = req.query.g,
                platform = req.query.p;

            name = utils.sanitize(name);

            db.get("select * from info where name LIKE ? AND platform = ?", [name, platform], function(err, row) {
                if (row) res.json(row);
                else res.json({
                    error: "Missing info in database"
                });
            });
        });
    }
};
