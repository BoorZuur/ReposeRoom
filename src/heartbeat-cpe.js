// measures heart rate using light sensor
// and calculates BPM using peak detection
// logs BPM to console

let readings: number[] = [];
let beatTimes: number[] = [];
let lastBeatTime = 0;
let threshold = 0;
let windowSize = 20;
let beatWindow = 200; // Minimum time between beats (ms)

light.setBrightness(255);
light.setPixelColor(1, Colors.Green);

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

forever(function () {
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
                light.setPixelColor(7, Colors.Red);
                lastBeatTime = control.millis();
                beatTimes.push(lastBeatTime);

                // Calculate BPM
                if (beatTimes.length > 2) {
                    let recentBeats = beatTimes.slice(-3);
                    let averageInterval = (recentBeats[2] - recentBeats[0]) / 2;
                    let bpm = Math.round(60000 / averageInterval);
                    console.log("BPM: " + bpm);
                }
            }
        } else {
            light.setPixelColor(7, Colors.Black);
        }
    }

    pause(20);
});