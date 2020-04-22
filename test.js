
 const {uid,trueObject} = require('./libs/utils')
// console.log(uid('soap'))
// console.log(uid('soap'))
// console.log(uid('soap'))

const SimpleOrder = require('./libs/simple-order/SimpleOrder')()
const so = new SimpleOrder({},true)
so.order()
