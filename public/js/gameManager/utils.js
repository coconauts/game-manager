function removeExtension(file)
{
    var extensionIndex = file.lastIndexOf(".") ;
    return file.substr(0,extensionIndex);
}
function extension(file)
{
    var extensionIndex = file.lastIndexOf(".") ;
    return file.substr(extensionIndex+1);
}

function getFolder(file)
{
    var folderIndex = file.lastIndexOf("/") ;
    return file.substr(0,folderIndex+1);
}

function filename(file)
{
    var fileNameIndex = file.lastIndexOf("/") ;
    return file.substr(fileNameIndex+1);
}

function removeLastChar(str, c) 
{    
    var newstr = str;
    var lastChar= str.charAt(str.length-1);
    if (lastChar == c){
        newstr = str.substring(0,str.length-1);
    }    
    return newstr;
}

//http://thegamesdb.net/api/GetPlatformsList.php
var availablePlatforms=["Arcade","Atari 2600","NeoGeo","Nintendo 64","Nintendo DS","Nintendo Entertainment System (NES)",
            "Nintendo Game Boy", "Nintendo Game Boy Advance", "Nintendo Game Boy Color",
            "Sega Game Gear","Sega Genesis","Sega Saturn","Sony Playstation",
            "Super Nintendo (SNES)", "Dos", "Windows", "ScummVM"];
                  
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
    case "Super Nintendo (SNES)": return "snes";
    case "Sega Game Gear": return "gg";
    case "Sega Genesis": return "md";
    case "Sega Saturn": return "ss";
    case "Sony Playstation": return "psx";
    case "Dos": return "dos";
    case "Windows": return "win";
    case "ScummVM": return "scummvm";
    default: return "Unrecognised platform: "+platform;
    }
}
