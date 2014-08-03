var currentPlatform ;
var currentGame;

function platform(platform, search)
{   
    if (search != undefined) search = "&s="+search; else search = "";
    currentPlatform = platform;
    console.log("Loading platform "+platform.platform);
    $.ajax({
        url: "platform?p="+platform.platform+search,
        dataType: "json",
        async: true,
        success: function (json) {
            lsJson(json);
            $("#fileCount").html(json.count+" of "+json.total);
        }
    });
} 

function tagSearch(platform,tag)
{   
    currentPlatform = platform;
    $.ajax({
        url: "tag/search?p="+platform.platform+"&t="+tag,
        dataType: "json",
        async: true,
        success: function (json) {
            lsJson(json);
            $("#fileCount").html(json.count+" of "+json.total);
        }
    });
} 

function lsJson(response){
    var folder = response.folder;

    $("#listFiles").empty();
    for(var i=0;i<response.files.length;i++){
        var file = response.files[i];
        if (file.type == "file"){ //filter out folders

            var fileResponse = buildFile(folder, file);
            $("#listFiles").append(fileResponse);
        }
    }
    var first = $("#listFiles p").first();
    $(first).addClass("selected");
    $(first).trigger('mouseenter');
    
}

var tags = ["favorite","todo","finish"];

var hoverTime ;
var hoverMaxTime = 1000;

function buildFile(path,file){

    tag = "<p>"+file.name+"</p>";
    var jTag = $(tag);

    $(jTag).dblclick(function(){
        runGame(path,file.file,file.ext);
    });
    $(jTag).hover(function(){ 
        
        $("p").removeClass("selected");
        $(this).addClass("selected");
        
        if (currentGame == file.name) return;
                
        fullFile = file.file+"."+file.ext;
        currentGame = file.name;
        $("#gameName").html(file.name).show();
        
        if (file.image) {
            //http://www.w3schools.com/tags/ref_urlencode.asp
            var image = file.image.replace(/\+/g,"%2B").replace(/\&/,"%26");
            $("#gameImage").attr("src",image).show();
            $("#backgroundImage").attr("src",image).show();
        } else {
            $("#gameImage").hide();
            $("#backgroundImage").hide();
            
        }
        $("#gameDescription").hide();
        $("#gameYear").hide();
        $("#gameRating").hide();
        $("#gameDeveloper").hide();
        
        $("#actions").show().find("p").unbind();
        $("#play").click(function(){runGame(path,file.file,file.ext);});
        
        //default values
        for (i in tags){
           var tag = tags[i];
           $("#"+tag).addClass("img-disabled").click(function(){addTag(fullFile,this.id);});
        }  
 
        $.ajax({
            url: "tag?g="+fullFile+"&p="+currentPlatform.platform,
            dataType: "json",
            success: function (json) {  
                
                for (i in tags){
                    var tag = tags[i];
                    value = json[tag];
                    if (value) $("#"+tag).removeClass("img-disabled").unbind().click(function(){removeTag(fullFile,this.id);});
                }  
                if (!json.count)$("#gameCount").html("").hide();
                else $("#gameCount").html(json.count).show();
            }
        });
        
        clearTimeout(hoverTime);
        hoverTime = setTimeout(function(){
            
            if (!file.image) $.ajax({
                url: "downloadCover?g="+escape(file.name)+"&f="+file.file+"&p="+currentPlatform.platform,
                dataType: "json",
                success: function (json) {  
                    if (json.status !="error"){
                        
                        file.image = json.img;
                        
                        var image = file.image.replace(/\+/g,"%2B").replace(/\&/,"%26");
                        $("#gameImage").attr("src",image).show();
                        $("#backgroundImage").attr("src",image).show();
                    }
                }
            });  
            
            $.ajax({
                url: "info?g="+escape(file.name)+"&p="+currentPlatform.platform,
                dataType: "json",
                success: function (json) {  
                    if (json.status != "error") {
                        if (json.description) $("#gameDescription").html(json.description).show();
                        if (json.releaseDate)  $("#gameYear").html(json.releaseDate).show();
                        if (json.developer) $("#gameDeveloper").html(json.developer).show();
                        if (json.rating) $("#gameRating").html(json.rating+ " / 10").show();
                    }
                }
            });
        }, hoverMaxTime);
        
                
    });
    return $(jTag);
}

var button;
function addTag(name,tag){
    $.ajax({
        url: "tag/save?g="+name+"&t="+tag+ "&p="+currentPlatform.platform,
        dataType: "json",
        success: function (json) {   
            $("#"+tag).unbind();
            $("#"+tag).removeClass("img-disabled");
            $("#"+tag).click(function(){removeTag(name,tag);});
        }
    });
}
function removeTag(name,tag){
    console.log(button);
    console.log($(button));
    console.log("Removing tag "+tag + " for "+name);
    $.ajax({
        url: "tag/remove?g="+name+"&t="+tag+ "&p="+currentPlatform.platform,
        dataType: "json",
        success: function (json) {   
            $("#"+tag).unbind();
            $("#"+tag).addClass("img-disabled");
            $("#"+tag).click(function(){addTag(name,tag);});
        }
    });
}

function arrayContains(array, tag) {
    for (var i = 0; array.length > i; i += 1) {
        if (array[i] == tagName) {
            return true;
        }
    }
    return false;
};

function runGame(path,name,ext){
  
    var exec =currentPlatform.exec.replace(/{name}/g,name).replace(/{path}/g,path).replace(/{ext}/g,ext);
    $.ajax({
        url: "run?c="+exec+"&g="+name+"."+ext+"&p="+currentPlatform.platform,
        dataType: "json",
        success: function (json) {   
            var count = $("#gameCount").html();
            $("#gameCount").html(count-0+1).show();
        }
    });
}

function loadSelector(){
     for (i in platforms){
            var p = platforms[i].platform;
            var button = $("<button/>");
            var className = "platform-"+platformToShort(p);
            $(button).addClass("icon").addClass(className).addClass("secondary");
            $(button).attr("index",i);
            if (p == currentPlatform.platform) $(button).removeClass("secondary").addClass("selected");
            $(button).click(function (){
               var i = $(this).attr("index");
               platform(platforms[i]);
               $(".icon").addClass("secondary").removeClass("selected");
               $(this).addClass("selected").removeClass("secondary");
            });
            $("#selector").append(button);
     }
}