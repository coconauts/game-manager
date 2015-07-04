var currentPlatform ;
var currentGame;
var tags = ["favorite","todo","finish"];
var hoverTime ;
var hoverMaxTime = 2500;

 $( document ).ready(function() {

    if (platforms.length > 0 ) {
	//TODO Remove this if we have a main screen
        platform(platforms[1]);
        loadSelector();
    }
    else alert("No platforms available");
    
    $("#searchInput").keyup(function (e) {
        
        //backspace, a-z
        if ((e.keyCode ==8) || (e.keyCode ==  46) || (e.keyCode >= 65) && (e.keyCode <= 90) ) {
            platform(currentPlatform,$("#searchInput").val());
        }
    });
    $(".icon-search").click(function(){platform(currentPlatform,$("#searchInput").val())});
    $(".icon-favorite").click(function(){tagSearch(currentPlatform,"favorite")});
    $(".icon-todo").click(function(){tagSearch(currentPlatform,"todo")});
    $(".icon-finish").click(function(){tagSearch(currentPlatform,"finish")});
    $(".icon-last-played").click(function(){stats(currentPlatform,"last-played")});
    $(".icon-most-played").click(function(){stats(currentPlatform,"most-played")});

    $("#background").css("height",$(window).height());
});
 
var stats = function(platform, stats){
  $.ajax({
        url: "stats/"+stats+"?p="+platform.platform,
        success: function (json) {
            lsJson(json);
            $("#fileCount").html(json.count);
        }
    });
}
function platform(platform, search)
{   
    if (search != undefined) search = "&s="+search; else search = "";
    currentPlatform = platform;
    console.log("Loading platform "+platform.platform);
    $.ajax({
        url: "platform?p="+platform.platform+search,
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
        success: function (json) {
            lsJson(json);
            $("#fileCount").html(json.count);
        }
    });
} 


function lsJson(response){
    var folder = response.folder;

    $("#listFiles").empty();
    for(var i=0;i<response.files.length;i++){
        var file = response.files[i];
        if (file.id > 0 || file.type == "file"){ //filter out folders

            var fileResponse = buildFile(folder, file);
            $("#listFiles").append(fileResponse);
        }
    }
    var first = $("#listFiles p").first();
    $(first).addClass("selected");
    $(first).trigger('mouseenter');
    
}

function buildFile(path,file){

    tag = "<p>"+file.name+"</p>";
    var jTag = $(tag);

    $(jTag).dblclick(function(){
        runGame(path,file.file,file.ext);
    });
    $(jTag).hover(function(){ 
                
        if (currentGame == file.name) return;
        
        //TODO filter selected (more efficient ?)
        $("p").removeClass("selected");
        $(this).addClass("selected");
        
        fullFile = file.file+"."+file.ext;
        currentGame = file.name;
        $("#gameName").html(file.name).show();
        
        clearInfo(fullFile);
        
        if (file.image) {
            //http://www.w3schools.com/tags/ref_urlencode.asp
            var image = file.image.replace(/\+/g,"%2B").replace(/\&/,"%26");
            $("#gameImage").attr("src",image).show();
            $("#backgroundImage").attr("src",image).show();
        }
        
        $("#play").click(function(){runGame(path,file.file,file.ext);});
        
        loadTags(fullFile);
        
        loadInfo(currentGame);
        
        clearTimeout(hoverTime);
        hoverTime = setTimeout(function(){
          if (!file.image) downloadCover(file);
          if (!$("#gameDescription").html()) downloadInfo(file);    
        }, hoverMaxTime);
                
    });
    return $(jTag);
}
var clearInfo = function(file){
  
  $("#gameDescription").hide();
  $("#gameYear").hide();
  $("#gameRating").hide();
  $("#gameDeveloper").hide();
  //$("#gameImage").hide();
  $("#backgroundImage").hide();
     
  $("#gameImage").attr("src","css/images/loading.gif");
  
  $("#actions").show().find("p").unbind();
  
  //default values
  for (i in tags){
      var tag = tags[i];
      $("#"+tag).addClass("img-disabled").click(function(){addTag(file,this.id);});
  }  
}

