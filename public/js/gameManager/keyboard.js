$("html").on("keydown", function(e){
    if ((e.keyCode === 38) || (e.keyCode === 40) ) selectGame(e,1); //up, down
    if ((e.keyCode === 37) || (e.keyCode === 39) ) selectPlatform(e); //left, right
    if ((e.keyCode >= 65) && (e.keyCode <= 90) ) $("#searchInput").focus(); //a-z
    if ((e.which == 13) || (e.keyCode == 49)) $("#listFiles p.selected").trigger("dblclick");
    if ((e.keyCode == 34) || (e.keyCode == 33) ) selectGame(e,10); //repag, avpag
 });

function selectGame(e,n){
    var selectedGame = $("#listFiles p.selected");
    var newGame = [];
    
    var up = ((e.keyCode == 33) || (e.keyCode === 38));
    var down = ((e.keyCode == 34) || (e.keyCode === 40));
    
    for (var i=0;i<n;i++){
        if (up) selectedGame = $(selectedGame).prev(); // up
        else if(down) selectedGame = $(selectedGame).next(); // down
            
        if (selectedGame.length != 0) newGame = selectedGame;
    }
    
    if(newGame.length != 0) {
        $(newGame).trigger('mouseenter');
        //may I scroll ?
        var divTop = 207;
        var newPosition=$("#listFiles").scrollTop() + $(newGame).position().top - divTop - $("#listFiles").height()/2;
        $("#listFiles").scrollTop(newPosition);
    }
}

function selectPlatform(e){
    
    var selectedPlatform = $("#selector button.selected");
    var newPlatform;
    
     if(e.keyCode === 37) newPlatform = $(selectedPlatform).prev(); // up
    else if(e.keyCode === 39)  newPlatform = $(selectedPlatform).next();// down
    
    if(newPlatform.length != 0) $(newPlatform).click();
    
}