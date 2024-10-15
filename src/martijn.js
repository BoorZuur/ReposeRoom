let minutesAmount = 0;

// CPE at door
input.buttonsAB.onEvent(ButtonEvent.Click, function () {
    network.infraredSendNumber(minutesAmount)
})

input.buttonA.onEvent(ButtonEvent.Click, function () {
    minutesAmount -= 10;
})

input.buttonB.onEvent(ButtonEvent.Click, function () {
    minutesAmount += 10;
})





function checkValidMinutes() {
    if (minutesAmount < 0) {
        minutesAmount = 0;
    }
    if (minutesAmount > 100) {
        minutesAmount = 100;
    }
}

// CPE at desk or outside room
network.onInfraredReceivedNumber(function (num) {
    if (num === 69) {
        light.setAll(Colors.Orange)
    }
})
