var platforms ;

var loadPlatforms = function(){
  $.ajax({
      url: "platforms",
      dataType: "json",
      async:false,
      success: function (json) {
          platforms = json.platforms;
      }
  });
}

loadPlatforms();

//http://thegamesdb.net/api/GetPlatformsList.php
var availablePlatforms=["Arcade","Atari 2600","Dos","NeoGeo","Nintendo 64","Nintendo DS","Nintendo Entertainment System (NES)",
            "Nintendo Game Boy", "Nintendo Game Boy Advance", "Nintendo Game Boy Color","Nintendo GameCube", "Nintendo Wii" ,"ScummVM",
            "Sega Game Gear","Sega Genesis","Sega Saturn", "Sony Playstation","Sony Playstation 2",
            "Super Nintendo (SNES)", "Pc"];

//TODO Update this metod to platformToSlug
function platformToShort(platform){
   switch(platform)
    {
    case "Arcade":return "arcade";
    case "Atari 2600": return "atari2600";
    case "NeoGeo": return "neogeo";
    case "Nintendo 64": return "n64";
    case "Nintendo DS": return "nds";
    case "Nintendo Entertainment System (NES)": return "nes";
    case "Nintendo Game Boy": return "gb";
    case "Nintendo Game Boy Advance": return "gba";
    case "Nintendo Game Boy Color": return "gbc";
    case "Nintendo GameCube": return "gc";
    case "Super Nintendo (SNES)": return "snes";
    case "Sega Game Gear": return "gg";
    case "Sega Genesis": return "md";
    case "Sega Saturn": return "ss";
    case "Sony Playstation": return "psx";
    case "Dos": return "dos";
    case "Pc": return "win";
    case "ScummVM": return "scummvm";
    case "Sony Playstation 2": return "ps2";
    case "Nintendo Wii": return "wii";
    default: return "Unrecognised platform: "+platform;
    }
}
