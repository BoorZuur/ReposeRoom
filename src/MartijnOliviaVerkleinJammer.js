/*
ReposeRoom code for the Circuit Playground Express
Make sure that const reciever is true on the recieving CPE.
*/
const timerMultiplier = 5;      //hoeveel seconden per led
const reciever = false;
const timerColor = Colors.Blue;
let timer = 0;
let roomClosed = false;
let screen = "selectTimer";

// initial settings
input.setLoudSoundThreshold(225);
input.setLightThreshold(LightCondition.Dark, 40);
input.setLightThreshold(LightCondition.Bright, 240);
light.setBrightness(100);
light.setPixelColor(0, timerColor);

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

// screen to show heartbeat
function screenHeartbeat() {
    light.setBrightness(255);
    let readings: number[] = [];
    let beatTimes: number[] = [];
    let windowSize = 20;
    let beatWindow = 600; // Minimum time between beats (ms)

    light.setBrightness(255);
    for (let i = 0; i < 3; i++) {
        light.setPixelColor(i, Colors.Green);
    }

    for (let i = 0; i < 500; i++) {
        readings.push(input.lightLevel());
        if (readings.length > windowSize) {
            readings.shift();

            // Dynamic threshold calculation
            // Check if this works the same otherwise return it back to the functions
            let max = readings[0];
            let min = readings[0];
            for (let i = 1; i < readings.length; i++) {
                if (readings[i] > max) {
                    max = readings[i];
                }
                if (readings[i] < min) {
                    min = readings[i];
                }
            }
            let threshold = (max + min) / 2;

            // Peak detection
            let middleIndex = Math.floor(windowSize / 2);
            let middleValue = readings[middleIndex];

            if (middleValue > threshold) {
                let isPeak = true;
                //if i>exactmid {no peak}, bc you only want to say there is a peak once in the shifting readings
                for (let i = 0; i < windowSize; i++) {
                    if (i !== middleIndex && readings[i] > middleValue) {
                        isPeak = false;
                        break;
                    }
                }
                if (isPeak && control.millis() - lastBeatTime > beatWindow) {
                    // Beat detected
                    light.setPixelColor(9, Colors.Red);
                    let lastBeatTime = control.millis();
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
                        //showLights(bpm);
                        let color = 0
                        if (bpm <= 60) {
                            color = Colors.Green
                        } else if (bpm > 60 && bpm <= 80) {
                            color = Colors.Orange
                        } else if (bpm > 80) {
                            color = Colors.Red
                        }
                        for (let i = 3; i < 9; i++) {
                            light.setPixelColor(i, color)
                        }
                    }
                }
                else {
                    light.setPixelColor(9, Colors.Black);
                }
            }
            pause(20);
        }
        screenTimeLeft()
    }
}
// screen to show time left
function screenTempSound() {

    // display soundlevel
    let color = [0, 0] //0=soundColor,1=TempCelsColor
    if (input.soundLevel() >= 128) {
        color[0] = Colors.Red
    } else if (input.soundLevel() < 128 && input.soundLevel() > 80) {
        color[0] = Colors.Orange
    } else {
        color[0] = Colors.Green
    }

    if (input.temperature(TemperatureUnit.Celsius) >= 30) {
        color[1] = Colors.Red
    } else if (input.temperature(TemperatureUnit.Celsius) < 30 && input.temperature(TemperatureUnit.Celsius) > 25) {
        color[1] = Colors.Orange
    } else {
        color[1] = Colors.Green
    }
    for (let i = 0; i < 2; i++) {
        light.setPixelColor(5 + i, color[0])
        light.setPixelColor(8 + i, color[1])
        pause(10)
    }
    light.clear()
    screenTimeLeft()
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
        light.clear()
        screen = "heartbeat";
        screenHeartbeat();
    } else {
        changeTimer(false)
    }
})

// - timer
input.buttonB.onEvent(ButtonEvent.Click, function () {
    if (roomClosed) {
        screen = "tempSound";
        light.clear()
        for (let i = 0; i < 500; i++) {
            screenTempSound();
        }
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
