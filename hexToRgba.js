const htr = require('hex-to-rgba')
const replacers = require('./dracula.qsv')

Object.keys(replacers).forEach(key => {
    console.log(`${key}[100%]: ${htr(replacers[key])}`)
    console.log(`${key}[50%]: ${htr(replacers[key], '.5')}`)
})