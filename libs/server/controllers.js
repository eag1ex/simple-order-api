


module.exports = function (expressApp) {
const {isEmpty} = require('lodash')
const messages = require('../errors')    
const SimpleOrder = require('../simple-order/SimpleOrder')()

    return class ServerController {
        constructor(debug) {
            this.debug = debug
            this.simpleOrder = new SimpleOrder({},this.debug)

        }
        order(req, res) {
            const query = req.query
            if(isEmpty(query)){
                return res.status(200).json({ success: false, message: messages['004'][0], code:messages['004'][1] });
            }
            const o = this.simpleOrder.order()

            console.log('callin on order', req.query)
           // this.simpleOrder.order(id = "", order = {}) {
            return res.status(200).json({ success: true, message: 'works' });
        }
    }

}