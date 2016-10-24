var fs = require('fs');
var xml2js = require('xml2js'); //https://github.com/Leonidas-from-XIV/node-xml2js



module.exports = {
 routes: function(app){

   app.get("/mame2json", function(req,res){

       console.log("Parsing mame xml");

       var startTime = Date.now();
      var mameXml = fs.readFileSync("mame.xml", {});

       xml2js.parseString(mameXml, function (err, result) {

           var mame = {};
           mame.total = result.gameList.game.length;
           console.log("Parsing "+mame.total+" games");
           for (var i =0; i< result.gameList.game.length; i++) {
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
           });

       });
   });
 }
};
