var fs = require('fs');
var utils = require('../helpers/utils.js');

//Duplicated from apps
var getImageUrl = function(path, file) {
    var imagePath = path + utils.removeExtension(file) + ".png",
        existImage = fs.existsSync(imagePath);

    if (!existImage) {
        imagePath = path + utils.removeExtension(file) + ".jpg";
        existImage = fs.existsSync(imagePath);
    }
    if (existImage) return "/image?path=" + imagePath;
    else return undefined;
};
exports.routes = function(app) {

    var stats2games = function(stats, imageFolder) {

        var games = [];
        for (var i = 0; i < stats.length; i++) {
            var stat = stats[i];
            var name = utils.removeExtension(stat.name);
            var imagePath = getImageUrl(imageFolder, stat.name);
            var game = {
                file: name,
                name: name,
                ext: utils.extension(stat.name),
                image: imagePath,
                type: 'file'
            };
            games.push(game);
        }
        return games;

    };
    var stats = function(sql, platform, count, res) {

        db.all(sql, [platform, count], function(err, stats) {
            if (err) console.error(err);
            db.get("select * from platform where platform = ? ", [platform], function(err, plat) {
                var games = stats2games(stats, plat.covers);
                res.json({
                    folder: plat.roms,
                    files: games,
                    count: games.length
                });
            });
        });
    };
    app.get('/stats/most-played', function(req, res) {

        var count = utils.getOrElse(req.query.c, 10),
            platform = req.query.p,
            sql = "select * from stats WHERE platform = ? AND count > 0 ORDER BY count DESC LIMIT ?";

        stats(sql, platform, count, res);
    });

    app.get('/stats/last-played', function(req, res) {

        var count = utils.getOrElse(req.query.c, 10),
            platform = req.query.p,
            sql = "select * from stats WHERE platform = ? AND last_play is not null ORDER BY last_play DESC LIMIT ?";

        stats(sql, platform, count, res);

    });
};
