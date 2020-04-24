const {errorMessages} = require('./utils')

/**
 * - errors and messages
 * returns example : `{'001':{message,code},...}`
 */
module.exports = errorMessages({
    '500':['Server error','500'],
    '001':['SimpleOrder listStore is empty','001'],
    '002':['SimpleOrder offerSchema is empty','002'],
    '003':['requested get/basket order is empty','003'],
    '004':['query for /order is required, but it was empty','004'],
    '005':['query for /order when using optional {id}, you must specify numeric date, example: id=12345','005'],
    '006':['Sorry our store is out of stock!','006'],
    '007':['Store configuration error','007'],
    '008':['SimpleOrder updateOrder() combined request is empty or invalid','008'],
    '009':['SimpleOrder updateOrder() invalid entries in your order','009'],
    '010':['SimpleOrder updateOrder() sorry there was administration issue with your order, please contact sales','010'],
    '011':['SimpleOrder updateOrder() sorry but this order cannot be updated, because there was no initial order found','011']
})