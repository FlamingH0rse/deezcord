$(() => {
    // Messy code (needs to be refactored)
    if ($('.rightside').is(":visible")) $('#memberlisttoggle').css("background-color", "white")

    $("#loadOverlay").css("display", "none");
    $(".status").hide()
    $('#memberlisttoggle').click(() => {
        $('.rightside').toggle()

        // Messy code (needs to be refactored)
        if ($('.rightside').is(":visible")) $('#memberlisttoggle').css("background-color", "white")
        else $('#memberlisttoggle').css("background-color", "#B5BAC1")
    })
    $('body').on('mouseenter', '.rolemention', () => {
        $(this).css('background-color', $(this).css('background-color').replace('0.1', '0.3'));
    }).on('mouseleave', '.rolemention', () => {
        $(this).css('background-color', $(this).css('background-color').replace('0.3', '0.1'));
    })
})