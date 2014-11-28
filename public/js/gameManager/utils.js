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

function arrayContains(array, tag) {
    for (var i = 0; array.length > i; i += 1)  if (array[i] == tagName) return true;
    return false;
};

