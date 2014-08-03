 $( document ).ready(function() {

    if (platforms.length > 0 ) {
        platform(platforms[0]);
        loadSelector();
    }
    else alert("No platforms available");
    
    $("#searchInput").keyup(function (e) {
        
        //backspace, a-z
        if ((e.keyCode ==8) || (e.keyCode ==  46) || (e.keyCode >= 65) && (e.keyCode <= 90) ) {
            platform(currentPlatform,$("#searchInput").val());
        }
    });
    $(".img-search").click(function(){platform(currentPlatform,$("#searchInput").val())});
    $(".img-favorite").click(function(){tagSearch(currentPlatform,"favorite")});
    $(".img-todo").click(function(){tagSearch(currentPlatform,"todo")});
    $(".img-finish").click(function(){tagSearch(currentPlatform,"finish")});
});