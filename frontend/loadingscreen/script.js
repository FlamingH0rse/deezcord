// Simulate auto update for now
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms))
}

$(async () => {
    await sleep(4000)
    $(".statustext").text("Starting...")
})