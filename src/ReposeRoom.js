/*
ReposeRoom code for the Circuit Playground Express
Make sure that const reciever is true on the recieving CPE.
*/
const timerMultiplier = 5;
const reciever = false;
const timerColor = Colors.Blue;
let timer = 0;
let roomClosed = false;
let screen = "selectTimer";

// initial settings
function init() {
    input.setLoudSoundThreshold(225);
    input.setLightThreshold(LightCondition.Dark, 40);
    input.setLightThreshold(LightCondition.Bright, 240);
    light.setBrightness(80);
    light.setPixelColor(0, timerColor);
}

// start timer in parallel
function startTimer() {
    control.runInParallel(function () {
        for (timer *= timerMultiplier; timer >= 0; timer--) {
            pause(1000);
            if (screen === "timeLeft") {
                screenTimeLeft()
            }
        }
        openRoom()
    })
}

function changeTimer(operator: boolean) {
    if (operator) {
        if (roomClosed) {
            timer += 1 * timerMultiplier;
            screenTimeLeft()
        } else {
            timer += 1;
            screenSelectTimer()
        }
    } else {
        if (roomClosed) {
            timer -= 1 * timerMultiplier;
            screenTimeLeft()
        } else {
            timer -= 1;
            screenSelectTimer()
        }
    }

    // check values
    if (timer < 0) {
        timer = 0;
        screenSelectTimer()
    }
    if (!roomClosed && timer > 9) {
        timer = 9
    }
}

// screen to select timer
// For the real product we have decided that each led is ten minutes.
// For the demo we have set it to 5 seconds.
function screenSelectTimer() {
    screen = "selectTimer";
    for (let i = 0; i <= timer; i++) {
        light.setPixelColor(i, timerColor)
    }
    for (let i = 10; i > timer; i--) {
        light.setPixelColor(i, Colors.Black)
    }
}

// screen to show time left
function screenTimeLeft() {
    screen = "timeLeft";
    for (let i = 0; i <= Math.floor(timer / timerMultiplier); i++) {
        light.setPixelColor(i, timerColor)
    }
    for (let i = 10; i > Math.floor(timer / timerMultiplier); i--) {
        light.setPixelColor(i, Colors.Black)
    }
}

// screen to show time left
function screenTempSound() {
    screen = "tempSound";
    light.clear()
    for (let i = 0; i < 500; i++) {
        // display soundlevel
        if (input.soundLevel() >= 128) {
            light.setPixelColor(5, Colors.Red)
            light.setPixelColor(6, Colors.Red)
        } else if (input.soundLevel() < 128 && input.soundLevel() > 80) {
            light.setPixelColor(5, Colors.Orange)
            light.setPixelColor(6, Colors.Orange)
        } else {
            light.setPixelColor(5, Colors.Green)
            light.setPixelColor(6, Colors.Green)
        }
        if (input.temperature(TemperatureUnit.Celsius) >= 30) {
            light.setPixelColor(8, Colors.Red)
            light.setPixelColor(9, Colors.Red)
        } else if (input.temperature(TemperatureUnit.Celsius) < 30 && input.temperature(TemperatureUnit.Celsius) > 25) {
            light.setPixelColor(8, Colors.Orange)
            light.setPixelColor(9, Colors.Orange)
        } else {
            light.setPixelColor(8, Colors.Green)
            light.setPixelColor(9, Colors.Green)
        }
        pause(10)
    }
    light.clear()
    light.setBrightness(80)
    if (roomClosed) {
        screenTimeLeft()
    } else {
        screenSelectTimer()
    }
}

// close room and show home menu
function closeRoom() {
    startTimer();
    roomClosed = true;
    crickit.servo1.setAngle(90)
    screenTimeLeft()
}

// open room and show time left
function openRoom() {
    roomClosed = false;
    timer = 0;
    crickit.servo1.setAngle(0)
    screenSelectTimer()
}

// + timer
input.buttonA.onEvent(ButtonEvent.Click, function () {
    if (roomClosed) {
        screenHeartbeat();
    } else {
        changeTimer(false)
    }
})

// - timer
input.buttonB.onEvent(ButtonEvent.Click, function () {
    if (roomClosed) {
        screenTempSound();
    } else {
        changeTimer(true)
    }
})

// start or stop
input.buttonsAB.onEvent(ButtonEvent.Click, function () {
    if (roomClosed) {
        openRoom();
    } else {
        closeRoom();
    }
})

// room lights
input.onSwitchMoved(SwitchDirection.Left, function () {
    crickit.signal1.digitalWrite(false)
    crickit.signal2.digitalWrite(false)
    crickit.signal3.digitalWrite(false)
})

input.onSwitchMoved(SwitchDirection.Right, function () {
    crickit.signal1.digitalWrite(true)
    crickit.signal2.digitalWrite(true)
    crickit.signal3.digitalWrite(true)
})

// begin!
init();

// measure bpm
function screenHeartbeat() {
    let readings: number[] = [];
    let beatTimes: number[] = [];
    let lastBeatTime = 0;
    let threshold = 0;
    let windowSize = 20;
    let beatWindow = 600; // Minimum time between beats (ms)

    screen = "heartbeat";

    light.clear()
    light.setBrightness(255);
    for (let i = 0; i < 3; i++) {
        light.setPixelColor(i, Colors.Green);
    }

    function showLights(arr: number) {
        if (arr <= 60) {
            for (let i = 3; i < 9; i++) {
                light.setPixelColor(i, Colors.Green)
            }
        } else if (arr > 60 && arr <= 80) {
            for (let i = 3; i < 9; i++) {
                light.setPixelColor(i, Colors.Orange)
            }
        } else if (arr > 80) {
            for (let i = 3; i < 9; i++) {
                light.setPixelColor(i, Colors.Red)
            }
        }
    }

    function findMax(arr: number[]): number {
        let max = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        return max;
    }

    function findMin(arr: number[]): number {
        let min = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < min) {
                min = arr[i];
            }
        }
        return min;
    }



    for (let i = 0; i < 500; i++) {
        let currentReading = input.lightLevel();
        readings.push(currentReading);

        if (readings.length > windowSize) {
            readings.shift();

            // Dynamic threshold calculation
            let max = findMax(readings);
            let min = findMin(readings);
            threshold = (max + min) / 2;

            // Peak detection
            let middleIndex = Math.floor(windowSize / 2);
            let middleValue = readings[middleIndex];

            if (middleValue > threshold) {
                let isPeak = true;
                for (let i = 0; i < windowSize; i++) {
                    if (i !== middleIndex && readings[i] > middleValue) {
                        isPeak = false;
                        break;
                    }
                }

                if (isPeak && control.millis() - lastBeatTime > beatWindow) {
                    // Beat detected
                    light.setPixelColor(9, Colors.Red);
                    lastBeatTime = control.millis();
                    beatTimes.push(lastBeatTime);
                    if (beatTimes.length > 20) {
                        beatTimes.shift()
                    }

                    // Calculate BPM
                    if (beatTimes.length > 2) {
                        let recentBeats = beatTimes.slice(-3);
                        let averageInterval = (recentBeats[2] - recentBeats[0]) / 2;
                        let bpm = Math.round(60000 / averageInterval);
                        console.log(`BPM: ${bpm}`);
                        showLights(bpm);
                    }
                }
            } else {
                light.setPixelColor(9, Colors.Black);
            }
        }

        pause(20);
    }
    light.clear()
    light.setBrightness(80)
    if (roomClosed) {
        screenTimeLeft()
    } else {
        screenSelectTimer()
    }
}
