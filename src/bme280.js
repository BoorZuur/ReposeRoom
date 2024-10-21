/* Code om de bme280 sensor uit te lezen.
BME280 LIB: https://github.com/ElectronicCats/pxt-bme280 */

bme280.setAddress(BME280_I2C_ADDRESS.ADDR_0x76)

forever(function () {
    console.log(`Hum: ${bme280.humidity()}`)
    console.log(`Temp: ${bme280.temperature()}`)
    console.log(`Pressure: ${bme280.pressure()}`)
    pause(1000)
})