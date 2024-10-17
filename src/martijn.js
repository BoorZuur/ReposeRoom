let minutesAmount = 0;

// CPE at door
input.buttonsAB.onEvent(ButtonEvent.Click, function () {
    network.infraredSendNumber(minutesAmount*10)
})

input.buttonA.onEvent(ButtonEvent.Click, function () {
    minutesAmount--;
    checkValidMinutes();
    light.setPixelColor(minutesAmount, Colors.Black);
})

input.buttonB.onEvent(ButtonEvent.Click, function () {
    minutesAmount++;
    checkValidMinutes();
    light.setPixelColor(minutesAmount-1, Colors.Orange);
})


function checkValidMinutes() {
    if (minutesAmount < 0) {
        minutesAmount = 0;
    }
    if (minutesAmount > 10) {
        minutesAmount = 10;
    }
}

// CPE at desk or outside room
network.onInfraredReceivedNumber(function (num) {
    light.setAll(Colors.Orange)
})