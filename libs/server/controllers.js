


module.exports = function (expressApp) {
    const { timestamp,numDate } = require('../utils')
    const { isEmpty,unset } = require('lodash')
    const errorMessages = require('../errors')
    const SimpleOrder = require('../simple-order/SimpleOrder')()

    return class ServerController {
        constructor(debug) {
            this.debug = debug
            this.simpleOrder = new SimpleOrder({}, this.debug)
        }

        order(req, res) {
            let quote= req.query || {}
            console.log('callin on order', quote)

            if (isEmpty(quote)) {
                return res.status(200).json({ error: true, ...errorMessages['004'] });
            }
            // use provided id or generate new
            let id = quote.id ? quote.id:timestamp()
            unset(quote,'id')

            if(!numDate(id) && id){
                return res.status(200).json({ error: true, ...errorMessages['005'] });
            }
            const o = this.simpleOrder.order(id,quote)

            if (o.error) {
                return res.status(200).json({ ...o });
            }

            // this.simpleOrder.order(id = "", order = {}) {
            return res.status(200).json({ success: true, message: 'works', code: 200 });
        }
    }

}