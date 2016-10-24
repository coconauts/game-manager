var request = require('superagent');

module.exports = {
    downloadImage: function(name, callback) {

        //https://ajax.googleapis.com/ajax/services/search/images?safe=off&v=1.0&rsz=8&q=
        var startTime = Date.now();
        var url = "https://duckduckgo.com/i.js?o=json&q=" + encodeURI(name);

        console.log("Searching " + url);

        request
            .get(url)
            .buffer(true)
            .end(function(err, res) {
                if (!res) {
                    console.log("Undefined response from DDG");
                    callback(err);
                } else {
                    //log.info("DDG image response" + JSON.stringify(res) ) ;
                    var json = JSON.parse(res.text);
                    if (json.results) {

                        var ddgImage = json.results[0].image;
                        callback(false, ddgImage);
                    } else {
                        callback("Unable to get images from DDG: no results");
                    }
                }
            });
    }
};
