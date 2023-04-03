$(() => {
    // Messy code (needs to be refactored)
    if ($('.rightside').is(":visible")) {
        $('#memberlisttoggle').css("background-color", "white")
    }    
    
    $("#loadOverlay").css("display", "none");
    $(".status").hide()
    $('#memberlisttoggle').click(() => {
        $('.rightside').toggle()
        // Messy code (needs to be refactored)
        if ($('.rightside').is(":visible")) {
            $('#memberlisttoggle').css("background-color", "white")
        } else {
            $('#memberlisttoggle').css("background-color", "#B5BAC1")
        }
    })
})