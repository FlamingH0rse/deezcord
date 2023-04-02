$(() => {
    $("#loadOverlay").css("display", "none");
    $(".status").hide()
    $('#memberlisttoggle').click(() => {
        $('.rightside').toggle()
    })
})