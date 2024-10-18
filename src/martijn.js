let measurements: number[] = []
let currentRate = 0;
let averageRate = 0;
let beats = 0;
let bpm = 0;

light.setBrightness(255);
light.setPixelColor(1, Colors.Green);

forever(function () {
    currentRate = input.lightLevel();
    measurements.push(currentRate);
    calculateAverage()
    pause(50)
    logger()
    if (measurements.length > 20) {
        measurements.removeAt(0)
    }
});

function logger() {
    console.log(`Current: ${currentRate}`)
    console.log(`Average: ${averageRate}`)
}

function calculateAverage() {
    let sum = 0;
    for (let i = 0; i < measurements.length; i++) {
        sum += measurements[i];
    }
    averageRate = sum / measurements.length;
}