var loadTags = function(filename){

  $.ajax({
      url: "tag?g="+filename+"&p="+currentPlatform.platform,
      success: function (json) {  
          
          for (i in tags){
              var tag = tags[i];
              value = json[tag];
              if (value) $("#"+tag).removeClass("img-disabled").unbind().click(function(){removeTag(filename,this.id);});
          }  
          if (!json.count)$("#play").html("").show();
          else $("#play").html(json.count).show();
      }
  });
}
var loadInfo = function(gamename){
  $.ajax({
      url: "info?g="+escape(gamename)+"&p="+currentPlatform.platform,
      success: function (json) {  
          if (json.error) console.log(json.error);
          else {
              if (json.description) $("#gameDescription").html(json.description).show();
              if (json.releaseDate)  $("#gameYear").html(json.releaseDate).show();
              if (json.developer) $("#gameDeveloper").html(json.developer).show();
              if (json.rating) $("#gameRating").html(json.rating+ " / 10").show();
          }
      }
  });
}

var downloadCover = function(file){
  console.log("Downloading cover from "+file.name);
    $.ajax({
        url: "downloadCover?g="+escape(file.name)+"&f="+file.file+"&p="+currentPlatform.platform,
        success: function (json) {  
            if (json.status !="error"){
                
                file.image = json.img;
                
                var image = file.image.replace(/\+/g,"%2B").replace(/\&/,"%26");
                $("#gameImage").attr("src",image).show();
                $("#backgroundImage").attr("src",image).show();
            }
        }
    });  
} 

var downloadInfo = function(file){
   console.log("Downloading info "+file.name);
     $.ajax({
        url: "downloadInfo?g="+escape(file.name)+"&p="+currentPlatform.platform,
        success: function (json) {  
            if (json.status != "error") {
                if (json.description) $("#gameDescription").html(json.description).show();
                if (json.releaseDate)  $("#gameYear").html(json.releaseDate).show();
                if (json.developer) $("#gameDeveloper").html(json.developer).show();
                if (json.rating) $("#gameRating").html(json.rating+ " / 10").show();
            }
        }
    });
}

function addTag(name,tag){
    $.ajax({
        url: "tag/save?g="+name+"&t="+tag+ "&p="+currentPlatform.platform,
        success: function (json) {
            $tag = $("#"+tag);
            $tag.unbind();
            $tag.removeClass("img-disabled");
            $tag.click(function(){removeTag(name,tag);});
        }
    });
}
function removeTag(name,tag){
    console.log("Removing tag "+tag + " for "+name);
    $.ajax({
        url: "tag/remove?g="+name+"&t="+tag+ "&p="+currentPlatform.platform,
        success: function (json) {   
            $tag = $("#"+tag);
            $tag.unbind();
            $tag.addClass("img-disabled");
            $tag.click(function(){addTag(name,tag);});
        }
    });
}

function runGame(path,name,ext){
  
    var exec =currentPlatform.exec.replace(/{name}/g,name).replace(/{path}/g,path).replace(/{ext}/g,ext);
    $.ajax({
        url: "run?c="+exec+"&g="+name+"."+ext+"&p="+currentPlatform.platform,
        success: function (json) {
            if (json.error){
              console.error(json.stderr); //It may be empty as we are redirecting the error output
              alert("Unable to run command "+ exec+ ", See logs for more details");
            } else {
              var count = $("#play").html();
	      if (!count) count = 0;
              $("#play").html(count-0+1).show();
            }
        }
    });
}

function loadSelector(){
     for (var i=0 ; i < platforms.length; i++){
          var p = platforms[i].platform;
	  var selected = (p == currentPlatform.platform)?'selected':'secondary';
          var buttonTemplate = "<button index='"+i+"'class='round platform-"+platformToShort(p)+" "+selected+"'/>";
	  var $button = $(buttonTemplate);
          $button.click(function (){
              var i = $(this).attr("index");
              platform(platforms[i]);
              $(".platform").addClass("secondary").removeClass("selected");
              $(this).addClass("selected").removeClass("secondary");
          });
          $("#selector").append($button);
     }
}