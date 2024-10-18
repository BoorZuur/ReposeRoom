let room = 0
let timer = 0
network.infraredSendNumber(0)
input.buttonA.onEvent(ButtonEvent.Click, function () {
    room++
    light.setPixelColor(room - 1, 0x00ff00)
    network.infraredSendNumber(110)
})
input.buttonB.onEvent(ButtonEvent.Click, function () {
    room--
    light.setPixelColor(room, 0)
    network.infraredSendNumber(101)
})
input.buttonsAB.onEvent(ButtonEvent.Click, function () {
    timer = room
    if (input.lightLevel() < 125) {
        pins.A0.analogWrite(1023)
    }
    network.infraredSendNumber(111)
    crickit.servo1.setAngle(90)
    for (let i = 0; i < timer; i++) {
        room--
        pause(100)
        light.setPixelColor(room, 0xff0000)
        network.infraredSendNumber(101)
    }
    console.log(room)
    network.infraredSendNumber(100)
    crickit.servo1.setAngle(0)
    pins.A0.analogWrite(0)
})

// de eerste is de kamer nummer => 1 =room1
//geef 100= room available
//geef 111= room not available
//geef 110=room +1
//geef 101=room-1
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
    if (num === 110) {
        light.setPixelColor(8, 0xffff00)
        roomtimer++
    }
    if (num === 101) {
        light.setPixelColor(8, 0x00ffff)
        roomtimer--
    }
    console.log(roomtimer)
}) 
