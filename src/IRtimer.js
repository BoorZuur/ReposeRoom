let room = 0
let closed = false
//network.onInfraredReceivedNumber(function (num: number) {room=num})
network.infraredSendNumber(0)// turns the other playground on to recieve.
input.buttonA.onEvent(ButtonEvent.Click, function () {
    room++
    light.setPixelColor(room - 1, 0x00ff00)
})
input.buttonB.onEvent(ButtonEvent.Click, function () {
    room--
    light.setPixelColor(room, 0)
})
input.buttonsAB.onEvent(ButtonEvent.Click, function () {
    // detects if the room is dark, before making light with the heartRateLed
    let timer = room
    network.infraredSendNumber(timer)
    if (input.lightLevel() < 125) {
        pins.A0.analogWrite(1023)
    }
    // starts timer
    network.infraredSendNumber(111)
    closed = true
    crickit.servo1.setAngle(90)
    for (let i = 0; i < timer; i++) {
        room--
        pause(100)
        light.setPixelColor(room, 0xff0000)
    }
    console.log(room)
    network.infraredSendNumber(100)
    crickit.servo1.setAngle(0)
    pins.A0.analogWrite(0)
})
//reciever
//100= room available
//111= room not available
//not= roomtimer
let roomtimer = 0
network.onInfraredReceivedNumber(function (num: number) {
    if (num === 100) {
        light.setPixelColor(9, 0x00ff00)
        console.log(`Room is beschikbaar`)
    }
    if (num === 111) {
        light.setPixelColor(9, 0xff0000)
        console.log(`Room is in gebruik`)
    }
    if (num !== 111 && num !== 100) {
        roomtimer = num
    }
    console.log(roomtimer)
})
forever(function () {
    if (closed) {
        //run heartRateCode
    }
})
