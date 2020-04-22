


const {errorMessages} = require('./utils')

/**
 * - errors and messages
 * returns example : `{'001':{message,code},...}`
 */
module.exports = errorMessages({
    '001':['SimpleOrder listStore is empty',001],
    '002':['SimpleOrder offerSchema is empty',002],
    '003':['requested get/busket order is empty',003],
    '004':['query for /order is required, but it was empty',004]
})