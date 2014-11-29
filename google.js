var http = require('http');

http.globalAgent.maxSockets = 100;

module.exports = {
   downloadImage: function (name, callback) {
     
     //https://ajax.googleapis.com/ajax/services/search/images?safe=off&v=1.0&rsz=8&q=
    var startTime = Date.now(),
    path = encodeURI("/ajax/services/search/images?safe=off&v=1.0&rsz=1&q="+name),
    uri = 'http://ajax.googleapis.com'+path, //only needed for logs
    data = "",
    options = {
        host: 'ajax.googleapis.com',
        port: 80,
        path: path,
        agent : false
    };
    
    console.log("Downloading image from google: " + uri);
        
    http.get(options, function(resp){
        resp.on('data', function(chunk){
            data += chunk;
        });
        resp.on('end', function(){
            console.log("Request "+uri+" ended in "+(Date.now() - startTime )+" ms" );
            
            try{
                json =  JSON.parse(data);
               
                var url = json.responseData.results[0].url
                callback(false, url);
                
            } catch (e){
                var msg = "Unable to download image from google " + e;
                
                console.log(msg);
                callback(msg);
            }
        });
    }).on("error", function(e){
      var msg = "Request "+uri+" returned an error: "+e;  
      console.log(msg);
      callback(msg);
    });   
    }
};
