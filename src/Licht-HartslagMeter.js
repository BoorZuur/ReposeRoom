/*
https://makecode.com/_gsP4h92LWCA4
*/
let lastFour = [0, 0, 0, 0]
let areTops = (lastFour[0] - lastFour[1] - lastFour[2] + lastFour[3])
let delayTops = 50
// the amount of times a top or valley is detected
let times = 0
// delaycheck is the amount of seconds to check the amount of times
let delayCheck = 2000
let heartBeat = 0
forever(function () {
    let heartBeatPerCheck = 0
    let times = 0
    for (let x = 0; x < delayCheck / 4 * delayTops; x++) {// de echte delay is de gewilde delay/4(delayforloop)
        for (let i = 0; i < 4; i++) {
            lastFour[i] = input.lightLevel()
            pause(delayTops - 4) //the amount of lines in the forloop
            if (areTops < 1 || areTops > -1) {
                times++
            }
        }
        heartBeatPerCheck = times / delayCheck
    }
    heartBeat = heartBeatPerCheck /60*delayCheck
})
