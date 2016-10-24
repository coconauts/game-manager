var http = require('http'),
    fs = require('fs');

module.exports = {
    getOrElse: function(value, def){
	if (value !== undefined) return value;
	else return def;
    },
   removeExtension: function (file) {
        var extensionIndex = file.lastIndexOf(".") ;
        return file.substr(0,extensionIndex);
    },
    extension: function (file) {
        var extensionIndex = file.lastIndexOf(".") ;
        return file.substr(extensionIndex+1);
    },
    sanitize: function (str) {
        if (str) {
          str = str.replace(/\(.*\)/g,"");
          str = str.replace(/ - /g,": ");
          str = str.replace(/\[\!\]/g,"");
          str = str.trim();
        }
        return str;
    },
    saveImage: function(imgUrl, path, callback){

      console.log("Saving image from "+imgUrl+ " in "+path);

      f = fs.createWriteStream(path),

      http.get(imgUrl, function(response) {
          response.pipe(f);
          response.on('data', function() { });
          response.on('end',function(){
            callback({
                error: false,
                img: "/image?path="+path
            });
        });
      }).on("error", function(e){
          callback({
              error: "Unable to save image from " + imgUrl + " into " + path + ": " + e
          });
      });
    }
};
