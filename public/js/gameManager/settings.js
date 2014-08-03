var defaultSettings = new Object();
defaultSettings.platform = "Nintendo Entertainment System (NES)";
defaultSettings.roms = "/path/to/roms/";
defaultSettings.covers = "/path/to/covers/";
defaultSettings.exec = "/path/to/exec \"{path}{name}.{ext}\"";

var platforms ;

loadSettings();

function loadSettings(){
    $.ajax({
        url: "settings",
        dataType: "json",
        async:false,
        success: function (json) {
            platforms = json.platforms;
        }
    });
}

function buildSettings(){
     for (var i = 0; i< platforms.length;i++){
         buildPlatformSetting(platforms[i]);
     }
     //buildPlatformSetting(defaultSettings);
}
function platformSelect(platformSelected){

                       
    var select = "<select class='selectSettings' name='platform'>";
    for (i in availablePlatforms) {
        var p = availablePlatforms[i];
        var selected = "";
        if (p == platformSelected) selected = " selected ";
        select+= "<option value='"+p+"' "+selected+">"+p+"</option>";
    }
    select += "</select>";
    return select;
        
}
function buildPlatformSetting(s){
    var row = 
    "<tr>"+
        "<td>" +platformSelect(s.platform)+ "</td>"+
        /*"<td><input name='roms' value='"+s.roms+"'/></td>"+
        "<td><input name='covers' value='"+s.covers+"'/></td>"+
        "<td><input name='exec' value='"+s.exec+"'/></td>"+*/
        "<td>"+
            "<label class='labelSettings'>Roms</label><input class='inputSettings' name='roms' value='"+s.roms+"'/><br/>"+
            "<label class='labelSettings'>Snaps</label><input class='inputSettings' name='covers' value='"+s.covers+"'/><br/>"+
            "<label class='labelSettings'>Exec</label><input class='inputSettings' name='exec' value='"+s.exec+"'/><br/>"+
        "</td>"+
        "<td><button class='removeSetting tiny'>-</button></td>";
    "</tr>";
    $("#settingsTable").append(row);
    
    $('.removeSetting').unbind(); 
    $(".removeSetting").click(function(){$(this).closest('tr').remove()});
}

function saveSettings(){
    var platforms = $("#settingsTable").find("select[name='platform']");
    var roms = $("#settingsTable").find("input[name='roms']");
    var covers = $("#settingsTable").find("input[name='covers']");
    var exec = $("#settingsTable").find("input[name='exec']");
    
    var ps = new Array();
    console.log(platforms.length +" platforms");
    for (var i=0; i< platforms.length; i++){
        ps[i] = new Object();
        ps[i].platform = platforms[i].value;
        ps[i].roms = roms[i].value;
        ps[i].covers = covers[i].value;
        ps[i].exec = exec[i].value;
    }
   
    var settings = new Object();
    settings.platforms = ps; 
    
     console.log(settings);
    console.log(JSON.stringify(settings));
    
    $.ajax({
        url: "/settings/save",
        type: "POST",
        contentType: 'application/json',
        data:   JSON.stringify(settings)
    })
}

