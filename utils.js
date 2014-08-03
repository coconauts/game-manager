module.exports = {
   removeExtension: function (file)
    {
        var extensionIndex = file.lastIndexOf(".") ;
        return file.substr(0,extensionIndex);
    },
    extension: function (file)
    {
        var extensionIndex = file.lastIndexOf(".") ;
        return file.substr(extensionIndex+1);
    },
    sanitize: function (str)
    {
        str = str.replace(/\(.*\)/g,""); 
        str = str.replace(/ - /g,": "); 
        str = str.trim();
        return str;
    }
};
